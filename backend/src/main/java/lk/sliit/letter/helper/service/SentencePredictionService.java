package lk.sliit.letter.helper.service;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.HashMap;
import java.util.Map;

@Service
public class SentencePredictionService {

    private static final String MODEL_RESOURCE =
            "models/best_sinhala_crnn.onnx";

    private static final String MODEL_DATA_RESOURCE =
            "models/best_sinhala_crnn.onnx.data";

    private static final String VOCAB_RESOURCE =
            "models/sinhala_sentence_vocab.json";

    private static final int IMAGE_HEIGHT = 64;
    private static final int IMAGE_WIDTH = 1024;
    private static final int BLANK_INDEX = 0;
    private static final int NUM_CLASSES = 60;

    private OrtEnvironment environment;
    private OrtSession session;

    private final Map<Integer, String> idxToChar =
            new HashMap<>();


    @PostConstruct
    public void initialize() throws Exception {

        environment = OrtEnvironment.getEnvironment();

        /*
         * The sentence ONNX model uses an external data file.
         * Therefore both files must be copied into the same
         * temporary directory using their original names.
         */
        Path tempDirectory =
                Files.createTempDirectory(
                        "sinhala_sentence_model_"
                );

        tempDirectory.toFile().deleteOnExit();

        Path tempModel =
                tempDirectory.resolve(
                        "best_sinhala_crnn.onnx"
                );

        Path tempModelData =
                tempDirectory.resolve(
                        "best_sinhala_crnn.onnx.data"
                );

        tempModel.toFile().deleteOnExit();
        tempModelData.toFile().deleteOnExit();

        ClassPathResource modelResource =
                new ClassPathResource(
                        MODEL_RESOURCE
                );

        ClassPathResource modelDataResource =
                new ClassPathResource(
                        MODEL_DATA_RESOURCE
                );

        try (
                InputStream inputStream =
                        modelResource.getInputStream()
        ) {
            Files.copy(
                    inputStream,
                    tempModel,
                    StandardCopyOption.REPLACE_EXISTING
            );
        }

        try (
                InputStream inputStream =
                        modelDataResource.getInputStream()
        ) {
            Files.copy(
                    inputStream,
                    tempModelData,
                    StandardCopyOption.REPLACE_EXISTING
            );
        }

        loadVocabulary();

        OrtSession.SessionOptions options =
                new OrtSession.SessionOptions();

        session = environment.createSession(
                tempModel.toAbsolutePath().toString(),
                options
        );

        System.out.println(
                "Sinhala sentence ONNX model loaded successfully."
        );

        System.out.println(
                "Sentence model input names: "
                        + session.getInputNames()
        );

        System.out.println(
                "Sentence model output names: "
                        + session.getOutputNames()
        );

        System.out.println(
                "Sentence vocabulary size: "
                        + idxToChar.size()
        );
    }


    private void loadVocabulary() throws Exception {

        ClassPathResource vocabResource =
                new ClassPathResource(
                        VOCAB_RESOURCE
                );

        ObjectMapper objectMapper =
                new ObjectMapper();

        JsonNode root;

        try (
                InputStream inputStream =
                        vocabResource.getInputStream()
        ) {
            root = objectMapper.readTree(
                    inputStream
            );
        }

        int blankIndex =
                root.path("blank_idx").asInt(-1);

        int numClasses =
                root.path("num_classes").asInt(-1);

        if (blankIndex != BLANK_INDEX) {
            throw new IllegalStateException(
                    "Unexpected CTC blank index: "
                            + blankIndex
            );
        }

        if (numClasses != NUM_CLASSES) {
            throw new IllegalStateException(
                    "Unexpected sentence model class count: "
                            + numClasses
            );
        }

        JsonNode mapping =
                root.path("idx_to_char");

        if (!mapping.isObject()) {
            throw new IllegalStateException(
                    "Invalid sentence vocabulary."
            );
        }

        idxToChar.clear();

        mapping.fields().forEachRemaining(
                entry -> {
                    int index =
                            Integer.parseInt(
                                    entry.getKey()
                            );

                    String character =
                            entry.getValue().asText();

                    idxToChar.put(
                            index,
                            character
                    );
                }
        );

        if (idxToChar.size()
                != NUM_CLASSES - 1) {

            throw new IllegalStateException(
                    "Unexpected vocabulary size: "
                            + idxToChar.size()
            );
        }
    }


    public PredictionResult predictImage(
            MultipartFile imageFile
    ) throws Exception {

        if (imageFile == null
                || imageFile.isEmpty()) {

            throw new IllegalArgumentException(
                    "Image file is required."
            );
        }

        BufferedImage originalImage =
                ImageIO.read(
                        imageFile.getInputStream()
                );

        if (originalImage == null) {

            throw new IllegalArgumentException(
                    "Invalid or unsupported image file."
            );
        }

        float[][][][] input =
                preprocessImage(
                        originalImage
                );

        float[][] logits =
                predict(input);

        String predictedText =
                ctcDecode(logits);

        return new PredictionResult(
                predictedText
        );
    }


