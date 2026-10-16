package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.SpeedQuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpeedQuizAttemptRepository
        extends JpaRepository<SpeedQuizAttempt, Long> {

    List<SpeedQuizAttempt> findByStudentIdOrderByAttemptedAtAscIdAsc(
            Long studentId
    );
}