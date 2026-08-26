package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceReactionLogResponse {

    private Long id;
    private String gameId;
    private Long gameSessionId;
    private LocalDateTime capturedAt;
    private Integer engagementScore;
    private String dominantEmotion;
    private Double confidence;
}