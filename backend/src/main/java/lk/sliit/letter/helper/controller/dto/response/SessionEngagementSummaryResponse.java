package lk.sliit.letter.helper.controller.dto.response;

import lombok.Data;

import java.util.Map;

@Data
public class SessionEngagementSummaryResponse {

    private Long gameSessionId;
    private String gameId;
    private Double averageEngagementScore;
    private Integer peakEngagementScore;
    private Integer lowestEngagementScore;
    private String dominantEmotionOverall;
    private Map<String, Long> emotionBreakdown; // emotion label -> count of data points
    private Integer totalDataPoints;
}