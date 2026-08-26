package lk.sliit.letter.helper.controller.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStatsResponse {
    // Matches frontend stat cards exactly
    private Integer totalScore;        // t.totalScore
    private Integer totalStars;        // t.starsEarned
    private Integer badgeCount;        // t.badges (achievements.length)
    private List<Integer> last7Scores; // chartBars — score trend

    // NEW — current daily play streak (used by STREAK_DAYS achievements
    // and can be shown in the UI, e.g. "🔥 3 day streak")
    private Integer currentStreakDays;

    // Game history
    private List<GameSessionResponse> recentSessions;

    // Mood history (matches frontend moodHistory state)
    private List<MoodHistoryItem> moodHistory;

    // Achievements the student has EARNED (unchanged shape, plus new fields)
    private List<AchievementItem> achievements;

    // NEW — the FULL achievement catalog (earned + still-locked), so the
    // frontend can show "🔒 locked" cards for badges the student hasn't
    // gotten yet. Optional — only populate if you add the catalog endpoint.
    private List<AchievementItem> achievementCatalog;

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
        private String achievementType;   // = AchievementDefinition.code
        private String achievementTitle;  // English title (kept for backward compat)
        private String description;       // English description (kept for backward compat)
        private Long earnedAt;            // null if not yet earned (used in catalog)

        // NEW — richer display data
        private String titleSi;
        private String descriptionSi;
        private String icon;
        private String tier;
        private boolean earned;           // true for `achievements`, may be false in `achievementCatalog`
    }
}
