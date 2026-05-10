package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecognitionAttemptResponse {
    private Long id;
    private String sessionId;
    private String selectedLetter;
    private String recognizedLetter;
    private Integer confidence;
    private String inputType;
    private Integer points;
    private Boolean wasCorrect;
    private LocalDateTime attemptedAt;
}