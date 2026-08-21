package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.TracingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TracingCategoryRepository extends JpaRepository<TracingCategory, Long> {
    Optional<TracingCategory> findByCode(String code);
    List<TracingCategory> findAllByOrderByOrderIndexAsc();
    boolean existsByCode(String code);
}