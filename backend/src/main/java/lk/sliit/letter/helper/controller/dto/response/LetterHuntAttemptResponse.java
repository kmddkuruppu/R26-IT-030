package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LetterHuntAttemptResponse {

    private Long id;

    private String targetLetter;

    private String selectedLetter;

    private Boolean correct;

    private LocalDateTime attemptedAt;
}