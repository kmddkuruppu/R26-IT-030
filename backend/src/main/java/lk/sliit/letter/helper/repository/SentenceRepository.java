package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.Sentence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SentenceRepository extends JpaRepository<Sentence, Long> {
}
