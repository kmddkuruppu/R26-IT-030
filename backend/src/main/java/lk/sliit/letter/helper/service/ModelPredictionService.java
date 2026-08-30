package lk.sliit.letter.helper.service;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Collections;

@Service
public class ModelPredictionService {

    private static final String MODEL_RESOURCE = "models/final_model.onnx";
    private static final int IMAGE_SIZE = 80;

    private static final String[] CLASSES = {
            "a", "ae", "ba", "cha", "da", "e", "ee",
            "ga", "ha", "ka", "khha", "la", "na", "o",
            "pa", "ra", "sa", "tha", "thha", "u", "wa", "ya"
    };

    private OrtEnvironment environment;
    private OrtSession session;

    @PostConstruct
    public void initialize() throws Exception {
        environment = OrtEnvironment.getEnvironment();

        ClassPathResource resource =
                new ClassPathResource(MODEL_RESOURCE);

        Path tempModel =
                Files.createTempFile("final_model_", ".onnx");

        tempModel.toFile().deleteOnExit();

        try (InputStream inputStream = resource.getInputStream()) {
            Files.copy(
                    inputStream,
                    tempModel,
                    StandardCopyOption.REPLACE_EXISTING
            );
        }

        OrtSession.SessionOptions options =
                new OrtSession.SessionOptions();

        session = environment.createSession(
                tempModel.toAbsolutePath().toString(),
                options
        );

        System.out.println("ONNX model loaded successfully.");
        System.out.println("Model input names: " + session.getInputNames());
        System.out.println("Model output names: " + session.getOutputNames());
    }

    public PredictionResult predictImage(MultipartFile imageFile)
            throws Exception {

        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException(
                    "Image file is required."
            );
        }

        BufferedImage originalImage =
                ImageIO.read(imageFile.getInputStream());

        if (originalImage == null) {
            throw new IllegalArgumentException(
                    "Invalid or unsupported image file."
            );
        }

        BufferedImage resizedImage =
                new BufferedImage(
                        IMAGE_SIZE,
                        IMAGE_SIZE,
                        BufferedImage.TYPE_BYTE_GRAY
                );

        Graphics2D graphics = resizedImage.createGraphics();

        try {
            graphics.setRenderingHint(
                    RenderingHints.KEY_INTERPOLATION,
                    RenderingHints.VALUE_INTERPOLATION_BILINEAR
            );

            graphics.drawImage(
                    originalImage,
                    0,
                    0,
                    IMAGE_SIZE,
                    IMAGE_SIZE,
                    null
            );
        } finally {
            graphics.dispose();
        }

        float[][][][] input =
                new float[1][1][IMAGE_SIZE][IMAGE_SIZE];

        for (int y = 0; y < IMAGE_SIZE; y++) {
            for (int x = 0; x < IMAGE_SIZE; x++) {

                int gray = resizedImage
                        .getRaster()
                        .getSample(x, y, 0);

                float value = gray / 255.0f;

                input[0][0][y][x] =
                        (value - 0.5f) / 0.5f;
            }
        }

        float[] logits = predict(input);
        float[] probabilities = softmax(logits);

        int predictedIndex = 0;

        for (int i = 1; i < probabilities.length; i++) {
            if (probabilities[i] >
                    probabilities[predictedIndex]) {
                predictedIndex = i;
            }
        }

        if (predictedIndex >= CLASSES.length) {
            throw new IllegalStateException(
                    "Predicted class index is out of range."
            );
        }

        return new PredictionResult(
                CLASSES[predictedIndex],
                probabilities[predictedIndex],
                predictedIndex
        );
    }

    public float[] predict(float[][][][] input)
            throws Exception {

        try (
                OnnxTensor inputTensor =
                        OnnxTensor.createTensor(
                                environment,
                                input
                        );

                OrtSession.Result result =
                        session.run(
                                Collections.singletonMap(
                                        "input",
                                        inputTensor
                                )
                        )
        ) {

            Object output = result.get(0).getValue();

            if (!(output instanceof float[][] logits)) {
                throw new IllegalStateException(
                        "Unexpected ONNX output type."
                );
            }

            return logits[0];
        }
    }

    private float[] softmax(float[] logits) {

        float max = Float.NEGATIVE_INFINITY;

        for (float value : logits) {
            if (value > max) {
                max = value;
            }
        }

        double sum = 0.0;
        double[] exponentials =
                new double[logits.length];

        for (int i = 0; i < logits.length; i++) {
            exponentials[i] =
                    Math.exp(logits[i] - max);

            sum += exponentials[i];
        }

        float[] probabilities =
                new float[logits.length];

        for (int i = 0; i < logits.length; i++) {
            probabilities[i] =
                    (float) (exponentials[i] / sum);
        }

        return probabilities;
    }

    @PreDestroy
    public void shutdown() throws Exception {

        if (session != null) {
            session.close();
        }

        if (environment != null) {
            environment.close();
        }
    }

    public record PredictionResult(
            String predictedClass,
            float confidence,
            int classIndex
    ) {
    }
}