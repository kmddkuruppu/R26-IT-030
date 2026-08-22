package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.FaceReactionBatchRequest;
import lk.sliit.letter.helper.controller.dto.response.FaceReactionLogResponse;
import lk.sliit.letter.helper.controller.dto.response.SessionEngagementSummaryResponse;
import lk.sliit.letter.helper.service.FaceReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/face-reactions")
@RequiredArgsConstructor
public class FaceReactionController {

    private final FaceReactionService faceReactionService;

    // ── Save a batch of continuous engagement data points ────────
    // Frontend: sendFaceReactionBatch({ gameId, gameSessionId, dataPoints })
    @PostMapping("/batch")
    public ResponseEntity<List<FaceReactionLogResponse>> saveBatch(
            @RequestBody FaceReactionBatchRequest request,
            Authentication authentication) {

        String username = getUsername(authentication);
        return ResponseEntity.ok(
                faceReactionService.saveBatch(request, username));
    }

    // ── Aggregated engagement summary for one game session ───────
    // Frontend: getSessionEngagementSummary(gameSessionId)
    @GetMapping("/session/{gameSessionId}/summary")
    public ResponseEntity<SessionEngagementSummaryResponse> getSessionSummary(
            @PathVariable Long gameSessionId) {
        return ResponseEntity.ok(
                faceReactionService.getSessionSummary(gameSessionId));
    }

    // ── Recent engagement history for the logged-in student ──────
    // Frontend: getStudentEngagementHistory(limit)
    @GetMapping("/history")
    public ResponseEntity<List<FaceReactionLogResponse>> getHistory(
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication) {

        String username = getUsername(authentication);
        return ResponseEntity.ok(
                faceReactionService.getRecentEngagement(username, limit));
    }

    // ── Helper — guest mode support (same pattern as GamifiedLearningController) ──
    private String getUsername(Authentication authentication) {
        return authentication != null
                ? authentication.getName()
                : "guest";
    }
}