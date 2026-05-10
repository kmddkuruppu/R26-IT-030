package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.RecognitionStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecognitionStatsRepository
        extends JpaRepository<RecognitionStats, Long> {

    Optional<RecognitionStats> findBySessionId(String sessionId);
    boolean existsBySessionId(String sessionId);
}