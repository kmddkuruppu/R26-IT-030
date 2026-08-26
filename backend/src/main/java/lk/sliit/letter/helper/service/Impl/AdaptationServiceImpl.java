package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.AdaptationEventRequest;
import lk.sliit.letter.helper.controller.dto.response.AdaptationAnalyticsResponse;
import lk.sliit.letter.helper.controller.dto.response.AdaptationEventResponse;
import lk.sliit.letter.helper.model.AdaptationEvent;
import lk.sliit.letter.helper.model.FaceReactionLog;
import lk.sliit.letter.helper.repository.AdaptationEventRepository;
import lk.sliit.letter.helper.repository.FaceReactionLogRepository;
import lk.sliit.letter.helper.service.AdaptationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdaptationServiceImpl implements AdaptationService {

    private final AdaptationEventRepository adaptationEventRepository;
    private final FaceReactionLogRepository faceReactionLogRepository;

    // How long after an intervention we look for engagement "recovery"
    private static final long POST_WINDOW_START_SEC = 5;
    private static final long POST_WINDOW_END_SEC = 40;

    @Override
    public AdaptationEventResponse logEvent(AdaptationEventRequest request, String username) {
        AdaptationEvent event = new AdaptationEvent();
        event.setUsername(username);
        event.setGameId(request.getGameId());
        event.setGameSessionId(request.getGameSessionId());
        event.setTriggerState(request.getTriggerState());
        event.setActionTaken(request.getActionTaken());
        event.setEngagementScoreAtTrigger(request.getEngagementScoreAtTrigger());
        event.setDominantEmotionAtTrigger(request.getDominantEmotionAtTrigger());

        AdaptationEvent saved = adaptationEventRepository.save(event);
        return toResponse(saved);
    }

    @Override
    public AdaptationAnalyticsResponse getAnalytics(String username, boolean global) {
        List<AdaptationEvent> events = global
                ? adaptationEventRepository.findAllByOrderByCreatedAtDesc()
                : adaptationEventRepository.findByUsernameOrderByCreatedAtDesc(username);

        AdaptationAnalyticsResponse response = new AdaptationAnalyticsResponse();
        response.setTotalEvents(events.size());

        response.setBreakdownByTriggerState(
                events.stream().collect(Collectors.groupingBy(AdaptationEvent::getTriggerState, Collectors.counting())));
        response.setBreakdownByAction(
                events.stream().collect(Collectors.groupingBy(AdaptationEvent::getActionTaken, Collectors.counting())));

        response.setRecentEvents(events.stream().limit(30).map(this::toResponse).collect(Collectors.toList()));

        if (events.isEmpty()) {
            response.setEffectivenessByAction(Map.of());
            response.setAverageEngagementDeltaOverall(0.0);
            return response;
        }

        // ── Effectiveness: for each event, find that user's engagement-log
        //    points in the 5s-40s window after it fired, and compare the
        //    average to the score AT the trigger moment. ──
        Map<String, List<Double>> deltasByAction = new HashMap<>();
        List<Double> allDeltas = new ArrayList<>();

        // Group events by username so we only fetch each user's log once
        Map<String, List<AdaptationEvent>> byUser = events.stream()
                .collect(Collectors.groupingBy(AdaptationEvent::getUsername));

        for (Map.Entry<String, List<AdaptationEvent>> entry : byUser.entrySet()) {
            List<FaceReactionLog> userLogs =
                    faceReactionLogRepository.findByUsernameOrderByCapturedAtAsc(entry.getKey());

            for (AdaptationEvent ev : entry.getValue()) {
                LocalDateTime windowStart = ev.getCreatedAt().plusSeconds(POST_WINDOW_START_SEC);
                LocalDateTime windowEnd = ev.getCreatedAt().plusSeconds(POST_WINDOW_END_SEC);

                List<Integer> postScores = userLogs.stream()
                        .filter(l -> !l.getCapturedAt().isBefore(windowStart) && !l.getCapturedAt().isAfter(windowEnd))
                        .map(FaceReactionLog::getEngagementScore)
                        .collect(Collectors.toList());

                if (postScores.isEmpty()) continue;

                double postAvg = postScores.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                double delta = postAvg - ev.getEngagementScoreAtTrigger();

                deltasByAction.computeIfAbsent(ev.getActionTaken(), k -> new ArrayList<>()).add(delta);
                allDeltas.add(delta);
            }
        }

        Map<String, Double> effectiveness = deltasByAction.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Math.round(e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0) * 10.0) / 10.0
                ));
        response.setEffectivenessByAction(effectiveness);

        double overallAvg = allDeltas.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        response.setAverageEngagementDeltaOverall(Math.round(overallAvg * 10.0) / 10.0);

        return response;
    }

    private AdaptationEventResponse toResponse(AdaptationEvent e) {
        return new AdaptationEventResponse(
                e.getId(), e.getGameId(), e.getTriggerState(), e.getActionTaken(),
                e.getEngagementScoreAtTrigger(), e.getDominantEmotionAtTrigger(), e.getCreatedAt()
        );
    }
}