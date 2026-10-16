package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.LetterHuntAttemptRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterHuntAttemptResponse;
import lk.sliit.letter.helper.service.LetterHuntAdaptiveService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import lk.sliit.letter.helper.controller.dto.request.LetterHuntPracticeRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterHuntPracticeResponse;

@RestController
@RequestMapping("/api/letter-hunt-adaptive")
@RequiredArgsConstructor
public class LetterHuntAdaptiveController {

    private final LetterHuntAdaptiveService adaptiveService;

    @PostMapping("/practice-sessions")
    public ResponseEntity<LetterHuntPracticeResponse> savePracticeSession(
            @RequestBody LetterHuntPracticeRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(adaptiveService.savePracticeSession(
                requireUsername(authentication), request));
    }

    @GetMapping("/practice-sessions")
    public ResponseEntity<List<LetterHuntPracticeResponse>> getPracticeHistory(
            Authentication authentication) {
        return ResponseEntity.ok(adaptiveService.getPracticeHistory(
                requireUsername(authentication)));
    }


    @PostMapping("/attempts")
    public ResponseEntity<List<LetterHuntAttemptResponse>> saveAttempts(
            @RequestBody List<LetterHuntAttemptRequest> attempts,
            Authentication authentication) {

        String username = requireUsername(authentication);

        return ResponseEntity.ok(
                adaptiveService.saveAttempts(username, attempts)
        );
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<LetterHuntAttemptResponse>> getAttemptHistory(
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