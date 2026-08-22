package lk.sliit.letter.helper.controller.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameProgressResponse {
    private List<GameProgressItem> games;
    private Integer totalGamesPlayed;
    private Integer totalGamesAvailable;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameProgressItem {
        private String gameId;
        private Integer sessionsPlayed;
        private Integer bestScore;
        private Integer bestStars;
        private Long lastPlayedAt;
    }
}