package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.FaceReactionBatchRequest;
import lk.sliit.letter.helper.controller.dto.response.FaceReactionLogResponse;
import lk.sliit.letter.helper.controller.dto.response.SessionEngagementSummaryResponse;
import lk.sliit.letter.helper.model.FaceReactionLog;
import lk.sliit.letter.helper.repository.FaceReactionLogRepository;
import lk.sliit.letter.helper.service.FaceReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaceReactionServiceImpl implements FaceReactionService {

    private final FaceReactionLogRepository faceReactionLogRepository;

    @Override
    public List<FaceReactionLogResponse> saveBatch(FaceReactionBatchRequest request, String username) {
        if (request.getDataPoints() == null || request.getDataPoints().isEmpty()) {
            return List.of();
        }

        List<FaceReactionLog> logs = request.getDataPoints().stream().map(dp -> {
            FaceReactionLog log = new FaceReactionLog();
            log.setUsername(username);
            log.setGameSessionId(request.getGameSessionId());
            log.setGameId(request.getGameId());
            log.setCapturedAt(dp.getCapturedAt() != null ? dp.getCapturedAt() : LocalDateTime.now());
            log.setEngagementScore(dp.getEngagementScore());
            log.setDominantEmotion(dp.getDominantEmotion());
            log.setConfidence(dp.getConfidence());
            return log;
        }).collect(Collectors.toList());

        List<FaceReactionLog> saved = faceReactionLogRepository.saveAll(logs);
        return saved.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public SessionEngagementSummaryResponse getSessionSummary(Long gameSessionId) {
        List<FaceReactionLog> logs = faceReactionLogRepository.findByGameSessionIdOrderByCapturedAtAsc(gameSessionId);

        SessionEngagementSummaryResponse summary = new SessionEngagementSummaryResponse();
        summary.setGameSessionId(gameSessionId);
        summary.setTotalDataPoints(logs.size());

        if (logs.isEmpty()) {
            summary.setAverageEngagementScore(0.0);
            summary.setPeakEngagementScore(0);
            summary.setLowestEngagementScore(0);
            summary.setEmotionBreakdown(Map.of());
            summary.setDominantEmotionOverall("neutral");
            return summary;
        }

        summary.setGameId(logs.get(0).getGameId());

        double avg = logs.stream().mapToInt(FaceReactionLog::getEngagementScore).average().orElse(0.0);
        summary.setAverageEngagementScore(Math.round(avg * 10.0) / 10.0);
        summary.setPeakEngagementScore(logs.stream().mapToInt(FaceReactionLog::getEngagementScore).max().orElse(0));
        summary.setLowestEngagementScore(logs.stream().mapToInt(FaceReactionLog::getEngagementScore).min().orElse(0));

        Map<String, Long> breakdown = logs.stream()
                .collect(Collectors.groupingBy(FaceReactionLog::getDominantEmotion, Collectors.counting()));
        summary.setEmotionBreakdown(breakdown);

        String dominant = breakdown.entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse("neutral");
        summary.setDominantEmotionOverall(dominant);

        return summary;
    }

    @Override
    public List<FaceReactionLogResponse> getRecentEngagement(String username, int limit) {
        return faceReactionLogRepository.findByUsernameOrderByCapturedAtDesc(username).stream()
                .limit(limit)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private FaceReactionLogResponse toResponse(FaceReactionLog log) {
        return new FaceReactionLogResponse(
                log.getId(),
                log.getGameId(),
                log.getGameSessionId(),
                log.getCapturedAt(),
                log.getEngagementScore(),
                log.getDominantEmotion(),
                log.getConfidence()
        );
    }
}