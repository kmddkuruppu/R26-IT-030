package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.LetterTracingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LetterTracingSessionRepository extends JpaRepository<LetterTracingSession, Long> {

    /** Last N sessions for a student — used to rebuild the history array and accuracy chart */
    List<LetterTracingSession> findTop50ByStudentIdOrderByCreatedAtDesc(Long studentId);

    /** Last 10 sessions for recent-accuracy calculation (mirrors frontend slice(0,10)) */
    List<LetterTracingSession> findTop10ByStudentIdOrderByCreatedAtDesc(Long studentId);

    /** All sessions for a specific letter — for per-letter analytics */
    List<LetterTracingSession> findByStudentIdAndLetterOrderByCreatedAtDesc(Long studentId, String letter);

    /** Count of attempts for a student */
    long countByStudentId(Long studentId);

    /** Average score per student (useful for admin analytics) */
    @Query("SELECT COALESCE(AVG(s.score), 0) FROM LetterTracingSession s WHERE s.student.id = :studentId")
    Double findAverageScoreByStudentId(@Param("studentId") Long studentId);
}