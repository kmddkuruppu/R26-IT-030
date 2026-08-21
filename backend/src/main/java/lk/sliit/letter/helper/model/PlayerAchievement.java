package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "player_achievements",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_student_achievement",
                        columnNames = {"student_id", "achievement_type"}
                )
        },
        indexes = {
                @Index(name = "idx_player_achievements_student", columnList = "student_id")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // "master", "speed_demon", "puzzle_master", "word_wizard"
    @Column(name = "achievement_type", nullable = false, length = 50)
    private String achievementType;

    // "Master Learner", "Speed Demon", etc.
    @Column(name = "achievement_title", length = 100)
    private String achievementTitle;

    @Column(name = "description", length = 255)
    private String description;

    // Which game triggered the achievement
    @Column(name = "game_type", length = 50)
    private String gameType;

    // Score at the time of earning
    @Column(name = "trigger_score")
    private Integer triggerScore;

    @Column(name = "earned_at")
    private LocalDateTime earnedAt;

    @PrePersist
    protected void onCreate() {
        earnedAt = LocalDateTime.now();
    }
}