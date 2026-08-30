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
import java.awt.image.WritableRaster;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Collections;
import java.util.Queue;

@Service
public class ModelPredictionService {

    private static final String MODEL_RESOURCE =
            "models/final_model.onnx";

    private static final int IMAGE_SIZE = 80;

    private static final double MIN_BLOB_FRAC = 0.01;
    private static final double PAD_FRAC = 0.05;

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
        System.out.println(
                "Model input names: " + session.getInputNames()
        );
        System.out.println(
                "Model output names: " + session.getOutputNames()
        );
    }

    public PredictionResult predictImage(
            MultipartFile imageFile
    ) throws Exception {

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

        /*
         * Apply the same style of preprocessing used
         * for the training dataset:
         *
         * 1. Grayscale
         * 2. Min-max normalization
         * 3. Background inversion when required
         * 4. Otsu thresholding
         * 5. Small residue removal
         * 6. Foreground crop
         * 7. Square padding
         * 8. Resize to 80x80
         * 9. Final normalization
         */
        BufferedImage resizedImage =
                preprocessImage(originalImage);

        float[][][][] input =
                new float[1][1][IMAGE_SIZE][IMAGE_SIZE];

        for (int y = 0; y < IMAGE_SIZE; y++) {

            for (int x = 0; x < IMAGE_SIZE; x++) {

                int gray =
                        resizedImage
                                .getRaster()
                                .getSample(x, y, 0);

                float value =
                        gray / 255.0f;

                /*
                 * Same model input normalization
                 * used previously:
                 *
                 * 0..1 -> -1..1
                 */
                input[0][0][y][x] =
                        (value - 0.5f) / 0.5f;
            }
        }

        float[] logits =
                predict(input);

        float[] probabilities =
                softmax(logits);

        int predictedIndex = 0;

        for (int i = 1;
             i < probabilities.length;
             i++) {

            if (probabilities[i]
                    > probabilities[predictedIndex]) {

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

    /**
     * Preprocess an uploaded raw Sinhala letter image
     * into the format expected by the recognition model.
     */
    private BufferedImage preprocessImage(
            BufferedImage originalImage
    ) {

        int width =
                originalImage.getWidth();

        int height =
                originalImage.getHeight();

        /*
         * ---------------------------------------------------------
         * STEP 1 - Convert to grayscale
         * ---------------------------------------------------------
         */
        double[][] gray =
                new double[height][width];

        double minValue =
                Double.MAX_VALUE;

        double maxValue =
                Double.MIN_VALUE;

        for (int y = 0; y < height; y++) {

            for (int x = 0; x < width; x++) {

                Color color =
                        new Color(
                                originalImage.getRGB(x, y)
                        );

                double grayValue =
                        0.299 * color.getRed()
                                + 0.587 * color.getGreen()
                                + 0.114 * color.getBlue();

                gray[y][x] =
                        grayValue;

                minValue =
                        Math.min(minValue, grayValue);

                maxValue =
                        Math.max(maxValue, grayValue);
            }
        }

        /*
         * ---------------------------------------------------------
         * STEP 2 - Min-max normalization to 0..255
         * ---------------------------------------------------------
         */
        double range =
                maxValue - minValue;

        if (range < 1e-6) {
            range = 1.0;
        }

        for (int y = 0; y < height; y++) {

            for (int x = 0; x < width; x++) {

                gray[y][x] =
                        ((gray[y][x] - minValue)
                                / range)
                                * 255.0;
            }
        }

        /*
         * ---------------------------------------------------------
         * STEP 3 - Median check and inversion
         *
         * Training preprocessing expects:
         * letter = bright
         * background = dark
         * ---------------------------------------------------------
         */
        double[] flattened =
                new double[width * height];

        int position = 0;

        for (int y = 0; y < height; y++) {

            for (int x = 0; x < width; x++) {

                flattened[position++] =
                        gray[y][x];
            }
        }

        Arrays.sort(flattened);

        double median;

        if (flattened.length % 2 == 0) {

            int middle =
                    flattened.length / 2;

            median =
                    (flattened[middle - 1]
                            + flattened[middle])
                            / 2.0;

        } else {

            median =
                    flattened[
                            flattened.length / 2
                            ];
        }

        if (median > 127.0) {

            for (int y = 0; y < height; y++) {

                for (int x = 0; x < width; x++) {

                    gray[y][x] =
                            255.0 - gray[y][x];
                }
            }
        }

        /*
         * ---------------------------------------------------------
         * STEP 4 - Otsu threshold
         * ---------------------------------------------------------
         */
        int otsuThreshold =
                calculateOtsuThreshold(gray);

        boolean[][] mask =
                new boolean[height][width];

        for (int y = 0; y < height; y++) {

            for (int x = 0; x < width; x++) {

                mask[y][x] =
                        gray[y][x]
                                > otsuThreshold;
            }
        }

        /*
         * ---------------------------------------------------------
         * STEP 5 - Remove small disconnected blobs
         * ---------------------------------------------------------
         */
        boolean[][] cleanMask =
                removeSmallBlobs(
                        mask,
                        MIN_BLOB_FRAC
                );

        for (int y = 0; y < height; y++) {

            for (int x = 0; x < width; x++) {

                if (!cleanMask[y][x]) {
                    gray[y][x] = 0.0;
                }
            }
        }

        /*
         * ---------------------------------------------------------
         * STEP 6 - Find foreground bounding box
         * ---------------------------------------------------------
         */
        int minX = width;
        int maxX = -1;
        int minY = height;
        int maxY = -1;

        for (int y = 0; y < height; y++) {

            for (int x = 0; x < width; x++) {

                if (cleanMask[y][x]) {

                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);

                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        double[][] cropped;

        if (maxX >= minX
                && maxY >= minY) {

            int padding =
                    (int) (
                            PAD_FRAC
                                    * Math.max(
                                    width,
                                    height
                            )
                    );

            minX =
                    Math.max(
                            minX - padding,
                            0
                    );

            maxX =
                    Math.min(
                            maxX + padding,
                            width - 1
                    );

            minY =
                    Math.max(
                            minY - padding,
                            0
                    );

            maxY =
                    Math.min(
                            maxY + padding,
                            height - 1
                    );

            int croppedWidth =
                    maxX - minX + 1;

            int croppedHeight =
                    maxY - minY + 1;

            cropped =
                    new double[
                            croppedHeight
                            ][
                            croppedWidth
                            ];

            for (int y = 0;
                 y < croppedHeight;
                 y++) {

                for (int x = 0;
                     x < croppedWidth;
                     x++) {

                    cropped[y][x] =
                            gray[
                                    minY + y
                                    ][
                                    minX + x
                                    ];
                }
            }

        } else {

            cropped = gray;
        }

        /*
         * ---------------------------------------------------------
         * STEP 7 - Square padding
         * ---------------------------------------------------------
         */
        int croppedHeight =
                cropped.length;

        int croppedWidth =
                cropped[0].length;

        int side =
                Math.max(
                        croppedHeight,
                        croppedWidth
                );

        BufferedImage squareImage =
                new BufferedImage(
                        side,
                        side,
                        BufferedImage.TYPE_BYTE_GRAY
                );

        WritableRaster squareRaster =
                squareImage.getRaster();

        int xOffset =
                (side - croppedWidth) / 2;

        int yOffset =
                (side - croppedHeight) / 2;

        /*
         * Background remains black.
         */
        for (int y = 0;
             y < croppedHeight;
             y++) {

            for (int x = 0;
                 x < croppedWidth;
                 x++) {

                int value =
                        (int) Math.round(
                                cropped[y][x]
                        );

                value =
                        Math.max(
                                0,
                                Math.min(255, value)
                        );

                squareRaster.setSample(
                        x + xOffset,
                        y + yOffset,
                        0,
                        value
                );
            }
        }

        /*
         * ---------------------------------------------------------
         * STEP 8 - Resize to 80x80
         *
         * Java does not provide Pillow's LANCZOS directly.
         * Bicubic interpolation is used here as the closest
         * high-quality built-in equivalent.
         * ---------------------------------------------------------
         */
        BufferedImage resizedImage =
                new BufferedImage(
                        IMAGE_SIZE,
                        IMAGE_SIZE,
                        BufferedImage.TYPE_BYTE_GRAY
                );

        Graphics2D graphics =
                resizedImage.createGraphics();

        try {

            graphics.setRenderingHint(
                    RenderingHints.KEY_INTERPOLATION,
                    RenderingHints.VALUE_INTERPOLATION_BICUBIC
            );

            graphics.setRenderingHint(
                    RenderingHints.KEY_RENDERING,
                    RenderingHints.VALUE_RENDER_QUALITY
            );

            graphics.setRenderingHint(
                    RenderingHints.KEY_ANTIALIASING,
                    RenderingHints.VALUE_ANTIALIAS_ON
            );

            graphics.drawImage(
                    squareImage,
                    0,
                    0,
                    IMAGE_SIZE,
                    IMAGE_SIZE,
                    null
            );

        } finally {

            graphics.dispose();
        }

        /*
         * ---------------------------------------------------------
         * STEP 9 - Final min-max normalization
         * ---------------------------------------------------------
         */
        WritableRaster raster =
                resizedImage.getRaster();

        int outputMin =
                255;

        int outputMax =
                0;

        for (int y = 0;
             y < IMAGE_SIZE;
             y++) {

            for (int x = 0;
                 x < IMAGE_SIZE;
                 x++) {

                int value =
                        raster.getSample(
                                x,
                                y,
                                0
                        );

                outputMin =
                        Math.min(
                                outputMin,
                                value
                        );

                outputMax =
                        Math.max(
                                outputMax,
                                value
                        );
            }
        }

        double outputRange =
                outputMax - outputMin;

        if (outputRange > 1e-6) {

            for (int y = 0;
                 y < IMAGE_SIZE;
                 y++) {

                for (int x = 0;
                     x < IMAGE_SIZE;
                     x++) {

                    int value =
                            raster.getSample(
                                    x,
                                    y,
                                    0
                            );

                    int normalized =
                            (int) Math.round(
                                    ((value - outputMin)
                                            / outputRange)
                                            * 255.0
                            );

                    normalized =
                            Math.max(
                                    0,
                                    Math.min(
                                            255,
                                            normalized
                                    )
                            );

                    raster.setSample(
                            x,
                            y,
                            0,
                            normalized
                    );
                }
            }
        }

        return resizedImage;
    }

    /**
     * Calculate an Otsu threshold for a grayscale image.
     */
    private int calculateOtsuThreshold(
            double[][] gray
    ) {

        int[] histogram =
                new int[256];

        int height =
                gray.length;

        int width =
                gray[0].length;

        for (int y = 0; y < height; y++) {

            for (int x = 0; x < width; x++) {

                int value =
                        (int) Math.round(
                                gray[y][x]
                        );

                value =
                        Math.max(
                                0,
                                Math.min(255, value)
                        );

                histogram[value]++;
            }
        }

        int total =
                width * height;

        double totalSum =
                0.0;

        for (int i = 0;
             i < 256;
             i++) {

            totalSum +=
                    i * histogram[i];
        }

        int backgroundWeight = 0;

        double backgroundSum =
                0.0;

        double maximumVariance =
                -1.0;

        int threshold =
                0;

        for (int i = 0;
             i < 256;
             i++) {

            backgroundWeight +=
                    histogram[i];

            if (backgroundWeight == 0) {
                continue;
            }

            int foregroundWeight =
                    total - backgroundWeight;

            if (foregroundWeight == 0) {
                break;
            }

            backgroundSum +=
                    (double) i
                            * histogram[i];

            double backgroundMean =
                    backgroundSum
                            / backgroundWeight;

            double foregroundMean =
                    (totalSum
                            - backgroundSum)
                            / foregroundWeight;

            double difference =
                    backgroundMean
                            - foregroundMean;

            double varianceBetween =
                    (double) backgroundWeight
                            * foregroundWeight
                            * difference
                            * difference;

            if (varianceBetween
                    > maximumVariance) {

                maximumVariance =
                        varianceBetween;

                threshold =
                        i;
            }
        }

        return threshold;
    }

    /**
     * Remove foreground connected components smaller
     * than minBlobFraction of the whole image.
     */
    private boolean[][] removeSmallBlobs(
            boolean[][] mask,
            double minBlobFraction
    ) {

        int height =
                mask.length;

        int width =
                mask[0].length;

        boolean[][] visited =
                new boolean[height][width];

        boolean[][] cleanMask =
                new boolean[height][width];

        int minimumBlobSize =
                (int) Math.ceil(
                        minBlobFraction
                                * width
                                * height
                );

        int[][] directions = {
                {-1, 0},
                {1, 0},
                {0, -1},
                {0, 1}
        };

        for (int y = 0;
             y < height;
             y++) {

            for (int x = 0;
                 x < width;
                 x++) {

                if (!mask[y][x]
                        || visited[y][x]) {

                    continue;
                }

                Queue<Point> queue =
                        new ArrayDeque<>();

                Queue<Point> component =
                        new ArrayDeque<>();

                Point start =
                        new Point(x, y);

                queue.add(start);
                visited[y][x] = true;

                while (!queue.isEmpty()) {

                    Point current =
                            queue.remove();

                    component.add(current);

                    for (int[] direction
                            : directions) {

                        int newX =
                                current.x
                                        + direction[0];

                        int newY =
                                current.y
                                        + direction[1];

                        if (newX < 0
                                || newX >= width
                                || newY < 0
                                || newY >= height) {

                            continue;
                        }

                        if (mask[newY][newX]
                                && !visited[newY][newX]) {

                            visited[newY][newX] =
                                    true;

                            queue.add(
                                    new Point(
                                            newX,
                                            newY
                                    )
                            );
                        }
                    }
                }

                if (component.size()
                        >= minimumBlobSize) {

                    for (Point point
                            : component) {

                        cleanMask[
                                point.y
                                ][
                                point.x
                                ] = true;
                    }
                }
            }
        }

        return cleanMask;
    }

    public float[] predict(
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
                    instanceof float[][] logits)) {

                throw new IllegalStateException(
                        "Unexpected ONNX output type."
                );
            }

            return logits[0];
        }
    }

    private float[] softmax(
            float[] logits
    ) {

        float max =
                Float.NEGATIVE_INFINITY;

        for (float value : logits) {

            if (value > max) {
                max = value;
            }
        }

        double sum =
                0.0;

        double[] exponentials =
                new double[logits.length];

        for (int i = 0;
             i < logits.length;
             i++) {

            exponentials[i] =
                    Math.exp(
                            logits[i] - max
                    );

            sum +=
                    exponentials[i];
        }

        float[] probabilities =
                new float[logits.length];

        for (int i = 0;
             i < logits.length;
             i++) {

            probabilities[i] =
                    (float) (
                            exponentials[i]
                                    / sum
                    );
        }

        return probabilities;
    }

    @PreDestroy
    public void shutdown()
            throws Exception {

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