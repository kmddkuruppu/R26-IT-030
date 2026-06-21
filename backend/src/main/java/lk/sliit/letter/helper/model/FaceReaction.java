package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "face_reactions",
        indexes = {
                @Index(name = "idx_face_reactions_student", columnList = "student_id"),
                @Index(name = "idx_face_reactions_game_id", columnList = "game_id"),
                @Index(name = "idx_face_reactions_captured_at", columnList = "captured_at")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaceReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "game_id", length = 50)
    private String gameId;

    // "happy", "surprised", "neutral", "sad", "angry", "fearful", "disgusted"
    @Column(name = "raw_expression", length = 20)
    private String rawExpression;

    // emoji — utf8mb4 needed for storing 😄
    @Column(name = "emoji", length = 10,
            columnDefinition = "VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String emoji;

    @Column(name = "label_en", length = 30)
    private String labelEn;

    // Sinhala text — utf8mb4 essential
    @Column(name = "label_si", length = 50,
            columnDefinition = "VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String labelSi;

    // Tamil text — utf8mb4 essential
    @Column(name = "label_ta", length = 50,
            columnDefinition = "VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String labelTa;

    // 0.0 to 1.0 confidence score from face-api.js
    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "captured_at")
    private LocalDateTime capturedAt;

    @PrePersist
    protected void onCreate() {
        capturedAt = LocalDateTime.now();
    }
}