package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "speed_quiz_attempts",
    indexes = {
        @Index(
            name = "idx_speed_quiz_student",
            columnList = "student_id"
        ),
        @Index(
            name = "idx_speed_quiz_attempted_at",
            columnList = "attempted_at"
        )
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeedQuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "target_letter", nullable = false, length = 20)
    private String targetLetter;

    @Column(name = "selected_letter", nullable = false, length = 20)
    private String selectedLetter;

    @Column(name = "is_correct", nullable = false)
    private Boolean correct;

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt;

    @PrePersist
    protected void onCreate() {
        if (attemptedAt == null) {
            attemptedAt = LocalDateTime.now();
        }
    }
}
