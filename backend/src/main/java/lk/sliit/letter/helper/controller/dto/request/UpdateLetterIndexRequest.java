package lk.sliit.letter.helper.controller.dto.request;

import lombok.*;

/**
 * Sent when the user clicks Next / Prev / selects a letter from the grid.
 * Keeps the backend in sync with the frontend's currentIdx state.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateLetterIndexRequest {

    private Long studentId;

    /** The new currentIdx value from the frontend */
    private Integer currentLetterIndex;
}