package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.GameSession;
import lk.sliit.letter.helper.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    List<GameSession> findByStudentOrderByPlayedAtDesc(Student student);

    List<GameSession> findByStudentAndGameIdOrderByPlayedAtDesc(Student student, String gameId);

    List<GameSession> findByStudentAndGameSectionOrderByPlayedAtDesc(Student student, String section);

    // Total score across all games
    @Query("SELECT COALESCE(SUM(gs.score), 0) FROM GameSession gs WHERE gs.student = :student")
    Integer findTotalScoreByStudent(Student student);

    // Total stars earned
    @Query("SELECT COALESCE(SUM(gs.starsEarned), 0) FROM GameSession gs WHERE gs.student = :student")
    Integer findTotalStarsByStudent(Student student);

    // Best score per game
    @Query("SELECT gs FROM GameSession gs WHERE gs.student = :student AND gs.gameId = :gameId ORDER BY gs.score DESC")
    List<GameSession> findByStudentAndGameIdOrderByScoreDesc(Student student, String gameId);

    // Last 7 sessions for score trend (frontend chart)
    @Query("SELECT gs FROM GameSession gs WHERE gs.student = :student ORDER BY gs.playedAt DESC")
    List<GameSession> findLast7ByStudent(Student student,
                                         org.springframework.data.domain.Pageable pageable);

    // Games played count per gameId
    @Query("SELECT gs.gameId, COUNT(gs) FROM GameSession gs WHERE gs.student = :student GROUP BY gs.gameId")
    List<Object[]> countSessionsByGame(Student student);

    Optional<GameSession> findTopByStudentAndGameIdOrderByScoreDesc(Student student, String gameId);

    // ── distinct games a student has played (for GAMES_EXPLORED achievement) ──
    @Query("SELECT DISTINCT g.gameId FROM GameSession g WHERE g.student = :student")
    List<String> findDistinctGameIdsByStudent(@Param("student") Student student);

    // ── best (highest) stars a student ever got in one game (GAME_MASTERY) ──
    @Query("SELECT MAX(g.starsEarned) FROM GameSession g WHERE g.student = :student AND g.gameId = :gameId")
    Optional<Integer> findMaxStarsByStudentAndGameId(@Param("student") Student student, @Param("gameId") String gameId);

    // ── has the student ever hit 100% in one session? (PERFECT_SESSION) ──
    @Query("SELECT COUNT(g) > 0 FROM GameSession g WHERE g.student = :student AND g.percentage >= 100")
    boolean existsPerfectSessionByStudent(@Param("student") Student student);

    // ── finished a specific game within N moves or fewer (LOW_MOVES, e.g. Memory Match) ──
    @Query("SELECT COUNT(g) > 0 FROM GameSession g WHERE g.student = :student AND g.gameId = :gameId " +
            "AND g.movesCount IS NOT NULL AND g.movesCount <= :maxMoves")
    boolean existsLowMovesSession(@Param("student") Student student, @Param("gameId") String gameId, @Param("maxMoves") Integer maxMoves);

    // ── distinct calendar dates played, most recent first (for STREAK_DAYS) ──
    @Query(value = "SELECT DISTINCT DATE(played_at) AS d FROM game_sessions " +
            "WHERE student_id = :studentId ORDER BY d DESC", nativeQuery = true)
    List<java.sql.Date> findDistinctPlayedDatesNative(@Param("studentId") Long studentId);

    // ── per-game aggregated progress (gameId, sessionCount, bestScore, bestStars, lastPlayedAt) ──
    @Query("SELECT gs.gameId, COUNT(gs), MAX(gs.score), MAX(gs.starsEarned), MAX(gs.playedAt) " +
            "FROM GameSession gs WHERE gs.student = :student GROUP BY gs.gameId")
    List<Object[]> findGameProgressSummary(@Param("student") Student student);

    // ── NEW: delete all sessions for a student (needed before account deletion) ──
    @Modifying
    @Query("DELETE FROM GameSession g WHERE g.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);

}