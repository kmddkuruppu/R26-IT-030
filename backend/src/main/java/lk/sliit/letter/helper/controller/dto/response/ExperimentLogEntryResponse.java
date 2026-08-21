package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// NOTE: deliberately has no date/Instant/LocalDateTime field — only
// clientTimestampMs (a plain Long), to stay entirely clear of any JSON
// date-serialization dependency.
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
    private Double guideOpacityUsed;
    private Double kpTouchMultiplierUsed;
    private Double boundaryMultiplierUsed;
    private Integer warningCount;
    private Long durationMs;
}