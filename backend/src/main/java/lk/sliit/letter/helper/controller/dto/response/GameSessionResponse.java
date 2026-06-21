package lk.sliit.letter.helper.controller.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSessionResponse {
    private Long id;
    private String gameId;
    private String gameSection;
    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private Integer starsEarned;
    private Integer timeSeconds;
    private Integer movesCount;
    private Integer questionCount;
    private String resultLabel;
    private LocalDateTime playedAt;
    private String message;
}