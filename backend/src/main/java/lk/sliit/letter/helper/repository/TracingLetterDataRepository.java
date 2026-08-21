package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.TracingLetterData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TracingLetterDataRepository extends JpaRepository<TracingLetterData, Long> {
    List<TracingLetterData> findAllByOrderByOrderIndexAsc();
    List<TracingLetterData> findByCategory_IdOrderByOrderIndexAsc(Long categoryId);
}