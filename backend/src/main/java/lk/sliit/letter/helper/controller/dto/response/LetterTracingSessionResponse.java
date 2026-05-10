package lk.sliit.letter.helper.controller.dto.response;

import lombok.*;
import java.time.LocalDateTime;

/**
 * Returned after saving a tracing session.
 * Contains the updated totals the frontend needs for the progress bar and stats panel.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LetterTracingSessionResponse {

    private Long sessionId;
    private String letter;
    private String sound;
    private String category;
    private Integer score;
    private Integer keypointsCovered;
    private Integer keypointsTotal;
    private Integer boundaryWarnings;
    private Integer orderViolations;
    private Boolean autoCompleted;

    /** Grade label: "Excellent" | "Very Good" | "Good" | "Try Again" */
    private String gradeLabel;

    /** Star symbol: "★★★" | "★★☆" | "★☆☆" */
    private String gradeSymbol;

    /** true if this attempt pushed bestScore above the previous best */
    private Boolean newBest;

    /** Updated best score for this letter after saving */
    private Integer bestScore;

    /** Whether the letter is now considered mastered (bestScore >= 75) */
    private Boolean mastered;

    /** Updated total points for the student */
    private Integer totalPoints;

    /** Updated mastered letter count */
    private Integer masteredCount;

    /** Updated recent accuracy (avg of last 10 sessions) */
    private Integer recentAccuracy;

    private LocalDateTime createdAt;
}