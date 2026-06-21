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

    boolean existsByStudentAndAchievementType(Student student, String achievementType);

    Optional<PlayerAchievement> findByStudentAndAchievementType(Student student, String achievementType);

    int countByStudent(Student student);
}