package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.GameSession;
import lk.sliit.letter.helper.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}