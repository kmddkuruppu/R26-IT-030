package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recognition_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecognitionAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Guest session ID from localStorage
    @Column(name = "session_id", nullable = false)
    private String sessionId;

    // Letter the user selected to practice (nullable — free practice)
    @Column(name = "selected_letter")
    private String selectedLetter;

    // Letter AI recognized
    @Column(name = "recognized_letter", nullable = false)
    private String recognizedLetter;

    // AI confidence 0–100
    @Column(nullable = false)
    private Integer confidence;

    // "draw" or "upload"
    @Column(name = "input_type", nullable = false)
    private String inputType;

    // Points earned for this attempt
    @Column(nullable = false)
    private Integer points;

    // User feedback — null until they click yes/no
    @Column(name = "was_correct")
    private Boolean wasCorrect;

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt;
}