package lk.sliit.letter.helper.controller.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExperimentLogEntryRequest {

    private String deviceId;
    private Long studentId;

    private Long clientTimestampMs;

    private String mode;
    private String letter;
    private String category;

    private Integer score;

    // Existing numeric adaptive difficulty value.
    private Double difficulty;

    // ── New research variables ──

    // Admin-defined letter difficulty:
    // "Easy" | "Medium" | "Hard"
    private String baseDifficulty;

    // Effective support:
    // "LOW" | "MEDIUM" | "HIGH"
    private String supportLevel;

    // Average score that caused the current adaptive support.
    // Null when no previous valid attempts exist or in Static Mode.
    private Double recentAverageScore;

    // Number of valid previous attempts used:
    // 0, 1, 2 or 3.
    private Integer recentAttemptCount;

    // "manual_check" | "auto_complete"
    private String attemptType;

    // True when this row represents an ended/submitted attempt.
    private Boolean completed;

    // Logged in case the research protocol later allows
    // guide/keypoint visibility controls.
    private Boolean guideVisible;
    private Boolean keypointsVisible;

    private Double guideOpacityUsed;
    private Double kpTouchMultiplierUsed;
    private Double boundaryMultiplierUsed;

    private Integer warningCount;
    private Long durationMs;
}