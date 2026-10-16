package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.SpeedQuizPracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpeedQuizPracticeSessionRepository
        extends JpaRepository<SpeedQuizPracticeSession, Long> {
    List<SpeedQuizPracticeSession> findByStudentIdOrderByCompletedAtDescIdDesc(Long studentId);
}
