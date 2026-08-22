package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// ═══════════════════════════════════════════════════════════════════
// NEW TABLE — achievement_definitions
//
// This does NOT replace PlayerAchievement. It sits ALONGSIDE it:
//   - AchievementDefinition = the RULE ("earn 500 points" / icon / bilingual name)
//   - PlayerAchievement     = the RECORD that a student actually earned it
//                             (unchanged — still has achievementType as a
//                              plain string, which now matches this.code)
//
// This lets you manage achievements from the Admin Panel instead of
// editing Java code + redeploying every time you want a new badge.
// ═══════════════════════════════════════════════════════════════════
@Entity
@Table(name = "achievement_definitions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementDefinition {

    public enum CriteriaType {
        TOTAL_SCORE,        // total score across all games >= criteriaValue
        GAME_MASTERY,       // best stars in criteriaGameId >= criteriaValue (usually 3)
        GAMES_EXPLORED,     // distinct games played >= criteriaValue
        ALL_GAMES_MASTERED, // 3 stars in every game (TOTAL_GAMES_COUNT)
        STREAK_DAYS,        // played on N consecutive days
        PERFECT_SESSION,    // any single session scored 100%
        LOW_MOVES,          // e.g. Memory Match finished in <= criteriaValue moves
        POSITIVE_MOOD       // N "happy" face reactions recorded
    }

    public enum Tier { BRONZE, SILVER, GOLD }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Matches PlayerAchievement.achievementType — e.g. "master", "speed_demon"
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "title_en", nullable = false, length = 100)
    private String titleEn;

    @Column(name = "title_si", nullable = false, length = 100)
    private String titleSi;

    @Column(name = "description_en", length = 255)
    private String descriptionEn;

    @Column(name = "description_si", length = 255)
    private String descriptionSi;

    @Column(name = "icon", length = 16)
    @Builder.Default
    private String icon = "🏆";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Tier tier = Tier.BRONZE;

    @Enumerated(EnumType.STRING)
    @Column(name = "criteria_type", nullable = false)
    private CriteriaType criteriaType;

    @Column(name = "criteria_value", nullable = false)
    @Builder.Default
    private Integer criteriaValue = 0;

    // Only used for GAME_MASTERY and LOW_MOVES — e.g. "memory-match"
    @Column(name = "criteria_game_id", length = 32)
    private String criteriaGameId;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
