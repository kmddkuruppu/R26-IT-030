package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.GameProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameProgressRepository extends JpaRepository<GameProgress, Long> {

    List<GameProgress> findByStudentId(Long studentId);

    List<GameProgress> findByStudentIdAndGameId(Long studentId, String gameId);

    @Query("SELECT COALESCE(SUM(g.score), 0) FROM GameProgress g WHERE g.studentId = :studentId")
    Integer getTotalScoreByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COALESCE(SUM(g.stars), 0) FROM GameProgress g WHERE g.studentId = :studentId")
    Integer getTotalStarsByStudentId(@Param("studentId") Long studentId);
}