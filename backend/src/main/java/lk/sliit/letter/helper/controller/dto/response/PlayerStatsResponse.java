package lk.sliit.letter.helper.controller.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStatsResponse {
    // Matches frontend stat cards exactly
    private Integer totalScore;       // t.totalScore
    private Integer totalStars;       // t.starsEarned
    private Integer badgeCount;       // t.badges (achievements.length)
    private List<Integer> last7Scores; // chartBars — score trend

    // Game history
    private List<GameSessionResponse> recentSessions;

    // Mood history (matches frontend moodHistory state)
    private List<MoodHistoryItem> moodHistory;

    // Achievement list
    private List<AchievementItem> achievements;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoodHistoryItem {
        private String emoji;
        private String si;
        private String ta;
        private String en;
        private String game;
        private Long time;  // epoch millis — matches frontend Date.now()
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementItem {
        private String achievementType;
        private String achievementTitle;
        private String description;
        private Long earnedAt;
    }
}