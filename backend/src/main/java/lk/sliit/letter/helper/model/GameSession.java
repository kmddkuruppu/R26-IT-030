package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_sessions",
        indexes = {
                @Index(name = "idx_game_sessions_student", columnList = "student_id"),
                @Index(name = "idx_game_sessions_game_id", columnList = "game_id"),
                @Index(name = "idx_game_sessions_played_at", columnList = "played_at")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "game_id", nullable = false, length = 50)
    private String gameId;

    @Column(name = "game_section", length = 20)
    private String gameSection;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(name = "percentage")
    private Double percentage;

    @Column(name = "stars_earned")
    private Integer starsEarned;

    @Column(name = "time_seconds")
    private Integer timeSeconds;

    @Column(name = "moves_count")
    private Integer movesCount;

    @Column(name = "question_count")
    private Integer questionCount;

    @Column(name = "result_label", length = 50)
    private String resultLabel;

    @Column(name = "played_at")
    private LocalDateTime playedAt;

    @PrePersist
    protected void onCreate() {
        playedAt = LocalDateTime.now();

        if (maxScore != null && maxScore > 0 && score != null) {
            percentage = (score * 100.0) / maxScore;
            int pct = percentage.intValue();
            starsEarned = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
            resultLabel = pct >= 80 ? "Excellent Work"
                    : pct >= 50 ? "Well Done"
                    : "Keep Practicing";
        }

        if (gameId != null) {
            gameSection = (gameId.startsWith("word-")
                    || gameId.equals("missing-letter")
                    || gameId.equals("line-connect"))
                    ? "Words" : "Letters";
        }
    }
}