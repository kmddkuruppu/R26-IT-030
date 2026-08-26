package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.AdaptationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface AdaptationEventRepository extends JpaRepository<AdaptationEvent, Long> {

    List<AdaptationEvent> findByUsernameOrderByCreatedAtDesc(String username);

    List<AdaptationEvent> findAllByOrderByCreatedAtDesc();

    List<AdaptationEvent> findByGameIdOrderByCreatedAtDesc(String gameId);

    // ── NEW: bulk delete for account deletion ──────────────────────────
    // Used by StudentServiceImpl.deleteAccount() to clear adaptation_events
    // rows before game_sessions/students are deleted, since this table
    // holds a game_session_id FK that would otherwise block deleting the
    // parent game_sessions row.
    @Modifying
    long deleteByUsername(String username);
}