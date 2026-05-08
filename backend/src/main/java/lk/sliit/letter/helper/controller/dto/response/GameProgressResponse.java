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
public class GameProgressResponse {
    private Long id;
    private Long studentId;
    private String gameId;
    private String gameName;
    private Integer score;
    private Integer stars;
    private Integer percentage;
    private LocalDateTime playedAt;
}