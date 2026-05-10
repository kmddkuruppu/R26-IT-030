package lk.sliit.letter.helper.controller.dto.request;

import lombok.*;

/**
 * Sent by the frontend when a tracing session ends (Check My Work OR auto-complete).
 * Maps directly to the state tracked in LetterTracingPage.jsx.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LetterTracingSessionRequest {

    private Long studentId;

    /** The Sinhala letter that was traced (e.g. "අ") */
    private String letter;

    /** Phonetic sound (e.g. "a", "ka") */
    private String sound;

    /** Category display name (e.g. "Vowels", "Ka Group") */
    private String category;

    /** Difficulty string: "Easy" | "Medium" | "Hard" */
    private String difficulty;

    /** Number of strokes for this letter */
    private Integer strokes;

    /** Computed accuracy score 0–100 */
    private Integer score;

    /** Number of keypoints covered in correct order */
    private Integer keypointsCovered;

    /** Total keypoints defined for this letter */
    private Integer keypointsTotal;

    /** Number of boundary warning events fired during this session */
    private Integer boundaryWarnings;

    /** Number of wrong-order keypoint hits */
    private Integer orderViolations;

    /** True if the session ended via auto-complete (95%+ coverage) */
    private Boolean autoCompleted;
}