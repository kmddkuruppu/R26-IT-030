package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.AchievementCheckRequest;
import lk.sliit.letter.helper.controller.dto.request.FaceReactionRequest;
import lk.sliit.letter.helper.controller.dto.request.GameSessionRequest;
import lk.sliit.letter.helper.controller.dto.response.AchievementResponse;
import lk.sliit.letter.helper.controller.dto.response.FaceReactionResponse;
import lk.sliit.letter.helper.controller.dto.response.GameSessionResponse;
import lk.sliit.letter.helper.controller.dto.response.PlayerStatsResponse;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.FaceReaction;
import lk.sliit.letter.helper.model.GameSession;
import lk.sliit.letter.helper.model.PlayerAchievement;
import lk.sliit.letter.helper.model.Student;
import lk.sliit.letter.helper.repository.FaceReactionRepository;
import lk.sliit.letter.helper.repository.GameSessionRepository;
import lk.sliit.letter.helper.repository.PlayerAchievementRepository;
import lk.sliit.letter.helper.repository.StudentRepository;
import lk.sliit.letter.helper.service.GamifiedLearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GamifiedLearningServiceImpl implements GamifiedLearningService {

    private final GameSessionRepository      gameSessionRepository;
    private final FaceReactionRepository     faceReactionRepository;
    private final PlayerAchievementRepository achievementRepository;
    private final StudentRepository          studentRepository;

    private static final Map<String, String> ACHIEVEMENT_TITLES = Map.of(
            "master",        "Master Learner",
            "speed_demon",   "Speed Demon",
            "puzzle_master", "Puzzle Master",
            "word_wizard",   "Word Wizard",
            "perfect_memory","Perfect Memory"
    );

    private static final Map<String, String> ACHIEVEMENT_DESC = Map.of(
            "master",        "Earned 500+ total points",
            "speed_demon",   "Scored 100+ in Speed Quiz",
            "puzzle_master", "High score in Letter Puzzle",
            "word_wizard",   "Mastered Word Builder",
            "perfect_memory","Completed Memory Match in 6 moves or fewer"
    );

    // ─────────────────────────────────────────────────────────────
    // Save game session → game_sessions table
    // ─────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public GameSessionResponse saveGameSession(GameSessionRequest request, String username) {
        Student student = findStudent(username);

        GameSession session = GameSession.builder()
                .student(student)
                .gameId(request.getGameId())
                .score(request.getScore())
                .maxScore(request.getMaxScore() != null ? request.getMaxScore() : 100)
                .timeSeconds(request.getTimeSeconds())
                .movesCount(request.getMovesCount())
                .questionCount(request.getQuestionCount())
                .build();

        GameSession saved = gameSessionRepository.save(session);
        return buildSessionResponse(saved, "Game session saved successfully");
    }

    // ─────────────────────────────────────────────────────────────
    // Save face reaction → face_reactions table
    // ─────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public FaceReactionResponse saveFaceReaction(FaceReactionRequest request, String username) {
        Student student = findStudent(username);

        FaceReaction reaction = FaceReaction.builder()
                .student(student)
                .gameId(request.getGameId())
                .rawExpression(request.getRawExpression())
                .emoji(request.getEmoji())
                .labelEn(request.getLabelEn())
                .labelSi(request.getLabelSi())
                .labelTa(request.getLabelTa())
                .confidence(request.getConfidence())
                .build();

        FaceReaction saved = faceReactionRepository.save(reaction);
        return buildReactionResponse(saved);
    }

    // ─────────────────────────────────────────────────────────────
    // Check & earn achievements → player_achievements table
    // ─────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public AchievementResponse checkAndEarnAchievements(
            AchievementCheckRequest request, String username) {

        Student student = findStudent(username);
        List<String> newlyEarned = new ArrayList<>();

        // Master Learner — total score >= 500
        if (request.getTotalScore() != null && request.getTotalScore() >= 500) {
            tryEarn(student, "master", request.getGameType(),
                    request.getTotalScore(), newlyEarned);
        }

        // Speed Demon — speed-quiz score >= 100
        if ("speed-quiz".equals(request.getGameType())
                && request.getScore() != null && request.getScore() >= 100) {
            tryEarn(student, "speed_demon", request.getGameType(),
                    request.getScore(), newlyEarned);
        }

        // Puzzle Master — letter-puzzle score >= 200
        if ("letter-puzzle".equals(request.getGameType())
                && request.getScore() != null && request.getScore() >= 200) {
            tryEarn(student, "puzzle_master", request.getGameType(),
                    request.getScore(), newlyEarned);
        }

        // Word Wizard — word-builder score >= 300
        if ("word-builder".equals(request.getGameType())
                && request.getScore() != null && request.getScore() >= 300) {
            tryEarn(student, "word_wizard", request.getGameType(),
                    request.getScore(), newlyEarned);
        }

        return AchievementResponse.builder()
                .newAchievementEarned(!newlyEarned.isEmpty())
                .earnedAchievements(newlyEarned)
                .message(newlyEarned.isEmpty()
                        ? "No new achievements"
                        : "Achievements unlocked: " + String.join(", ", newlyEarned))
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // Get full player stats
    // ─────────────────────────────────────────────────────────────
    @Override
    public PlayerStatsResponse getPlayerStats(String username) {
        Student student = findStudent(username);

        Integer totalScore = gameSessionRepository.findTotalScoreByStudent(student);
        Integer totalStars = gameSessionRepository.findTotalStarsByStudent(student);
        int badgeCount     = achievementRepository.countByStudent(student);

        // Last 7 sessions score trend
        List<GameSession> last7 = gameSessionRepository
                .findLast7ByStudent(student, PageRequest.of(0, 7));
        List<Integer> last7Scores = last7.stream()
                .sorted(Comparator.comparing(GameSession::getPlayedAt))
                .map(GameSession::getScore)
                .collect(Collectors.toList());

        // Recent sessions
        List<GameSessionResponse> sessionResponses = gameSessionRepository
                .findByStudentOrderByPlayedAtDesc(student)
                .stream()
                .limit(20)
                .map(s -> buildSessionResponse(s, null))
                .collect(Collectors.toList());

        // Mood history — matches frontend moodHistory state shape
        List<PlayerStatsResponse.MoodHistoryItem> moodHistory =
                faceReactionRepository
                        .findRecentByStudent(student, PageRequest.of(0, 20))
                        .stream()
                        .map(r -> PlayerStatsResponse.MoodHistoryItem.builder()
                                .emoji(r.getEmoji())
                                .en(r.getLabelEn())
                                .si(r.getLabelSi())
                                .ta(r.getLabelTa())
                                .game(r.getGameId())
                                .time(r.getCapturedAt()
                                        .toEpochSecond(ZoneOffset.UTC) * 1000L)
                                .build())
                        .collect(Collectors.toList());

        // Achievements
        List<PlayerStatsResponse.AchievementItem> achievementItems =
                achievementRepository
                        .findByStudentOrderByEarnedAtDesc(student)
                        .stream()
                        .map(a -> PlayerStatsResponse.AchievementItem.builder()
                                .achievementType(a.getAchievementType())
                                .achievementTitle(a.getAchievementTitle())
                                .description(a.getDescription())
                                .earnedAt(a.getEarnedAt()
                                        .toEpochSecond(ZoneOffset.UTC) * 1000L)
                                .build())
                        .collect(Collectors.toList());

        return PlayerStatsResponse.builder()
                .totalScore(totalScore)
                .totalStars(totalStars)
                .badgeCount(badgeCount)
                .last7Scores(last7Scores)
                .recentSessions(sessionResponses)
                .moodHistory(moodHistory)
                .achievements(achievementItems)
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // Get recent reactions
    // ─────────────────────────────────────────────────────────────
    @Override
    public List<FaceReactionResponse> getRecentReactions(String username) {
        Student student = findStudent(username);
        return faceReactionRepository
                .findRecentByStudent(student, PageRequest.of(0, 20))
                .stream()
                .map(this::buildReactionResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────
    private Student findStudent(String username) {
        return studentRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(
                        "Student not found: " + username));
    }

    private void tryEarn(Student student, String type,
                         String gameType, Integer score,
                         List<String> earnedList) {
        if (!achievementRepository.existsByStudentAndAchievementType(student, type)) {
            achievementRepository.save(PlayerAchievement.builder()
                    .student(student)
                    .achievementType(type)
                    .achievementTitle(ACHIEVEMENT_TITLES.getOrDefault(type, type))
                    .description(ACHIEVEMENT_DESC.getOrDefault(type, ""))
                    .gameType(gameType)
                    .triggerScore(score)
                    .build());
            earnedList.add(type);
        }
    }

    private GameSessionResponse buildSessionResponse(GameSession s, String message) {
        return GameSessionResponse.builder()
                .id(s.getId())
                .gameId(s.getGameId())
                .gameSection(s.getGameSection())
                .score(s.getScore())
                .maxScore(s.getMaxScore())
                .percentage(s.getPercentage())
                .starsEarned(s.getStarsEarned())
                .timeSeconds(s.getTimeSeconds())
                .movesCount(s.getMovesCount())
                .questionCount(s.getQuestionCount())
                .resultLabel(s.getResultLabel())
                .playedAt(s.getPlayedAt())
                .message(message)
                .build();
    }

    private FaceReactionResponse buildReactionResponse(FaceReaction r) {
        return FaceReactionResponse.builder()
                .id(r.getId())
                .gameId(r.getGameId())
                .rawExpression(r.getRawExpression())
                .emoji(r.getEmoji())
                .labelEn(r.getLabelEn())
                .labelSi(r.getLabelSi())
                .labelTa(r.getLabelTa())
                .confidence(r.getConfidence())
                .capturedAt(r.getCapturedAt())
                .build();
    }
}