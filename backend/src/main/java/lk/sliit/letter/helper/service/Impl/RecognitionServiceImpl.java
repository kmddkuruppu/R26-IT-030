package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.RecognitionAttemptRequest;
import lk.sliit.letter.helper.controller.dto.request.RecognitionFeedbackRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterPracticeResponse;
import lk.sliit.letter.helper.controller.dto.response.RecognitionAttemptResponse;
import lk.sliit.letter.helper.controller.dto.response.RecognitionStatsResponse;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.RecognitionAttempt;
import lk.sliit.letter.helper.model.RecognitionStats;
import lk.sliit.letter.helper.repository.RecognitionAttemptRepository;
import lk.sliit.letter.helper.repository.RecognitionStatsRepository;
import lk.sliit.letter.helper.service.RecognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecognitionServiceImpl implements RecognitionService {

    private final RecognitionAttemptRepository attemptRepository;
    private final RecognitionStatsRepository   statsRepository;

    // ── POST /api/recognition/attempt ────────────────────────────
    // Mirrors: handleRecognize() in LetterRecognition.js
    // Points formula mirrors handleFeedback():
    //   Math.max(5, Math.round(confidence / 10))
    @Override
    public RecognitionAttemptResponse saveAttempt(RecognitionAttemptRequest req) {

        int points = Math.max(5, Math.round(req.getConfidence() / 10.0f));

        RecognitionAttempt attempt = RecognitionAttempt.builder()
                .sessionId(req.getSessionId())
                .selectedLetter(req.getSelectedLetter())
                .recognizedLetter(req.getRecognizedLetter())
                .confidence(req.getConfidence())
                .inputType(req.getInputType())
                .points(points)
                .wasCorrect(null)       // set after feedback
                .attemptedAt(LocalDateTime.now())
                .build();

        // Update stats — total++
        RecognitionStats stats = getOrCreateStats(req.getSessionId());
        stats.setTotalAttempts(stats.getTotalAttempts() + 1);
        statsRepository.save(stats);

        return toAttemptResponse(attemptRepository.save(attempt));
    }

    // ── POST /api/recognition/feedback ───────────────────────────
    // Mirrors: handleFeedback(correct) in LetterRecognition.js
    //   correct → correct++, streak++, points += Math.max(5, confidence/10)
    //   wrong   → streak = 0
    @Override
    public RecognitionStatsResponse saveFeedback(RecognitionFeedbackRequest req) {

        RecognitionAttempt attempt = attemptRepository.findById(req.getRecognitionId())
                .orElseThrow(() -> new NotFoundException(
                        "Attempt not found: " + req.getRecognitionId()));

        attempt.setWasCorrect(req.getCorrect());
        attemptRepository.save(attempt);

        RecognitionStats stats = getOrCreateStats(req.getSessionId());

        if (Boolean.TRUE.equals(req.getCorrect())) {
            stats.setCorrectCount(stats.getCorrectCount() + 1);
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
            stats.setTotalPoints(stats.getTotalPoints() + attempt.getPoints());
        } else {
            // Mirrors: setStats(p => ({ ...p, streak: 0 }))
            stats.setCurrentStreak(0);
        }

        statsRepository.save(stats);
        return toStatsResponse(stats);
    }

    // ── GET /api/recognition/stats/{sessionId} ───────────────────
    // Mirrors: getRecognitionStats() → setStats() on mount
    @Override
    public RecognitionStatsResponse getStats(String sessionId) {
        RecognitionStats stats = getOrCreateStats(sessionId);
        return toStatsResponse(stats);
    }

    // ── GET /api/recognition/history/{sessionId} ─────────────────
    @Override
    public List<RecognitionAttemptResponse> getHistory(String sessionId) {
        return attemptRepository
                .findBySessionIdOrderByAttemptedAtDesc(sessionId)
                .stream()
                .map(this::toAttemptResponse)
                .collect(Collectors.toList());
    }

    // ── GET /api/recognition/letters/{sessionId} ─────────────────
    // Mirrors: getLetterPracticeHistory()
    @Override
    public List<LetterPracticeResponse> getLetterPracticeHistory(String sessionId) {
        return attemptRepository.getLetterBreakdown(sessionId)
                .stream()
                .map(row -> {
                    String letter       = (String) row[0];
                    long   total        = (long)   row[1];
                    long   correct      = (long)   row[2];
                    int    accuracy     = total > 0
                            ? (int) Math.round((correct * 100.0) / total)
                            : 0;
                    return LetterPracticeResponse.builder()
                            .letter(letter)
                            .totalAttempts(total)
                            .correctCount(correct)
                            .accuracyPercent(accuracy)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────
    private RecognitionStats getOrCreateStats(String sessionId) {
        return statsRepository.findBySessionId(sessionId)
                .orElseGet(() -> statsRepository.save(
                        RecognitionStats.builder()
                                .sessionId(sessionId)
                                .totalAttempts(0)
                                .correctCount(0)
                                .currentStreak(0)
                                .totalPoints(0)
                                .build()
                ));
    }

    private RecognitionAttemptResponse toAttemptResponse(RecognitionAttempt a) {
        return RecognitionAttemptResponse.builder()
                .id(a.getId())
                .sessionId(a.getSessionId())
                .selectedLetter(a.getSelectedLetter())
                .recognizedLetter(a.getRecognizedLetter())
                .confidence(a.getConfidence())
                .inputType(a.getInputType())
                .points(a.getPoints())
                .wasCorrect(a.getWasCorrect())
                .attemptedAt(a.getAttemptedAt())
                .build();
    }

    private RecognitionStatsResponse toStatsResponse(RecognitionStats s) {
        int accuracy = s.getTotalAttempts() > 0
                ? (int) Math.round((s.getCorrectCount() * 100.0) / s.getTotalAttempts())
                : 0;
        return RecognitionStatsResponse.builder()
                .sessionId(s.getSessionId())
                .totalAttempts(s.getTotalAttempts())
                .correctCount(s.getCorrectCount())
                .currentStreak(s.getCurrentStreak())
                .totalPoints(s.getTotalPoints())
                .accuracyPercent(accuracy)
                .build();
    }
}