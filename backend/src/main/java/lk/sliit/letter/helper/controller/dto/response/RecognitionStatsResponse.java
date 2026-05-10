package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecognitionStatsResponse {

    // Mirrors stats state in LetterRecognition.js:
    // { total, correct, streak, points }
    private String sessionId;
    private Integer totalAttempts;
    private Integer correctCount;
    private Integer currentStreak;
    private Integer totalPoints;

    // Derived
    private Integer accuracyPercent;
}