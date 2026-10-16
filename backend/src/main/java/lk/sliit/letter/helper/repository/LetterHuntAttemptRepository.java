package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.LetterHuntAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LetterHuntAttemptRepository
        extends JpaRepository<LetterHuntAttempt, Long> {

    List<LetterHuntAttempt> findByStudentIdOrderByAttemptedAtAscIdAsc(
            Long studentId
    );
}