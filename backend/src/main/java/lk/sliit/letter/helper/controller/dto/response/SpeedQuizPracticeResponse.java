package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SpeedQuizPracticeResponse {
    private Long id;
    private String targetLetter;
    private String confusedLetter;
    private Integer initialConfusionCount;
    private Integer practiceAttempts;
    private Integer correctAttempts;
    private Boolean mastered;
    private LocalDateTime completedAt;
}
