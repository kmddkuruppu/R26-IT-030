package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.FaceReactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface FaceReactionLogRepository extends JpaRepository<FaceReactionLog, Long> {

    List<FaceReactionLog> findByGameSessionIdOrderByCapturedAtAsc(Long gameSessionId);

    List<FaceReactionLog> findByUsernameOrderByCapturedAtDesc(String username);

    List<FaceReactionLog> findByUsernameAndGameIdOrderByCapturedAtDesc(String username, String gameId);

    List<FaceReactionLog> findByUsernameOrderByCapturedAtAsc(String username);

    // ── NEW: bulk delete for account deletion ──────────────────────────
    // Used by StudentServiceImpl.deleteAccount() to clear face_reaction_logs
    // rows before game_sessions is deleted, since this table holds a
    // game_session_id FK that would otherwise block deleting the parent
    // game_sessions row.
    @Modifying
    long deleteByUsername(String username);
}