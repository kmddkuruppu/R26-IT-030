package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "tracing_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TracingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    // Total gamification points earned
    @Column(name = "total_points", nullable = false)
    private Integer totalPoints;

    // Number of distinct letters mastered (bestScore >= 75)
    @Column(name = "mastered_count", nullable = false)
    private Integer masteredCount;

    // Total number of tracing sessions ever completed
    @Column(name = "total_attempts", nullable = false)
    private Integer totalAttempts;

    // Running average accuracy across last 10 sessions (matches frontend logic)
    @Column(name = "recent_accuracy")
    private Integer recentAccuracy;

    // Total boundary warnings accumulated in this session context
    @Column(name = "total_boundary_warnings", nullable = false)
    private Integer totalBoundaryWarnings;

    // Index of the letter the student is currently working on
    @Column(name = "current_letter_index", nullable = false)
    private Integer currentLetterIndex;

    @Column(name = "last_updated_at", nullable = false)
    private LocalDateTime lastUpdatedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.lastUpdatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.lastUpdatedAt = LocalDateTime.now();
    }
}