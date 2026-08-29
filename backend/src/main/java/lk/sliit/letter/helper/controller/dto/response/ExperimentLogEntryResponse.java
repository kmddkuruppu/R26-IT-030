package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperimentLogEntryResponse {

    private Long id;

    private String deviceId;
    private Long studentId;

    private Long clientTimestampMs;

    private String mode;
    private String letter;
    private String category;

    private Integer score;

    private Double difficulty;

    private String baseDifficulty;
    private String supportLevel;

    private Double recentAverageScore;
    private Integer recentAttemptCount;

    private String attemptType;
    private Boolean completed;

    private Boolean guideVisible;
    private Boolean keypointsVisible;

    private Double guideOpacityUsed;
    private Double kpTouchMultiplierUsed;
    private Double boundaryMultiplierUsed;

    private Integer warningCount;
    private Long durationMs;
}