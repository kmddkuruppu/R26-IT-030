package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.LetterTracingSessionRequest;
import lk.sliit.letter.helper.controller.dto.request.UpdateLetterIndexRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterMasteryResponse;
import lk.sliit.letter.helper.controller.dto.response.LetterTracingSessionResponse;
import lk.sliit.letter.helper.controller.dto.response.TracingProgressResponse;
import lk.sliit.letter.helper.service.LetterTracingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the Letter Tracing feature.
 *
 * Base path: /api/v1/letter-tracing
 *
 * Endpoints consumed directly by LetterTracing.js:
 *
 *   POST   /sessions                       — save a completed tracing session
 *   GET    /progress/{studentId}           — load full progress on page mount
 *   PATCH  /progress/letter-index          — sync currentLetterIndex (next/prev/select)
 *   GET    /mastery/{studentId}            — list mastery for all attempted letters
 *   GET    /mastery/{studentId}/{letter}   — single-letter mastery detail
 */
@RestController
@RequestMapping("/api/v1/letter-tracing")
@RequiredArgsConstructor
public class LetterTracingController {

    private final LetterTracingService letterTracingService;

    // ── POST /sessions ────────────────────────────────────────────────────────
    /**
     * Called when:
     *  • The user clicks "Check My Work →"
     *  • The app auto-completes at 95% keypoint coverage
     *
     * Returns updated totals (points, masteredCount, recentAccuracy, bestScore, gradeLabel)
     * so the frontend can update its state without a separate GET.
     */
    @PostMapping("/sessions")
    public ResponseEntity<LetterTracingSessionResponse> saveSession(
            @RequestBody LetterTracingSessionRequest request) {
        LetterTracingSessionResponse response = letterTracingService.saveSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /progress/{studentId} ─────────────────────────────────────────────
    /**
     * Called on component mount (useEffect with empty deps).
     * Returns everything the frontend needs to restore its state:
     *   progressMap, masteredSet, history[], points, accuracy, currentLetterIndex.
     */
    @GetMapping("/progress/{studentId}")
    public ResponseEntity<TracingProgressResponse> getProgress(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(letterTracingService.getProgress(studentId));
    }

    // ── PATCH /progress/letter-index ──────────────────────────────────────────
    /**
     * Called whenever handleNext(), handlePrev(), or handleSelectLetter() fires.
     * Keeps the backend in sync with the frontend's currentIdx so page reloads
     * resume at the correct letter.
     */
    @PatchMapping("/progress/letter-index")
    public ResponseEntity<Void> updateCurrentLetterIndex(
            @RequestBody UpdateLetterIndexRequest request) {
        letterTracingService.updateCurrentLetterIndex(request);
        return ResponseEntity.noContent().build();
    }

    // ── GET /mastery/{studentId} ──────────────────────────────────────────────
    /**
     * Returns mastery details for every letter the student has attempted.
     * Used to populate the LetterGrid's mastered/attempted indicators.
     */
    @GetMapping("/mastery/{studentId}")
    public ResponseEntity<List<LetterMasteryResponse>> getMasteryList(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(letterTracingService.getMasteryList(studentId));
    }

    // ── GET /mastery/{studentId}/{letter} ─────────────────────────────────────
    /**
     * Returns mastery detail for a single Sinhala letter.
     * The {letter} path variable is URL-encoded (e.g. %E0%B6%85 for "අ").
     */
    @GetMapping("/mastery/{studentId}/{letter}")
    public ResponseEntity<LetterMasteryResponse> getLetterMastery(
            @PathVariable Long studentId,
            @PathVariable String letter) {
        return ResponseEntity.ok(letterTracingService.getLetterMastery(studentId, letter));
    }
}