package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.AdaptationEventRequest;
import lk.sliit.letter.helper.controller.dto.response.AdaptationAnalyticsResponse;
import lk.sliit.letter.helper.controller.dto.response.AdaptationEventResponse;
import lk.sliit.letter.helper.service.AdaptationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adaptation")
@RequiredArgsConstructor
public class AdaptationController {

    private final AdaptationService adaptationService;

    // Frontend: logAdaptationEvent({...}) — fired every time the
    // AdaptationTracker's cooldown-gated intervention triggers.
    @PostMapping("/event")
    public ResponseEntity<AdaptationEventResponse> logEvent(
            @RequestBody AdaptationEventRequest request,
            Authentication authentication) {
        String username = getUsername(authentication);
        return ResponseEntity.ok(adaptationService.logEvent(request, username));
    }

    // Frontend: getAdaptationAnalytics(scope) — "me" (default) or "global"
    // "global" is the research-facing view across all students.
    @GetMapping("/analytics")
    public ResponseEntity<AdaptationAnalyticsResponse> getAnalytics(
            @RequestParam(defaultValue = "me") String scope,
            Authentication authentication) {
        String username = getUsername(authentication);
        boolean global = "global".equalsIgnoreCase(scope);
        return ResponseEntity.ok(adaptationService.getAnalytics(username, global));
    }

    private String getUsername(Authentication authentication) {
        return authentication != null ? authentication.getName() : "guest";
    }
}