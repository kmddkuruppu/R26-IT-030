package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.FaceReaction;
import lk.sliit.letter.helper.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // ── count how many "happy" reactions a student has (POSITIVE_MOOD achievement) ──
    long countByStudentAndRawExpression(Student student, String rawExpression);

    // ── bulk delete for account deletion ──────────────────────────
    // Used by StudentServiceImpl.deleteAccount() to clear face_reactions
    // rows before deleting the student row itself (student_id is a
    // NOT NULL FK on this table, so the student delete fails with a
    // ConstraintViolationException otherwise). Bulk JPQL delete avoids
    // loading every row into memory first — this table can grow large
    // (one row per captured expression per game session).
    @Modifying
    @Query("DELETE FROM FaceReaction fr WHERE fr.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);
}