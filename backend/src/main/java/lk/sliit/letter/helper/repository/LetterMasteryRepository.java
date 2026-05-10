package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.LetterMastery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LetterMasteryRepository extends JpaRepository<LetterMastery, Long> {

    Optional<LetterMastery> findByStudentIdAndLetter(Long studentId, String letter);

    List<LetterMastery> findByStudentIdOrderByLastAttemptedAtDesc(Long studentId);

    long countByStudentIdAndMasteredTrue(Long studentId);

    List<LetterMastery> findByStudentIdAndMasteredTrue(Long studentId);
}