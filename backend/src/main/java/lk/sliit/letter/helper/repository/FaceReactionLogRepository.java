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

    // ── Bulk delete for account deletion ──────────────────────────────
    // Used by StudentServiceImpl.deleteAccount() to clear face_reaction_logs
    // rows before game_sessions is deleted, since this table holds a
    // game_session_id FK that would otherwise block deleting the parent
    // game_sessions row.
    //
    // IMPORTANT: return type must be void. Spring Data JPA only issues a
    // true single "DELETE FROM ... WHERE ..." bulk statement when the
    // derived delete method returns void. If it returns long/Long/List<T>,
    // it instead SELECTs every matching row and removes them one at a
    // time (N+1 deletes) so it can report an accurate count.
    @Modifying
    void deleteByUsername(String username);
}