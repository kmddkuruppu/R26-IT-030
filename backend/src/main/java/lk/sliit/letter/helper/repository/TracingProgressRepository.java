package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.TracingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TracingProgressRepository extends JpaRepository<TracingProgress, Long> {

    Optional<TracingProgress> findByStudentId(Long studentId);
}