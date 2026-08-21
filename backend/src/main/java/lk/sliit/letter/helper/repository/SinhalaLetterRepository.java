package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.SinhalaLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SinhalaLetterRepository extends JpaRepository<SinhalaLetter, Long> {
    List<SinhalaLetter> findAllByOrderByCategoryNameAscSortOrderAsc();
}