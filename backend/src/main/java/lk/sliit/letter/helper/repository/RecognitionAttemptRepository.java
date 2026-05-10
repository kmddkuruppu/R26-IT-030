package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.RecognitionAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecognitionAttemptRepository
        extends JpaRepository<RecognitionAttempt, Long> {

    // All attempts for a session — getRecognitionHistory()
    List<RecognitionAttempt> findBySessionIdOrderByAttemptedAtDesc(
            String sessionId);

    // Per-letter breakdown — getLetterPracticeHistory()
    List<RecognitionAttempt> findBySessionIdAndRecognizedLetter(
            String sessionId, String recognizedLetter);

    // All attempts for a specific letter
    @Query("SELECT a FROM RecognitionAttempt a " +
            "WHERE a.sessionId = :sid " +
            "AND a.recognizedLetter = :letter " +
            "ORDER BY a.attemptedAt DESC")
    List<RecognitionAttempt> findBySessionAndLetter(
            @Param("sid") String sessionId,
            @Param("letter") String letter);

    // Count per letter for practice breakdown
    @Query("SELECT a.recognizedLetter, COUNT(a), " +
            "SUM(CASE WHEN a.wasCorrect = true THEN 1 ELSE 0 END) " +
            "FROM RecognitionAttempt a " +
            "WHERE a.sessionId = :sid " +
            "GROUP BY a.recognizedLetter")
    List<Object[]> getLetterBreakdown(@Param("sid") String sessionId);
}