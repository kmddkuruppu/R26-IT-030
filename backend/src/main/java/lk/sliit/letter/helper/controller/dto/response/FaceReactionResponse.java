package lk.sliit.letter.helper.controller.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaceReactionResponse {
    private Long id;
    private String gameId;
    private String rawExpression;
    private String emoji;
    private String labelEn;
    private String labelSi;
    private String labelTa;
    private Double confidence;
    private LocalDateTime capturedAt;
}