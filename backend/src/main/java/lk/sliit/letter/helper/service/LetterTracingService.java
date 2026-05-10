package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.LetterTracingSessionRequest;
import lk.sliit.letter.helper.controller.dto.request.UpdateLetterIndexRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterMasteryResponse;
import lk.sliit.letter.helper.controller.dto.response.LetterTracingSessionResponse;
import lk.sliit.letter.helper.controller.dto.response.TracingProgressResponse;

import java.util.List;

public interface LetterTracingService {

    /**
     * Save a completed tracing session and update mastery / progress totals.
     * Called when the user clicks "Check My Work" or the app auto-completes.
     */
    LetterTracingSessionResponse saveSession(LetterTracingSessionRequest request);

    /**
     * Return the full progress snapshot for the student.
     * Called on page load to restore state.
     */
    TracingProgressResponse getProgress(Long studentId);

    /**
     * Sync the frontend's currentLetterIndex to the backend.
     * Called when the user clicks Prev / Next or selects a letter from the grid.
     */
    void updateCurrentLetterIndex(UpdateLetterIndexRequest request);

    /**
     * Return mastery details for every letter the student has attempted.
     */
    List<LetterMasteryResponse> getMasteryList(Long studentId);

    /**
     * Return mastery detail for a single letter.
     */
    LetterMasteryResponse getLetterMastery(Long studentId, String letter);
}