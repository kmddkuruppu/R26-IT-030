package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Records a single closed-loop adaptation decision fired by the frontend
 * AdaptationTracker (see adaptationEngine.js) when a student's continuous
 * engagement stream crosses a hysteresis-gated threshold (frustration,
 * confusion, boredom). Each row is one intervention shown to the child —
 * used for offline research analysis of whether the intervention actually
 * helped engagement recover (see AdaptationServiceImpl#getAnalytics).
 */
@Entity
@Table(name = "adaptation_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdaptationEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, length = 150)
    private String username;

    @Column(name = "game_session_id")
    private Long gameSessionId;

    @Column(name = "game_id", nullable = false, length = 50)
    private String gameId;

    // frustrated | confused | bored
    @Column(name = "trigger_state", nullable = false, length = 30)
    private String triggerState;

    // ENCOURAGEMENT | HINT | SIMPLIFY | SUGGEST_SWITCH | SPEED_UP
    @Column(name = "action_taken", nullable = false, length = 30)
    private String actionTaken;

    @Column(name = "engagement_score_at_trigger", nullable = false)
    private Integer engagementScoreAtTrigger;

    @Column(name = "dominant_emotion_at_trigger", length = 30)
    private String dominantEmotionAtTrigger;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}