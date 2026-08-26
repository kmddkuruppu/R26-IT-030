package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.PlayerAchievement;
import lk.sliit.letter.helper.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerAchievementRepository extends JpaRepository<PlayerAchievement, Long> {

    List<PlayerAchievement> findByStudentOrderByEarnedAtDesc(Student student);

    // NEW — achievements earned while playing a specific game
    List<PlayerAchievement> findByStudentAndGameTypeOrderByEarnedAtDesc(
            Student student,
            String gameType
    );

    boolean existsByStudentAndAchievementType(
            Student student,
            String achievementType
    );

    Optional<PlayerAchievement> findByStudentAndAchievementType(
            Student student,
            String achievementType
    );

    int countByStudent(Student student);

    // ── NEW: delete all achievements for a student (needed before account deletion) ──
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM PlayerAchievement p WHERE p.student.id = :studentId")
    void deleteByStudentId(@org.springframework.data.repository.query.Param("studentId") Long studentId);
}