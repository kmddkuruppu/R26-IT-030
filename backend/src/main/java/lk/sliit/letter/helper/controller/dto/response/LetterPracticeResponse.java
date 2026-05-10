package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LetterPracticeResponse {

    // getLetterPracticeHistory() response
    private String letter;
    private Long totalAttempts;
    private Long correctCount;
    private Integer accuracyPercent;
}