package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.AdaptationEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdaptationEventRepository extends JpaRepository<AdaptationEvent, Long> {

    List<AdaptationEvent> findByUsernameOrderByCreatedAtDesc(String username);

    List<AdaptationEvent> findAllByOrderByCreatedAtDesc();

    List<AdaptationEvent> findByGameIdOrderByCreatedAtDesc(String gameId);
}