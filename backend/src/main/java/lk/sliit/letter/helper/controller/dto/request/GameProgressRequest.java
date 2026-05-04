package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class GameProgressRequest {
    private Long studentId;
    private String gameId;
    private Integer score;
    private Integer maxScore;
}