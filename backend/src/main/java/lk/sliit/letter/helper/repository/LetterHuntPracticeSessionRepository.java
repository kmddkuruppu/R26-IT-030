package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.LetterHuntPracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LetterHuntPracticeSessionRepository
        extends JpaRepository<LetterHuntPracticeSession, Long> {
    List<LetterHuntPracticeSession> findByStudentIdOrderByCompletedAtDescIdDesc(Long studentId);
}
