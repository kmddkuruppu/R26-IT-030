package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.AchievementCheckRequest;
import lk.sliit.letter.helper.controller.dto.request.FaceReactionRequest;
import lk.sliit.letter.helper.controller.dto.request.GameSessionRequest;
import lk.sliit.letter.helper.controller.dto.response.*;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.AchievementDefinition;
import lk.sliit.letter.helper.model.FaceReaction;
import lk.sliit.letter.helper.model.GameSession;
import lk.sliit.letter.helper.model.PlayerAchievement;
import lk.sliit.letter.helper.model.Student;
import lk.sliit.letter.helper.repository.AchievementDefinitionRepository;
import lk.sliit.letter.helper.repository.FaceReactionRepository;
import lk.sliit.letter.helper.repository.GameSessionRepository;
import lk.sliit.letter.helper.repository.PlayerAchievementRepository;
import lk.sliit.letter.helper.repository.StudentRepository;
import lk.sliit.letter.helper.service.GamifiedLearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GamifiedLearningServiceImpl implements GamifiedLearningService {

    private final GameSessionRepository           gameSessionRepository;
    private final FaceReactionRepository          faceReactionRepository;
    private final PlayerAchievementRepository     achievementRepository;
    private final StudentRepository               studentRepository;
    private final AchievementDefinitionRepository achievementDefinitionRepository; // NEW

    // Keep in sync with GAMES_CONFIG.length in GamifiedLearningPage.js
    private static final int TOTAL_GAMES_COUNT = 8;

    // ─────────────────────────────────────────────────────────────
    // Save game session → game_sessions table (UNCHANGED)
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
    // Save face reaction → face_reactions table (UNCHANGED)
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
    //
    // REWRITTEN: instead of 4 hardcoded if-blocks, this now loops every
    // ACTIVE AchievementDefinition (manageable from the Admin Panel) and
    // evaluates its criteria against data pulled fresh from the
    // repositories — never from client-sent numbers — so a student can
    // never fake an achievement by editing devtools values.
    //
    // Same method signature as before, so your existing controller
    // endpoint keeps working with zero changes.
    // ─────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public AchievementResponse checkAndEarnAchievements(
            AchievementCheckRequest request, String username) {

        Student student = findStudent(username);

        List<String> newlyEarnedCodes = new ArrayList<>();
        List<AchievementResponse.AchievementDetail> newlyEarnedDetails = new ArrayList<>();

        List<AchievementDefinition> definitions = achievementDefinitionRepository.findByActiveTrueOrderBySortOrderAsc();

        // Pre-compute the values most rules need, once, instead of re-querying per rule
        Integer totalScore = gameSessionRepository.findTotalScoreByStudent(student);
        if (totalScore == null) totalScore = 0;
        List<String> gamesPlayed = gameSessionRepository.findDistinctGameIdsByStudent(student);
        int currentStreak = computeCurrentStreak(student);

        for (AchievementDefinition def : definitions) {
            if (achievementRepository.existsByStudentAndAchievementType(student, def.getCode())) {
                continue; // already earned — skip
            }

            boolean satisfied = evaluateCriteria(def, student, totalScore, gamesPlayed, currentStreak);

            if (satisfied) {
                PlayerAchievement earned = PlayerAchievement.builder()
                        .student(student)
                        .achievementType(def.getCode())
                        .achievementTitle(def.getTitleEn())
                        .description(def.getDescriptionEn())
                        .gameType(request.getGameType())
                        .triggerScore(request.getScore())
                        .build();
                achievementRepository.save(earned);

                newlyEarnedCodes.add(def.getCode());
                newlyEarnedDetails.add(AchievementResponse.AchievementDetail.builder()
                        .code(def.getCode())
                        .titleEn(def.getTitleEn())
                        .titleSi(def.getTitleSi())
                        .descriptionEn(def.getDescriptionEn())
                        .descriptionSi(def.getDescriptionSi())
                        .icon(def.getIcon())
                        .tier(def.getTier().name())
                        .build());
            }
        }

        return AchievementResponse.builder()
                .newAchievementEarned(!newlyEarnedCodes.isEmpty())
                .earnedAchievements(newlyEarnedCodes)
                .earnedDetails(newlyEarnedDetails)
                .message(newlyEarnedCodes.isEmpty()
                        ? "No new achievements"
                        : "Achievements unlocked: " + String.join(", ", newlyEarnedCodes))
                .build();
    }

    // ── Rule evaluation — one switch per criteria type ─────────────
    private boolean evaluateCriteria(AchievementDefinition def, Student student,
                                     int totalScore, List<String> gamesPlayed, int currentStreak) {
        switch (def.getCriteriaType()) {
            case TOTAL_SCORE:
                return totalScore >= def.getCriteriaValue();

            case GAMES_EXPLORED:
                return gamesPlayed.size() >= def.getCriteriaValue();

            case ALL_GAMES_MASTERED:
                return gamesPlayed.size() >= TOTAL_GAMES_COUNT
                        && gamesPlayed.stream().allMatch(gameId ->
                        gameSessionRepository.findMaxStarsByStudentAndGameId(student, gameId).orElse(0) >= 3);

            case GAME_MASTERY:
                return def.getCriteriaGameId() != null
                        && gameSessionRepository.findMaxStarsByStudentAndGameId(student, def.getCriteriaGameId())
                        .orElse(0) >= def.getCriteriaValue();

            case STREAK_DAYS:
                return currentStreak >= def.getCriteriaValue();

            case PERFECT_SESSION:
                return gameSessionRepository.existsPerfectSessionByStudent(student);

            case LOW_MOVES:
                return def.getCriteriaGameId() != null
                        && gameSessionRepository.existsLowMovesSession(student, def.getCriteriaGameId(), def.getCriteriaValue());

            case POSITIVE_MOOD:
                return faceReactionRepository.countByStudentAndRawExpression(student, "happy") >= def.getCriteriaValue();

            default:
                return false;
        }
    }

    // ── Daily streak — computed on the fly from distinct played dates ──
    // (no extra table needed; game_sessions.played_at is enough)
    private int computeCurrentStreak(Student student) {
        List<java.sql.Date> sqlDates = gameSessionRepository.findDistinctPlayedDatesNative(student.getId());
        if (sqlDates.isEmpty()) return 0;

        List<LocalDate> dates = sqlDates.stream().map(java.sql.Date::toLocalDate).collect(Collectors.toList());
        LocalDate today = LocalDate.now();
        LocalDate mostRecent = dates.get(0);

        // Streak only counts if the student played today OR yesterday
        // (otherwise it's already broken as of right now)
        if (!mostRecent.equals(today) && !mostRecent.equals(today.minusDays(1))) {
            return 0;
        }

        int streak = 1;
        for (int i = 1; i < dates.size(); i++) {
            if (dates.get(i - 1).minusDays(1).equals(dates.get(i))) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
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
        int currentStreak  = computeCurrentStreak(student); // NEW

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

        // Achievements EARNED — enriched with icon/tier/Sinhala via the definition lookup
        List<PlayerStatsResponse.AchievementItem> achievementItems =
                achievementRepository
                        .findByStudentOrderByEarnedAtDesc(student)
                        .stream()
                        .map(this::toAchievementItem)
                        .collect(Collectors.toList());

        // Full catalog — earned + still-locked, for a "browse all badges" UI
        List<PlayerStatsResponse.AchievementItem> catalog = buildAchievementCatalog(student);

        return PlayerStatsResponse.builder()
                .totalScore(totalScore)
                .totalStars(totalStars)
                .badgeCount(badgeCount)
                .currentStreakDays(currentStreak)
                .last7Scores(last7Scores)
                .recentSessions(sessionResponses)
                .moodHistory(moodHistory)
                .achievements(achievementItems)
                .achievementCatalog(catalog)
                .build();
    }

    private PlayerStatsResponse.AchievementItem toAchievementItem(PlayerAchievement a) {
        AchievementDefinition def = achievementDefinitionRepository.findByCode(a.getAchievementType()).orElse(null);
        return PlayerStatsResponse.AchievementItem.builder()
                .achievementType(a.getAchievementType())
                .achievementTitle(a.getAchievementTitle())
                .description(a.getDescription())
                .earnedAt(a.getEarnedAt().toEpochSecond(ZoneOffset.UTC) * 1000L)
                .titleSi(def != null ? def.getTitleSi() : null)
                .descriptionSi(def != null ? def.getDescriptionSi() : null)
                .icon(def != null ? def.getIcon() : "🏆")
                .tier(def != null ? def.getTier().name() : "BRONZE")
                .earned(true)
                .build();
    }

    private List<PlayerStatsResponse.AchievementItem> buildAchievementCatalog(Student student) {
        List<String> earnedCodes = achievementRepository.findByStudentOrderByEarnedAtDesc(student)
                .stream().map(PlayerAchievement::getAchievementType).collect(Collectors.toList());

        return achievementDefinitionRepository.findByActiveTrueOrderBySortOrderAsc().stream()
                .map(def -> PlayerStatsResponse.AchievementItem.builder()
                        .achievementType(def.getCode())
                        .achievementTitle(def.getTitleEn())
                        .description(def.getDescriptionEn())
                        .titleSi(def.getTitleSi())
                        .descriptionSi(def.getDescriptionSi())
                        .icon(def.getIcon())
                        .tier(def.getTier().name())
                        .earned(earnedCodes.contains(def.getCode()))
                        .earnedAt(null)
                        .build())
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // Get recent reactions (UNCHANGED)
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
    // Helpers (UNCHANGED)
    // ─────────────────────────────────────────────────────────────
    private Student findStudent(String username) {
        if ("guest".equals(username)) {
            return studentRepository.findById(1L)
                    .orElseThrow(() -> new NotFoundException("Default student not found"));
        }
        return studentRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(
                        "Student not found: " + username));
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

    // ─────────────────────────────────────────────────────────────
// Get per-game progress breakdown (NEW — for GameProgress.js page)
// ─────────────────────────────────────────────────────────────
    @Override
    public GameProgressResponse getGameProgress(String username) {
        Student student = findStudent(username);
        List<Object[]> rows = gameSessionRepository.findGameProgressSummary(student);

        List<GameProgressResponse.GameProgressItem> items = rows.stream().map(r -> {
            String gameId          = (String) r[0];
            Long sessionsPlayed    = (Long) r[1];
            Integer bestScore      = (Integer) r[2];
            Integer bestStars      = (Integer) r[3];
            java.time.LocalDateTime lastPlayed = (java.time.LocalDateTime) r[4];

            return GameProgressResponse.GameProgressItem.builder()
                    .gameId(gameId)
                    .sessionsPlayed(sessionsPlayed.intValue())
                    .bestScore(bestScore)
                    .bestStars(bestStars)
                    .lastPlayedAt(lastPlayed != null
                            ? lastPlayed.toEpochSecond(ZoneOffset.UTC) * 1000L
                            : null)
                    .build();
        }).collect(Collectors.toList());

        return GameProgressResponse.builder()
                .games(items)
                .totalGamesPlayed(items.size())
                .totalGamesAvailable(TOTAL_GAMES_COUNT)
                .build();
    }
}
