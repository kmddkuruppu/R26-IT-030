package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One traceable letter, e.g. "අ". Replaces a single entry inside the
 * hard-coded LETTER_CATEGORIES[...].letters array in LetterTracing.js,
 * plus its matching entry in the KEYPOINTS_SRC map.
 *
 * phasesJson    -> JSON array of strings, e.g. ["Start at the top...", "..."]
 * keypointsJson -> JSON array of {"x":185,"y":150} objects, in the SAME
 *                  400 x 400 source coordinate space the frontend used
 *                  for KEYPOINTS_SRC (KP_SRC = 400), so no extra scaling
 *                  logic is needed anywhere.
 */
@Entity
@Table(name = "tracing_letters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TracingLetterData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private TracingCategory category;

    @Column(nullable = false, length = 10)
    private String letter;

    @Column(nullable = false, length = 20)
    private String sound;

    @Column(nullable = false)
    private Integer strokes;

    // "Easy" | "Medium" | "Hard"
    @Column(nullable = false, length = 20)
    private String difficulty;

    @Column(nullable = false, length = 255)
    private String tip;

    @Lob
    @Column(name = "phases_json", nullable = false, columnDefinition = "TEXT")
    private String phasesJson;

    @Lob
    @Column(name = "keypoints_json", nullable = false, columnDefinition = "TEXT")
    private String keypointsJson;

    @Column(name = "order_index")
    private Integer orderIndex;
}