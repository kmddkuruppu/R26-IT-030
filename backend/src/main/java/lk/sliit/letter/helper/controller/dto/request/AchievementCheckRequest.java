package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class AchievementCheckRequest {
    // From frontend: checkAndEarnAchievements({ gameType, score, totalScore })
    private String gameType;
    private Integer score;
    private Integer totalScore;
}