package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.LetterTracingSessionRequest;
import lk.sliit.letter.helper.controller.dto.request.UpdateLetterIndexRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterMasteryResponse;
import lk.sliit.letter.helper.controller.dto.response.LetterTracingSessionResponse;
import lk.sliit.letter.helper.controller.dto.response.TracingProgressResponse;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.LetterMastery;
import lk.sliit.letter.helper.model.LetterTracingSession;
import lk.sliit.letter.helper.model.Student;
import lk.sliit.letter.helper.model.TracingProgress;
import lk.sliit.letter.helper.repository.*;
import lk.sliit.letter.helper.service.LetterTracingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LetterTracingServiceImpl implements LetterTracingService {

    private final LetterTracingSessionRepository sessionRepository;
    private final LetterMasteryRepository masteryRepository;
    private final TracingProgressRepository progressRepository;
    private final StudentRepository studentRepository;

    // ─── Grade helpers (mirrors frontend getGrade()) ─────────────────────────

    private String resolveGradeLabel(int score) {
        if (score >= 90) return "Excellent";
        if (score >= 75) return "Very Good";
        if (score >= 60) return "Good";
        return "Try Again";
    }

    private String resolveGradeSymbol(int score) {
        if (score >= 90) return "★★★";
        if (score >= 75) return "★★☆";
        if (score >= 60) return "★★☆";
        return "★☆☆";
    }

    /**
     * Points per session = Math.round(score / 8)  — mirrors frontend awardMastery()
     */
    private int computePoints(int score) {
        return (int) Math.round(score / 8.0);
    }

    /**
     * A letter is considered mastered when its bestScore >= 75.
     * Mirrors the frontend condition used to populate masteredSet.
     */
    private boolean isMastered(int bestScore) {
        return bestScore >= 75;
    }

    // ─── saveSession ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public LetterTracingSessionResponse saveSession(LetterTracingSessionRequest req) {

        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new NotFoundException("Student not found: " + req.getStudentId()));

        // 1. Persist the raw session
        LetterTracingSession session = LetterTracingSession.builder()
                .student(student)
                .letter(req.getLetter())
                .sound(req.getSound())
                .category(req.getCategory())
                .difficulty(req.getDifficulty())
                .strokes(req.getStrokes())
                .score(req.getScore())
                .keypointsCovered(req.getKeypointsCovered())
                .keypointsTotal(req.getKeypointsTotal())
                .boundaryWarnings(req.getBoundaryWarnings())
                .orderViolations(req.getOrderViolations())
                .autoCompleted(req.getAutoCompleted())
                .build();
        sessionRepository.save(session);

        // 2. Update (or create) per-letter mastery record
        Optional<LetterMastery> existingOpt =
                masteryRepository.findByStudentIdAndLetter(req.getStudentId(), req.getLetter());

        boolean newBest = false;
        LetterMastery mastery;

        if (existingOpt.isPresent()) {
            mastery = existingOpt.get();
            newBest = req.getScore() > mastery.getBestScore();
            if (newBest) mastery.setBestScore(req.getScore());
            mastery.setAttemptCount(mastery.getAttemptCount() + 1);
            mastery.setLastAttemptedAt(LocalDateTime.now());
            boolean wasAlreadyMastered = mastery.getMastered();
            boolean nowMastered = isMastered(mastery.getBestScore());
            mastery.setMastered(nowMastered);
            if (nowMastered && !wasAlreadyMastered) {
                mastery.setFirstMasteredAt(LocalDateTime.now());
            }
        } else {
            newBest = true;
            boolean nowMastered = isMastered(req.getScore());
            mastery = LetterMastery.builder()
                    .student(student)
                    .letter(req.getLetter())
                    .sound(req.getSound())
                    .category(req.getCategory())
                    .difficulty(req.getDifficulty())
                    .bestScore(req.getScore())
                    .attemptCount(1)
                    .mastered(nowMastered)
                    .firstMasteredAt(nowMastered ? LocalDateTime.now() : null)
                    .lastAttemptedAt(LocalDateTime.now())
                    .build();
        }
        masteryRepository.save(mastery);

        // 3. Update aggregate progress
        TracingProgress progress = progressRepository.findByStudentId(req.getStudentId())
                .orElseGet(() -> TracingProgress.builder()
                        .student(student)
                        .totalPoints(0)
                        .masteredCount(0)
                        .totalAttempts(0)
                        .recentAccuracy(0)
                        .totalBoundaryWarnings(0)
                        .currentLetterIndex(0)
                        .build());

        int pointsEarned = computePoints(req.getScore());
        progress.setTotalPoints(progress.getTotalPoints() + pointsEarned);
        progress.setTotalAttempts(progress.getTotalAttempts() + 1);
        progress.setTotalBoundaryWarnings(
                progress.getTotalBoundaryWarnings() + req.getBoundaryWarnings());

        long masteredCount = masteryRepository.countByStudentIdAndMasteredTrue(req.getStudentId());
        progress.setMasteredCount((int) masteredCount);

        // Recent accuracy = avg of last 10 sessions (mirrors frontend slice(0,10))
        List<LetterTracingSession> last10 =
                sessionRepository.findTop10ByStudentIdOrderByCreatedAtDesc(req.getStudentId());
        if (!last10.isEmpty()) {
            int avg = (int) Math.round(
                    last10.stream().mapToInt(LetterTracingSession::getScore).average().orElse(0));
            progress.setRecentAccuracy(avg);
        }

        progressRepository.save(progress);

        // 4. Build and return response
        return LetterTracingSessionResponse.builder()
                .sessionId(session.getId())
                .letter(session.getLetter())
                .sound(session.getSound())
                .category(session.getCategory())
                .score(session.getScore())
                .keypointsCovered(session.getKeypointsCovered())
                .keypointsTotal(session.getKeypointsTotal())
                .boundaryWarnings(session.getBoundaryWarnings())
                .orderViolations(session.getOrderViolations())
                .autoCompleted(session.getAutoCompleted())
                .gradeLabel(resolveGradeLabel(session.getScore()))
                .gradeSymbol(resolveGradeSymbol(session.getScore()))
                .newBest(newBest)
                .bestScore(mastery.getBestScore())
                .mastered(mastery.getMastered())
                .totalPoints(progress.getTotalPoints())
                .masteredCount(progress.getMasteredCount())
                .recentAccuracy(progress.getRecentAccuracy())
                .createdAt(session.getCreatedAt())
                .build();
    }

    // ─── getProgress ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public TracingProgressResponse getProgress(Long studentId) {

        studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found: " + studentId));

        TracingProgress progress = progressRepository.findByStudentId(studentId)
                .orElseGet(() -> TracingProgress.builder()
                        .totalPoints(0)
                        .masteredCount(0)
                        .totalAttempts(0)
                        .recentAccuracy(0)
                        .totalBoundaryWarnings(0)
                        .currentLetterIndex(0)
                        .build());

        // Per-letter mastery list (rebuilds frontend progressMap + masteredSet)
        List<TracingProgressResponse.LetterMasteryResponse> masteryList =
                masteryRepository.findByStudentIdOrderByLastAttemptedAtDesc(studentId)
                        .stream()
                        .map(m -> TracingProgressResponse.LetterMasteryResponse.builder()
                                .letter(m.getLetter())
                                .sound(m.getSound())
                                .category(m.getCategory())
                                .difficulty(m.getDifficulty())
                                .bestScore(m.getBestScore())
                                .attemptCount(m.getAttemptCount())
                                .mastered(m.getMastered())
                                .build())
                        .collect(Collectors.toList());

        // Last 50 sessions (rebuilds frontend history array + accuracy chart)
        List<TracingProgressResponse.RecentSessionResponse> recentSessions =
                sessionRepository.findTop50ByStudentIdOrderByCreatedAtDesc(studentId)
                        .stream()
                        .map(s -> TracingProgressResponse.RecentSessionResponse.builder()
                                .letter(s.getLetter())
                                .score(s.getScore())
                                .category(s.getCategory())
                                .createdAt(s.getCreatedAt())
                                .build())
                        .collect(Collectors.toList());

        return TracingProgressResponse.builder()
                .studentId(studentId)
                .totalPoints(progress.getTotalPoints())
                .masteredCount(progress.getMasteredCount())
                .totalAttempts(progress.getTotalAttempts())
                .recentAccuracy(progress.getRecentAccuracy())
                .totalBoundaryWarnings(progress.getTotalBoundaryWarnings())
                .currentLetterIndex(progress.getCurrentLetterIndex())
                .masteryList(masteryList)
                .recentSessions(recentSessions)
                .lastUpdatedAt(progress.getLastUpdatedAt())
                .build();
    }

    // ─── updateCurrentLetterIndex ─────────────────────────────────────────────

    @Override
    @Transactional
    public void updateCurrentLetterIndex(UpdateLetterIndexRequest req) {

        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new NotFoundException("Student not found: " + req.getStudentId()));

        TracingProgress progress = progressRepository.findByStudentId(req.getStudentId())
                .orElseGet(() -> TracingProgress.builder()
                        .student(student)
                        .totalPoints(0)
                        .masteredCount(0)
                        .totalAttempts(0)
                        .recentAccuracy(0)
                        .totalBoundaryWarnings(0)
                        .currentLetterIndex(0)
                        .build());

        progress.setCurrentLetterIndex(req.getCurrentLetterIndex());
        progressRepository.save(progress);
    }

    // ─── getMasteryList ───────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<LetterMasteryResponse> getMasteryList(Long studentId) {
        return masteryRepository.findByStudentIdOrderByLastAttemptedAtDesc(studentId)
                .stream()
                .map(this::toMasteryResponse)
                .collect(Collectors.toList());
    }

    // ─── getLetterMastery ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public LetterMasteryResponse getLetterMastery(Long studentId, String letter) {
        LetterMastery mastery = masteryRepository.findByStudentIdAndLetter(studentId, letter)
                .orElseThrow(() -> new NotFoundException(
                        "No mastery record for student " + studentId + " letter " + letter));
        return toMasteryResponse(mastery);
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    private LetterMasteryResponse toMasteryResponse(LetterMastery m) {
        return LetterMasteryResponse.builder()
                .id(m.getId())
                .studentId(m.getStudent().getId())
                .letter(m.getLetter())
                .sound(m.getSound())
                .category(m.getCategory())
                .difficulty(m.getDifficulty())
                .bestScore(m.getBestScore())
                .attemptCount(m.getAttemptCount())
                .mastered(m.getMastered())
                .firstMasteredAt(m.getFirstMasteredAt())
                .lastAttemptedAt(m.getLastAttemptedAt())
                .build();
    }
}