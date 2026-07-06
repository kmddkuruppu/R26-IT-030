package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.SinhalaWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SinhalaWordRepository extends JpaRepository<SinhalaWord, Long> {
    List<SinhalaWord> findAllByOrderByIdAsc();
}