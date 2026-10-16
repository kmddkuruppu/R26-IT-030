package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.SpeedQuizAttemptRequest;
import lk.sliit.letter.helper.controller.dto.response.SpeedQuizAttemptResponse;
import lk.sliit.letter.helper.service.SpeedQuizAdaptiveService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import lk.sliit.letter.helper.controller.dto.request.SpeedQuizPracticeRequest;
import lk.sliit.letter.helper.controller.dto.response.SpeedQuizPracticeResponse;

@RestController
@RequestMapping("/api/speed-quiz-adaptive")
@RequiredArgsConstructor
public class SpeedQuizAdaptiveController {

    private final SpeedQuizAdaptiveService adaptiveService;

    @PostMapping("/practice-sessions")
    public ResponseEntity<SpeedQuizPracticeResponse> savePracticeSession(
            @RequestBody SpeedQuizPracticeRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(adaptiveService.savePracticeSession(
                requireUsername(authentication), request));
    }

    @GetMapping("/practice-sessions")
    public ResponseEntity<List<SpeedQuizPracticeResponse>> getPracticeHistory(
            Authentication authentication) {
        return ResponseEntity.ok(adaptiveService.getPracticeHistory(
                requireUsername(authentication)));
    }


    @PostMapping("/attempts")
    public ResponseEntity<List<SpeedQuizAttemptResponse>> saveAttempts(
            @RequestBody List<SpeedQuizAttemptRequest> attempts,
            Authentication authentication) {

        String username = requireUsername(authentication);

        return ResponseEntity.ok(
                adaptiveService.saveAttempts(username, attempts)
        );
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<SpeedQuizAttemptResponse>> getAttemptHistory(
            Authentication authentication) {

        String username = requireUsername(authentication);

        return ResponseEntity.ok(
                adaptiveService.getAttemptHistory(username)
        );
    }

    private String requireUsername(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()
                || "anonymousUser".equals(authentication.getName())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        return authentication.getName();
    }
}