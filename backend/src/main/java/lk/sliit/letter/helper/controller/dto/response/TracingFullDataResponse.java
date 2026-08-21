package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Shape returned by GET /api/tracing-data/full — one entry per category,
 * each with its letters embedded. This mirrors the old hard-coded
 * LETTER_CATEGORIES array in LetterTracing.js field-for-field
 * (id -> code, name, nameEn, letters), so the frontend needs almost no
 * remapping.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TracingFullDataResponse {
    private String id;     // category code, e.g. "vowels"
    private String name;   // Sinhala name
    private String nameEn; // English name
    private List<TracingLetterResponse> letters;
}