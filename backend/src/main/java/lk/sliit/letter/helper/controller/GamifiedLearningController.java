package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.AchievementCheckRequest;
import lk.sliit.letter.helper.controller.dto.request.FaceReactionRequest;
import lk.sliit.letter.helper.controller.dto.request.GameSessionRequest;
import lk.sliit.letter.helper.controller.dto.response.*;
import lk.sliit.letter.helper.service.GamifiedLearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gamified")
@RequiredArgsConstructor
public class GamifiedLearningController {

    private final GamifiedLearningService gamifiedLearningService;

    // ── Save game session after every game ends ──────────────────
    // Frontend: saveGamifiedSession({ gameId, score, maxScore })
    @PostMapping("/session/save")
    public ResponseEntity<GameSessionResponse> saveGameSession(
            @RequestBody GameSessionRequest request,
            Authentication authentication) {

        String username = getUsername(authentication);
        return ResponseEntity.ok(
                gamifiedLearningService.saveGameSession(request, username));
    }

    // ── Save face reaction ───────────────────────────────────────
    // Frontend: saveFaceReaction({ gameId, rawExpression, emoji... })
    @PostMapping("/reaction/save")
    public ResponseEntity<FaceReactionResponse> saveFaceReaction(
            @RequestBody FaceReactionRequest request,
            Authentication authentication) {

        String username = getUsername(authentication);
        return ResponseEntity.ok(
                gamifiedLearningService.saveFaceReaction(request, username));
    }

    // ── Check & unlock achievements ──────────────────────────────
    // Frontend: checkAndEarnGamifiedAchievements({ gameType, score, totalScore })
    @PostMapping("/achievements/check")
    public ResponseEntity<AchievementResponse> checkAchievements(
            @RequestBody AchievementCheckRequest request,
            Authentication authentication) {

        String username = getUsername(authentication);
        return ResponseEntity.ok(
                gamifiedLearningService.checkAndEarnAchievements(request, username));
    }

    // ── Get full player stats ────────────────────────────────────
    // Frontend: getGamifiedStats()
    @GetMapping("/stats")
    public ResponseEntity<PlayerStatsResponse> getPlayerStats(
            Authentication authentication) {

        String username = getUsername(authentication);
        return ResponseEntity.ok(
                gamifiedLearningService.getPlayerStats(username));
    }

    // ── Get recent reactions ─────────────────────────────────────
    // Frontend: getMoodHistory()
    @GetMapping("/reactions")
    public ResponseEntity<List<FaceReactionResponse>> getReactions(
            Authentication authentication) {

        String username = getUsername(authentication);
        return ResponseEntity.ok(
                gamifiedLearningService.getRecentReactions(username));
    }

    // ── Get achievements list ────────────────────────────────────
    // Frontend: getGamifiedAchievements()
    @GetMapping("/achievements")
    public ResponseEntity<List<PlayerStatsResponse.AchievementItem>> getAchievements(
            Authentication authentication) {

        String username = getUsername(authentication);
        PlayerStatsResponse stats =
                gamifiedLearningService.getPlayerStats(username);
        return ResponseEntity.ok(stats.getAchievements());
    }

    // ── Helper — guest mode support ─────────────────────────────
    private String getUsername(Authentication authentication) {
        return authentication != null
                ? authentication.getName()
                : "guest";
    }

    // ── Get per-game progress breakdown ───────────────────────────
// Frontend: getGameProgress()
    @GetMapping("/progress")
    public ResponseEntity<GameProgressResponse> getGameProgress(
            Authentication authentication) {

        String username = getUsername(authentication);
        return ResponseEntity.ok(
                gamifiedLearningService.getGameProgress(username));
    }
}