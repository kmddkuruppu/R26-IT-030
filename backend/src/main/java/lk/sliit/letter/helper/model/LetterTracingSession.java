package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "letter_tracing_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LetterTracingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The Sinhala letter that was traced (e.g. "අ", "ආ", "ක")
    @Column(name = "letter", nullable = false, length = 10)
    private String letter;

    // Phonetic sound of the letter (e.g. "a", "aa", "ka")
    @Column(name = "sound", nullable = false, length = 20)
    private String sound;

    // Category the letter belongs to (e.g. "Vowels", "Ka Group")
    @Column(name = "category", nullable = false, length = 50)
    private String category;

    // Accuracy score 0-100
    @Column(name = "score", nullable = false)
    private Integer score;

    // Number of keypoints covered in order
    @Column(name = "keypoints_covered", nullable = false)
    private Integer keypointsCovered;

    // Total keypoints for the letter
    @Column(name = "keypoints_total", nullable = false)
    private Integer keypointsTotal;

    // Number of out-of-boundary warnings during the session
    @Column(name = "boundary_warnings", nullable = false)
    private Integer boundaryWarnings;

    // Number of keypoints hit in wrong order
    @Column(name = "order_violations", nullable = false)
    private Integer orderViolations;

    // Whether the letter was auto-completed (95%+ coverage)
    @Column(name = "auto_completed", nullable = false)
    private Boolean autoCompleted;

    // Difficulty of the letter (Easy / Medium / Hard)
    @Column(name = "difficulty", length = 10)
    private String difficulty;

    // Number of strokes for the letter
    @Column(name = "strokes")
    private Integer strokes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}