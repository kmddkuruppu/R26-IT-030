package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A single real-time engagement data point captured while a student is
 * playing a game. Many rows are created per game session (roughly one
 * every ~3 seconds while the camera is tracking), which lets you build a
 * time-series of engagement over the course of a session for research
 * analysis (rather than just one snapshot per game).
 *
 * Uses `username` (not a numeric studentId) to match the same pattern
 * GamifiedLearningController already uses (Authentication.getName()),
 * including guest-mode support.
 */
@Entity
@Table(name = "face_reaction_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceReactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, length = 150)
    private String username; // "guest" for unauthenticated play, same as GamifiedLearningController

    @Column(name = "game_session_id")
    private Long gameSessionId;

    @Column(name = "game_id", nullable = false, length = 50)
    private String gameId;

    @Column(name = "captured_at", nullable = false)
    private LocalDateTime capturedAt;

    // one of: happy | surprised | confused | frustrated | neutral
    @Column(name = "dominant_emotion", nullable = false, length = 30)
    private String dominantEmotion;

    // 0-100, computed client-side from MediaPipe blendshapes (see engagementEngine.js)
    @Column(name = "engagement_score", nullable = false)
    private Integer engagementScore;

    // 0-1 average classifier confidence for the dominant emotion in this window
    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.capturedAt == null) {
            this.capturedAt = LocalDateTime.now();
        }
    }
}