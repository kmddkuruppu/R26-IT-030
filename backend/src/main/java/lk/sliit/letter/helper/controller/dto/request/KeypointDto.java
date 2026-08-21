package lk.sliit.letter.helper.controller.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single ordered tracing keypoint in the 400 x 400 source coordinate
 * space (same space as the old KEYPOINTS_SRC values in LetterTracing.js).
 * Array order = stroke order (index 0 is keypoint #1, etc).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeypointDto {
    private double x;
    private double y;
}