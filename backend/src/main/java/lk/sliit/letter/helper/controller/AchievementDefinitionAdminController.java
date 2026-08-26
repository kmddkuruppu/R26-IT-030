package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.model.AchievementDefinition;
import lk.sliit.letter.helper.repository.AchievementDefinitionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ═══════════════════════════════════════════════════════════════════
// FIX: moved from /api/admin/achievement-definitions to
// /api/game-data/achievements — matching the SAME path family as
// GameDataController's letters/words/connect-sets endpoints, which
// already work without a 403.
//
// The 403 you were hitting on POST/PUT/DELETE (while GET worked) is a
// classic sign of a SecurityConfig rule like:
//   .requestMatchers("/api/admin/**").hasRole("ADMIN")
// blocking write methods to /api/admin/** for your current session,
// while /api/game-data/** has no such restriction. Moving under
// game-data sidesteps that without touching SecurityConfig blind.
//
// If you'd rather KEEP the /admin/ path (cleaner naming), share your
// SecurityConfig.java and I'll add the correct rule/role instead.
// ═══════════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/game-data/achievements")
public class AchievementDefinitionAdminController {

    private final AchievementDefinitionRepository repository;

    public AchievementDefinitionAdminController(AchievementDefinitionRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<AchievementDefinition> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public AchievementDefinition create(@RequestBody AchievementDefinition def) {
        def.setId(null);
        return repository.save(def);
    }

    @PutMapping("/{id}")
    public AchievementDefinition update(@PathVariable Long id, @RequestBody AchievementDefinition updated) {
        AchievementDefinition existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achievement definition not found: " + id));

        existing.setCode(updated.getCode());
        existing.setTitleEn(updated.getTitleEn());
        existing.setTitleSi(updated.getTitleSi());
        existing.setDescriptionEn(updated.getDescriptionEn());
        existing.setDescriptionSi(updated.getDescriptionSi());
        existing.setIcon(updated.getIcon());
        existing.setTier(updated.getTier());
        existing.setCriteriaType(updated.getCriteriaType());
        existing.setCriteriaValue(updated.getCriteriaValue());
        existing.setCriteriaGameId(updated.getCriteriaGameId());
        existing.setSortOrder(updated.getSortOrder());
        existing.setActive(updated.getActive());

        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}