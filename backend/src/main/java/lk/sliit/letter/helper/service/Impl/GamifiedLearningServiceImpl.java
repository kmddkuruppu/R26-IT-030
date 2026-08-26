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

    private final GameSessionRepository gameSessionRepository;
    private final FaceReactionRepository faceReactionRepository;
    private final PlayerAchievementRepository achievementRepository;
    private final StudentRepository studentRepository;
    private final AchievementDefinitionRepository achievementDefinitionRepository;

    // Keep in sync with GAMES_CONFIG.length in GamifiedLearningPage.js
    private static final int TOTAL_GAMES_COUNT = 7;


    // =============================================================
    // SAVE GAME SESSION
    // =============================================================

    @Override
    @Transactional
    public GameSessionResponse saveGameSession(
            GameSessionRequest request,
            String username) {

        Student student = findStudent(username);

        GameSession session = GameSession.builder()
                .student(student)
                .gameId(request.getGameId())
                .score(request.getScore())
                .maxScore(
                        request.getMaxScore() != null
                                ? request.getMaxScore()
                                : 100
                )
                .timeSeconds(request.getTimeSeconds())
                .movesCount(request.getMovesCount())
                .questionCount(request.getQuestionCount())
                .build();

        GameSession saved = gameSessionRepository.save(session);

        return buildSessionResponse(
                saved,
                "Game session saved successfully"
        );
    }


    // =============================================================
    // SAVE FACE REACTION
    // =============================================================

    @Override
    @Transactional
    public FaceReactionResponse saveFaceReaction(
            FaceReactionRequest request,
            String username) {

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

        FaceReaction saved =
                faceReactionRepository.save(reaction);

        return buildReactionResponse(saved);
    }


    // =============================================================
    // CHECK AND EARN ACHIEVEMENTS
    // =============================================================

    @Override
    @Transactional
    public AchievementResponse checkAndEarnAchievements(
            AchievementCheckRequest request,
            String username) {

        Student student = findStudent(username);

        List<String> newlyEarnedCodes =
                new ArrayList<>();

        List<AchievementResponse.AchievementDetail>
                newlyEarnedDetails =
                new ArrayList<>();

        List<AchievementDefinition> definitions =
                achievementDefinitionRepository
                        .findByActiveTrueOrderBySortOrderAsc();


        // ---------------------------------------------------------
        // Calculate achievement data from database
        // ---------------------------------------------------------

        Integer totalScore =
                gameSessionRepository
                        .findTotalScoreByStudent(student);

        if (totalScore == null) {
            totalScore = 0;
        }


        List<String> gamesPlayed =
                gameSessionRepository
                        .findDistinctGameIdsByStudent(student);


        int currentStreak =
                computeCurrentStreak(student);


        // ---------------------------------------------------------
        // Check every active achievement definition
        // ---------------------------------------------------------

        for (AchievementDefinition def : definitions) {

            // Already earned
            if (achievementRepository
                    .existsByStudentAndAchievementType(
                            student,
                            def.getCode())) {

                continue;
            }


            boolean satisfied =
                    evaluateCriteria(
                            def,
                            student,
                            totalScore,
                            gamesPlayed,
                            currentStreak
                    );


            if (satisfied) {

                /*
                 * IMPORTANT:
                 *
                 * GAME_MASTERY / LOW_MOVES
                 *      -> save the actual achievement game.
                 *
                 * GLOBAL achievements
                 *      -> gameType = null.
                 *
                 * This prevents achievements such as
                 * Completionist, Streak, Flawless, etc.
                 * from being incorrectly attached to the
                 * game that happened to trigger the check.
                 */

                String achievementGameType =
                        resolveAchievementGameType(def);


                PlayerAchievement earned =
                        PlayerAchievement.builder()

                                .student(student)

                                .achievementType(
                                        def.getCode()
                                )

                                .achievementTitle(
                                        def.getTitleEn()
                                )

                                .description(
                                        def.getDescriptionEn()
                                )

                                .gameType(
                                        achievementGameType
                                )

                                .triggerScore(
                                        request.getScore()
                                )

                                .build();


                achievementRepository.save(earned);


                newlyEarnedCodes.add(
                        def.getCode()
                );


                newlyEarnedDetails.add(

                        AchievementResponse
                                .AchievementDetail
                                .builder()

                                .code(
                                        def.getCode()
                                )

                                .titleEn(
                                        def.getTitleEn()
                                )

                                .titleSi(
                                        def.getTitleSi()
                                )

                                .descriptionEn(
                                        def.getDescriptionEn()
                                )

                                .descriptionSi(
                                        def.getDescriptionSi()
                                )

                                .icon(
                                        def.getIcon()
                                )

                                .tier(
                                        def.getTier().name()
                                )

                                .build()
                );
            }
        }


        return AchievementResponse.builder()

                .newAchievementEarned(
                        !newlyEarnedCodes.isEmpty()
                )

                .earnedAchievements(
                        newlyEarnedCodes
                )

                .earnedDetails(
                        newlyEarnedDetails
                )

                .message(
                        newlyEarnedCodes.isEmpty()
                                ? "No new achievements"
                                : "Achievements unlocked: "
                                + String.join(
                                ", ",
                                newlyEarnedCodes
                        )
                )

                .build();
    }


    // =============================================================
    // RESOLVE ACHIEVEMENT GAME TYPE
    // =============================================================

    /*
     * Game-specific achievements:
     *
     * GAME_MASTERY
     * LOW_MOVES
     *
     * These achievements belong to one particular game.
     *
     * Global achievements:
     *
     * TOTAL_SCORE
     * GAMES_EXPLORED
     * ALL_GAMES_MASTERED
     * STREAK_DAYS
     * PERFECT_SESSION
     * POSITIVE_MOOD
     *
     * These do NOT belong to one particular game,
     * therefore gameType must be NULL.
     */

    private String resolveAchievementGameType(
            AchievementDefinition def) {

        switch (def.getCriteriaType()) {

            case GAME_MASTERY:
            case LOW_MOVES:

                return def.getCriteriaGameId();

            default:

                return null;
        }
    }


    // =============================================================
    // ACHIEVEMENT RULE EVALUATION
    // =============================================================

    private boolean evaluateCriteria(
            AchievementDefinition def,
            Student student,
            int totalScore,
            List<String> gamesPlayed,
            int currentStreak) {

        switch (def.getCriteriaType()) {


            // -----------------------------------------------------
            // TOTAL SCORE
            // -----------------------------------------------------

            case TOTAL_SCORE:

                return totalScore
                        >= def.getCriteriaValue();


            // -----------------------------------------------------
            // DIFFERENT GAMES PLAYED
            // -----------------------------------------------------

            case GAMES_EXPLORED:

                return gamesPlayed.size()
                        >= def.getCriteriaValue();


            // -----------------------------------------------------
            // ALL 7 GAMES HAVE 3 STARS
            // -----------------------------------------------------

            case ALL_GAMES_MASTERED:

                return gamesPlayed.size()
                        >= TOTAL_GAMES_COUNT

                        && gamesPlayed.stream()
                        .allMatch(gameId ->

                                gameSessionRepository
                                        .findMaxStarsByStudentAndGameId(
                                                student,
                                                gameId
                                        )

                                        .orElse(0)

                                        >= 3
                        );


            // -----------------------------------------------------
            // 3 STARS IN SPECIFIC GAME
            // -----------------------------------------------------

            case GAME_MASTERY:

                return def.getCriteriaGameId() != null

                        && gameSessionRepository
                        .findMaxStarsByStudentAndGameId(
                                student,
                                def.getCriteriaGameId()
                        )

                        .orElse(0)

                        >= def.getCriteriaValue();


            // -----------------------------------------------------
            // PLAY STREAK
            // -----------------------------------------------------

            case STREAK_DAYS:

                return currentStreak
                        >= def.getCriteriaValue();


            // -----------------------------------------------------
            // PERFECT 100% SESSION
            // -----------------------------------------------------

            case PERFECT_SESSION:

                return gameSessionRepository
                        .existsPerfectSessionByStudent(
                                student
                        );


            // -----------------------------------------------------
            // LOW MOVES
            // -----------------------------------------------------

            case LOW_MOVES:

                return def.getCriteriaGameId() != null

                        && gameSessionRepository
                        .existsLowMovesSession(
                                student,
                                def.getCriteriaGameId(),
                                def.getCriteriaValue()
                        );


            // -----------------------------------------------------
            // HAPPY FACE REACTIONS
            // -----------------------------------------------------

            case POSITIVE_MOOD:

                return faceReactionRepository
                        .countByStudentAndRawExpression(
                                student,
                                "happy"
                        )

                        >= def.getCriteriaValue();


            default:

                return false;
        }
    }


    // =============================================================
    // CURRENT PLAY STREAK
    // =============================================================

    private int computeCurrentStreak(Student student) {

        List<LocalDate> dates =
                gameSessionRepository.findDistinctPlayedDatesNative(
                        student.getId()
                );

        if (dates == null || dates.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate mostRecent = dates.get(0);

        // Streak is still active only if the latest play date is
        // today or yesterday.
        if (!mostRecent.equals(today)
                && !mostRecent.equals(today.minusDays(1))) {
            return 0;
        }

        int streak = 1;

        for (int i = 1; i < dates.size(); i++) {

            LocalDate previousDate = dates.get(i - 1);
            LocalDate currentDate = dates.get(i);

            if (previousDate.minusDays(1).equals(currentDate)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }


    // =============================================================
    // PLAYER STATS
    // =============================================================

    @Override
    public PlayerStatsResponse getPlayerStats(
            String username) {

        Student student =
                findStudent(username);


        Integer totalScore =
                gameSessionRepository
                        .findTotalScoreByStudent(
                                student
                        );


        Integer totalStars =
                gameSessionRepository
                        .findTotalStarsByStudent(
                                student
                        );


        int badgeCount =
                achievementRepository
                        .countByStudent(
                                student
                        );


        int currentStreak =
                computeCurrentStreak(
                        student
                );


        // ---------------------------------------------------------
        // Last 7 scores
        // ---------------------------------------------------------

        List<GameSession> last7 =
                gameSessionRepository
                        .findLast7ByStudent(
                                student,
                                PageRequest.of(
                                        0,
                                        7
                                )
                        );


        List<Integer> last7Scores =
                last7.stream()

                        .sorted(
                                Comparator.comparing(
                                        GameSession::getPlayedAt
                                )
                        )

                        .map(
                                GameSession::getScore
                        )

                        .collect(
                                Collectors.toList()
                        );


        // ---------------------------------------------------------
        // Recent sessions
        // ---------------------------------------------------------

        List<GameSessionResponse>
                sessionResponses =

                gameSessionRepository
                        .findByStudentOrderByPlayedAtDesc(
                                student
                        )

                        .stream()

                        .limit(20)

                        .map(
                                s ->
                                        buildSessionResponse(
                                                s,
                                                null
                                        )
                        )

                        .collect(
                                Collectors.toList()
                        );


        // ---------------------------------------------------------
        // Mood history
        // ---------------------------------------------------------

        List<PlayerStatsResponse.MoodHistoryItem>
                moodHistory =

                faceReactionRepository
                        .findRecentByStudent(
                                student,
                                PageRequest.of(
                                        0,
                                        20
                                )
                        )

                        .stream()

                        .map(r ->

                                PlayerStatsResponse
                                        .MoodHistoryItem
                                        .builder()

                                        .emoji(
                                                r.getEmoji()
                                        )

                                        .en(
                                                r.getLabelEn()
                                        )

                                        .si(
                                                r.getLabelSi()
                                        )

                                        .ta(
                                                r.getLabelTa()
                                        )

                                        .game(
                                                r.getGameId()
                                        )

                                        .time(
                                                r.getCapturedAt()
                                                        .toEpochSecond(
                                                                ZoneOffset.UTC
                                                        )
                                                        * 1000L
                                        )

                                        .build()
                        )

                        .collect(
                                Collectors.toList()
                        );


        // ---------------------------------------------------------
        // Earned achievements
        // ---------------------------------------------------------

        List<PlayerStatsResponse.AchievementItem>
                achievementItems =

                achievementRepository
                        .findByStudentOrderByEarnedAtDesc(
                                student
                        )

                        .stream()

                        .map(
                                this::toAchievementItem
                        )

                        .collect(
                                Collectors.toList()
                        );


        // ---------------------------------------------------------
        // Full achievement catalog
        // ---------------------------------------------------------

        List<PlayerStatsResponse.AchievementItem>
                catalog =

                buildAchievementCatalog(
                        student
                );


        return PlayerStatsResponse.builder()

                .totalScore(
                        totalScore != null
                                ? totalScore
                                : 0
                )

                .totalStars(
                        totalStars != null
                                ? totalStars
                                : 0
                )

                .badgeCount(
                        badgeCount
                )

                .currentStreakDays(
                        currentStreak
                )

                .last7Scores(
                        last7Scores
                )

                .recentSessions(
                        sessionResponses
                )

                .moodHistory(
                        moodHistory
                )

                .achievements(
                        achievementItems
                )

                .achievementCatalog(
                        catalog
                )

                .build();
    }


    // =============================================================
    // CONVERT PLAYER ACHIEVEMENT
    // =============================================================

    private PlayerStatsResponse.AchievementItem
    toAchievementItem(
            PlayerAchievement achievement) {


        AchievementDefinition def =
                achievementDefinitionRepository
                        .findByCode(
                                achievement
                                        .getAchievementType()
                        )

                        .orElse(null);


        return PlayerStatsResponse
                .AchievementItem
                .builder()

                .achievementType(
                        achievement
                                .getAchievementType()
                )

                .achievementTitle(
                        achievement
                                .getAchievementTitle()
                )

                .description(
                        achievement
                                .getDescription()
                )

                .earnedAt(
                        achievement
                                .getEarnedAt()
                                .toEpochSecond(
                                        ZoneOffset.UTC
                                )
                                * 1000L
                )

                .titleSi(
                        def != null
                                ? def.getTitleSi()
                                : null
                )

                .descriptionSi(
                        def != null
                                ? def.getDescriptionSi()
                                : null
                )

                .icon(
                        def != null
                                ? def.getIcon()
                                : "🏆"
                )

                .tier(
                        def != null
                                ? def.getTier().name()
                                : "BRONZE"
                )

                .earned(true)

                .build();
    }


    // =============================================================
    // BUILD FULL ACHIEVEMENT CATALOG
    // =============================================================

    private List<PlayerStatsResponse.AchievementItem>
    buildAchievementCatalog(
            Student student) {


        List<String> earnedCodes =
                achievementRepository
                        .findByStudentOrderByEarnedAtDesc(
                                student
                        )

                        .stream()

                        .map(
                                PlayerAchievement::
                                        getAchievementType
                        )

                        .collect(
                                Collectors.toList()
                        );


        return achievementDefinitionRepository
                .findByActiveTrueOrderBySortOrderAsc()

                .stream()

                .map(def ->

                        PlayerStatsResponse
                                .AchievementItem
                                .builder()

                                .achievementType(
                                        def.getCode()
                                )

                                .achievementTitle(
                                        def.getTitleEn()
                                )

                                .description(
                                        def.getDescriptionEn()
                                )

                                .titleSi(
                                        def.getTitleSi()
                                )

                                .descriptionSi(
                                        def.getDescriptionSi()
                                )

                                .icon(
                                        def.getIcon()
                                )

                                .tier(
                                        def.getTier().name()
                                )

                                .earned(
                                        earnedCodes.contains(
                                                def.getCode()
                                        )
                                )

                                .earnedAt(null)

                                .build()
                )

                .collect(
                        Collectors.toList()
                );
    }


    // =============================================================
    // RECENT FACE REACTIONS
    // =============================================================

    @Override
    public List<FaceReactionResponse>
    getRecentReactions(
            String username) {


        Student student =
                findStudent(username);


        return faceReactionRepository
                .findRecentByStudent(
                        student,
                        PageRequest.of(
                                0,
                                20
                        )
                )

                .stream()

                .map(
                        this::buildReactionResponse
                )

                .collect(
                        Collectors.toList()
                );
    }


    // =============================================================
    // FIND STUDENT
    // =============================================================

    private Student findStudent(
            String username) {


        if ("guest".equals(username)) {

            return studentRepository
                    .findById(1L)

                    .orElseThrow(() ->
                            new NotFoundException(
                                    "Default student not found"
                            )
                    );
        }


        return studentRepository
                .findByUsername(
                        username
                )

                .orElseThrow(() ->
                        new NotFoundException(
                                "Student not found: "
                                        + username
                        )
                );
    }


    // =============================================================
    // BUILD GAME SESSION RESPONSE
    // =============================================================

    private GameSessionResponse
    buildSessionResponse(
            GameSession session,
            String message) {


        return GameSessionResponse
                .builder()

                .id(
                        session.getId()
                )

                .gameId(
                        session.getGameId()
                )

                .gameSection(
                        session.getGameSection()
                )

                .score(
                        session.getScore()
                )

                .maxScore(
                        session.getMaxScore()
                )

                .percentage(
                        session.getPercentage()
                )

                .starsEarned(
                        session.getStarsEarned()
                )

                .timeSeconds(
                        session.getTimeSeconds()
                )

                .movesCount(
                        session.getMovesCount()
                )

                .questionCount(
                        session.getQuestionCount()
                )

                .resultLabel(
                        session.getResultLabel()
                )

                .playedAt(
                        session.getPlayedAt()
                )

                .message(
                        message
                )

                .build();
    }


    // =============================================================
    // BUILD FACE REACTION RESPONSE
    // =============================================================

    private FaceReactionResponse
    buildReactionResponse(
            FaceReaction reaction) {


        return FaceReactionResponse
                .builder()

                .id(
                        reaction.getId()
                )

                .gameId(
                        reaction.getGameId()
                )

                .rawExpression(
                        reaction.getRawExpression()
                )

                .emoji(
                        reaction.getEmoji()
                )

                .labelEn(
                        reaction.getLabelEn()
                )

                .labelSi(
                        reaction.getLabelSi()
                )

                .labelTa(
                        reaction.getLabelTa()
                )

                .confidence(
                        reaction.getConfidence()
                )

                .capturedAt(
                        reaction.getCapturedAt()
                )

                .build();
    }


    // =============================================================
    // GAME PROGRESS
    // =============================================================

    @Override
    public GameProgressResponse getGameProgress(
            String username) {


        Student student =
                findStudent(username);


        List<Object[]> rows =
                gameSessionRepository
                        .findGameProgressSummary(
                                student
                        );


        List<GameProgressResponse.GameProgressItem>
                items =

                rows.stream()

                        .map(row -> {


                            String gameId =
                                    (String) row[0];


                            Long sessionsPlayed =
                                    (Long) row[1];


                            Integer bestScore =
                                    (Integer) row[2];


                            Integer bestStars =
                                    (Integer) row[3];


                            java.time.LocalDateTime
                                    lastPlayed =

                                    (java.time.LocalDateTime)
                                            row[4];


                            // -------------------------------------
                            // FACE REACTIONS FOR THIS GAME
                            // -------------------------------------

                            List<FaceReactionResponse>
                                    reactions =

                                    faceReactionRepository
                                            .findByStudentAndGameIdOrderByCapturedAtDesc(
                                                    student,
                                                    gameId
                                            )

                                            .stream()

                                            .limit(6)

                                            .map(
                                                    this::
                                                            buildReactionResponse
                                            )

                                            .collect(
                                                    Collectors.toList()
                                            );


                            // -------------------------------------
                            // GAME-SPECIFIC ACHIEVEMENTS
                            // -------------------------------------

                            List<PlayerStatsResponse.AchievementItem>
                                    achievements =

                                    achievementRepository
                                            .findByStudentAndGameTypeOrderByEarnedAtDesc(
                                                    student,
                                                    gameId
                                            )

                                            .stream()

                                            .map(
                                                    this::
                                                            toAchievementItem
                                            )

                                            .collect(
                                                    Collectors.toList()
                                            );


                            return GameProgressResponse
                                    .GameProgressItem
                                    .builder()

                                    .gameId(
                                            gameId
                                    )

                                    .sessionsPlayed(
                                            sessionsPlayed
                                                    .intValue()
                                    )

                                    .bestScore(
                                            bestScore
                                    )

                                    .bestStars(
                                            bestStars
                                    )

                                    .lastPlayedAt(
                                            lastPlayed != null

                                                    ? lastPlayed
                                                    .toEpochSecond(
                                                            ZoneOffset.UTC
                                                    )
                                                    * 1000L

                                                    : null
                                    )

                                    .faceReactions(
                                            reactions
                                    )

                                    .achievements(
                                            achievements
                                    )

                                    .build();

                        })

                        .collect(
                                Collectors.toList()
                        );


        return GameProgressResponse
                .builder()

                .games(
                        items
                )

                .totalGamesPlayed(
                        items.size()
                )

                .totalGamesAvailable(
                        TOTAL_GAMES_COUNT
                )

                .build();
    }
}