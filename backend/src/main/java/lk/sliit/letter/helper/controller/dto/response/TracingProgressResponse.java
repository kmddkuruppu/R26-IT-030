package lk.sliit.letter.helper.controller.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Full progress snapshot returned on page load.
 * Supplies the frontend's progressMap, masteredSet, points, accuracy and history.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TracingProgressResponse {

    private Long studentId;

    /** Total gamification points (shown in progress sub-bar) */
    private Integer totalPoints;

    /** Number of mastered letters */
    private Integer masteredCount;

    /** Total attempts ever */
    private Integer totalAttempts;

    /** Average accuracy of last 10 sessions (shown as "Accuracy %" in sub-bar) */
    private Integer recentAccuracy;

    /** Total boundary warnings ever */
    private Integer totalBoundaryWarnings;

    /** Frontend currentIdx to restore on page reload */
    private Integer currentLetterIndex;

    /**
     * Per-letter mastery details — used to rebuild the frontend's
     * progressMap (letter -> bestScore) and masteredSet (letters with mastered=true).
     */
    private List<LetterMasteryResponse> masteryList;

    /**
     * Last 50 sessions in reverse-chronological order —
     * used to rebuild the frontend's history array and accuracy trend chart.
     */
    private List<RecentSessionResponse> recentSessions;

    private LocalDateTime lastUpdatedAt;

    // ── nested response types ────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LetterMasteryResponse {
        private String letter;
        private String sound;
        private String category;
        private String difficulty;
        private Integer bestScore;
        private Integer attemptCount;
        private Boolean mastered;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecentSessionResponse {
        private String letter;
        private Integer score;
        private String category;
        private LocalDateTime createdAt;
    }
}