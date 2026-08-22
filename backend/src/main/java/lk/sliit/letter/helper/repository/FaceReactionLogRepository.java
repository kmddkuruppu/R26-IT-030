package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.FaceReactionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FaceReactionLogRepository extends JpaRepository<FaceReactionLog, Long> {

    List<FaceReactionLog> findByGameSessionIdOrderByCapturedAtAsc(Long gameSessionId);

    List<FaceReactionLog> findByUsernameOrderByCapturedAtDesc(String username);

    List<FaceReactionLog> findByUsernameAndGameIdOrderByCapturedAtDesc(String username, String gameId);

    List<FaceReactionLog> findByUsernameOrderByCapturedAtAsc(String username);
}