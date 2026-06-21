package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.FaceReaction;
import lk.sliit.letter.helper.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaceReactionRepository extends JpaRepository<FaceReaction, Long> {

    List<FaceReaction> findByStudentOrderByCapturedAtDesc(Student student);

    List<FaceReaction> findByStudentAndGameIdOrderByCapturedAtDesc(Student student, String gameId);

    // For mood frequency chart (frontend moodCounts)
    @Query("SELECT fr.rawExpression, fr.emoji, COUNT(fr) FROM FaceReaction fr " +
            "WHERE fr.student = :student GROUP BY fr.rawExpression, fr.emoji ORDER BY COUNT(fr) DESC")
    List<Object[]> findMoodFrequencyByStudent(Student student);

    // Recent 20 for mood history panel (matches frontend slice(0,20))
    @Query("SELECT fr FROM FaceReaction fr WHERE fr.student = :student ORDER BY fr.capturedAt DESC")
    List<FaceReaction> findRecentByStudent(Student student,
                                           org.springframework.data.domain.Pageable pageable);
}