package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "speed_quiz_practice_sessions",
       indexes = {
           @Index(name = "idx_sq_practice_student", columnList = "student_id")
       })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeedQuizPracticeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "target_letter", nullable = false, length = 20)
    private String targetLetter;

    @Column(name = "confused_letter", nullable = false, length = 20)
    private String confusedLetter;

    @Column(name = "initial_confusion_count", nullable = false)
    private Integer initialConfusionCount;

    @Column(name = "practice_attempts", nullable = false)
    private Integer practiceAttempts;

    @Column(name = "correct_attempts", nullable = false)
    private Integer correctAttempts;

    @Column(name = "mastered", nullable = false)
    private Boolean mastered;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}
