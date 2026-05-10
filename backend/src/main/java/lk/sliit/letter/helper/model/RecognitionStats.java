package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recognition_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecognitionStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId;

    // Mirrors stats state in LetterRecognition.js:
    // { total, correct, streak, points }
    @Column(name = "total_attempts", nullable = false)
    private Integer totalAttempts;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount;

    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints;
}