package lk.sliit.letter.helper.controller.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExperimentLogEntryRequest {
    private String deviceId;
    private Long studentId;          // optional
    private Long clientTimestampMs;  // Date.now() from the browser
    private String mode;             // "adaptive" | "static"
    private String letter;
    private String category;
    private Integer score;
    private Double difficulty;       // optional, 0..1
    private Double guideOpacityUsed;
    private Double kpTouchMultiplierUsed;
    private Double boundaryMultiplierUsed;
    private Integer warningCount;
    private Long durationMs;
}