    private float[][][][] preprocessImage(
            BufferedImage originalImage
    ) {

        int originalWidth =
                originalImage.getWidth();

        int originalHeight =
                originalImage.getHeight();

        if (originalWidth <= 0
                || originalHeight <= 0) {

            throw new IllegalArgumentException(
                    "Invalid image dimensions."
            );
        }

        /*
         * Same resize rule used during training:
         *
         * newWidth =
         * originalWidth * 64 / originalHeight
         *
         * Width is capped at 1024.
         */
        int newWidth =
                (int) (
                        (double) originalWidth
                                * IMAGE_HEIGHT
                                / originalHeight
                );

        newWidth =
                Math.max(
                        1,
                        Math.min(
                                newWidth,
                                IMAGE_WIDTH
                        )
                );

        BufferedImage resizedImage =
                new BufferedImage(
                        newWidth,
                        IMAGE_HEIGHT,
                        BufferedImage.TYPE_BYTE_GRAY
                );

        Graphics2D graphics =
                resizedImage.createGraphics();

        try {

            /*
             * Java does not provide PIL LANCZOS directly.
             * Bicubic interpolation is used here as the
             * closest standard high-quality approximation.
             */
            graphics.setRenderingHint(
                    RenderingHints.KEY_INTERPOLATION,
                    RenderingHints.VALUE_INTERPOLATION_BICUBIC
            );

            graphics.setRenderingHint(
                    RenderingHints.KEY_RENDERING,
                    RenderingHints.VALUE_RENDER_QUALITY
            );

            graphics.drawImage(
                    originalImage,
                    0,
                    0,
                    newWidth,
                    IMAGE_HEIGHT,
                    null
            );

        } finally {
            graphics.dispose();
        }

        /*
         * Training preprocessing uses a white
         * 1024 x 64 canvas and places the resized
         * image at the top-left corner.
         */
        BufferedImage canvas =
                new BufferedImage(
                        IMAGE_WIDTH,
                        IMAGE_HEIGHT,
                        BufferedImage.TYPE_BYTE_GRAY
                );

        Graphics2D canvasGraphics =
                canvas.createGraphics();

        try {

            canvasGraphics.setColor(
                    Color.WHITE
            );

            canvasGraphics.fillRect(
                    0,
                    0,
                    IMAGE_WIDTH,
                    IMAGE_HEIGHT
            );

            canvasGraphics.drawImage(
                    resizedImage,
                    0,
                    0,
                    null
            );

        } finally {
            canvasGraphics.dispose();
        }

        float[][][][] input =
                new float[1][1]
                        [IMAGE_HEIGHT]
                        [IMAGE_WIDTH];

        for (
                int y = 0;
                y < IMAGE_HEIGHT;
                y++
        ) {

            for (
                    int x = 0;
                    x < IMAGE_WIDTH;
                    x++
            ) {

                int gray =
                        canvas
                                .getRaster()
                                .getSample(
                                        x,
                                        y,
                                        0
                                );

                /*
                 * Notebook preprocessing:
                 *
                 * image = image / 255.0
                 * image = 1.0 - image
                 */
                float normalized =
                        gray / 255.0f;

                input[0][0][y][x] =
                        1.0f - normalized;
            }
        }

        return input;
    }


    public float[][] predict(
            float[][][][] input
    ) throws Exception {

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

            Object output =
                    result.get(0).getValue();

            if (!(output
                    instanceof float[][][] logits)) {

                throw new IllegalStateException(
                        "Unexpected sentence ONNX output type."
                );
            }

            /*
             * Expected ONNX output:
             *
             * [1][256][60]
             *
             * Return first batch:
             * [256][60]
             */
            return logits[0];
        }
    }


    private String ctcDecode(
            float[][] logits
    ) {

        StringBuilder decoded =
                new StringBuilder();

        int previousIndex =
                BLANK_INDEX;

        for (float[] timeStep : logits) {

            if (timeStep.length
                    != NUM_CLASSES) {

                throw new IllegalStateException(
                        "Unexpected sentence model output class count: "
                                + timeStep.length
                );
            }

            int currentIndex = 0;

            for (
                    int i = 1;
                    i < timeStep.length;
                    i++
            ) {

                if (timeStep[i]
                        > timeStep[currentIndex]) {

                    currentIndex = i;
                }
            }

            /*
             * Exact greedy CTC decoding rule
             * used by the training notebook:
             *
             * 1. Ignore blank index 0.
             * 2. Ignore consecutive duplicate indices.
             * 3. Always update previousIndex,
             *    including when current index is blank.
             *
             * Therefore:
             *
             * ක, blank, ක
             *
             * correctly becomes:
             *
             * කක
             */
            if (
                    currentIndex
                            != BLANK_INDEX
                            &&
                            currentIndex
                                    != previousIndex
            ) {

                String character =
                        idxToChar.get(
                                currentIndex
                        );

                if (character == null) {

                    throw new IllegalStateException(
                            "No character mapping for index: "
                                    + currentIndex
                    );
                }

                decoded.append(
                        character
                );
            }

            previousIndex =
                    currentIndex;
        }

        return decoded.toString();
    }


    @PreDestroy
    public void shutdown()
            throws Exception {

        if (session != null) {
            session.close();
        }

        /*
         * OrtEnvironment.getEnvironment()
         * returns the shared ONNX Runtime environment.
         *
         * The existing single-letter service also uses
         * this environment, therefore we intentionally
         * do not close the shared environment here.
         */
    }


    public record PredictionResult(
            String predictedText
    ) {
    }
}