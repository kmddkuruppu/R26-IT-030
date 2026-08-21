package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class GameSessionRequest {
    // From frontend: saveGameProgress({ gameId, score, maxScore })
    private String gameId;
    private Integer score;
    private Integer maxScore;

    // Optional extras sent per game
    private Integer timeSeconds;
    private Integer movesCount;
    private Integer questionCount;
}