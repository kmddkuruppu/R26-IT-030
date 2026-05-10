package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "letter_mastery",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "letter"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LetterMastery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // The Sinhala letter (e.g. "අ")
    @Column(name = "letter", nullable = false, length = 10)
    private String letter;

    @Column(name = "sound", nullable = false, length = 20)
    private String sound;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "difficulty", length = 10)
    private String difficulty;

    // Best score ever achieved for this letter (0–100)
    @Column(name = "best_score", nullable = false)
    private Integer bestScore;

    // Total times this letter has been attempted
    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount;

    // true when bestScore >= 75 (considered mastered)
    @Column(name = "mastered", nullable = false)
    private Boolean mastered;

    @Column(name = "first_mastered_at")
    private LocalDateTime firstMasteredAt;

    @Column(name = "last_attempted_at", nullable = false)
    private LocalDateTime lastAttemptedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}