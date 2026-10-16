package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class SpeedQuizPracticeRequest {
    private String targetLetter;
    private String confusedLetter;
    private Integer initialConfusionCount;
    private Integer practiceAttempts;
    private Integer correctAttempts;
    private Boolean mastered;
}
