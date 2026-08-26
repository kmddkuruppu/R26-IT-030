package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.AchievementDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AchievementDefinitionRepository extends JpaRepository<AchievementDefinition, Long> {
    List<AchievementDefinition> findByActiveTrueOrderBySortOrderAsc();
    Optional<AchievementDefinition> findByCode(String code);
}
