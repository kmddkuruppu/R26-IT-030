package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.GameProgressRequest;
import lk.sliit.letter.helper.controller.dto.response.GameProgressResponse;
import lk.sliit.letter.helper.controller.dto.response.StudentSummaryResponse;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.GameProgress;
import lk.sliit.letter.helper.repository.GameProgressRepository;
import lk.sliit.letter.helper.service.GameProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameProgressServiceImpl implements GameProgressService {

    private final GameProgressRepository gameProgressRepository;

    private static final Map<String, String> GAME_NAMES = Map.of(
            "memory-match",   "Memory Match",
            "speed-quiz",     "Speed Quiz",
            "letter-hunt",    "Letter Hunt",
            "letter-puzzle",  "Letter Puzzle",
            "word-builder",   "Word Builder",
            "missing-letter", "Missing Letter",
            "line-connect",   "Line Connect"
    );

    @Override
    public GameProgressResponse saveProgress(GameProgressRequest request) {

        String gameName = GAME_NAMES.get(request.getGameId());
        if (gameName == null) {
            throw new IllegalArgumentException(
                    "Invalid gameId: " + request.getGameId() +
                            ". Valid values: " + GAME_NAMES.keySet()
            );
        }

        int maxScore   = request.getMaxScore() > 0 ? request.getMaxScore() : 1;
        int percentage = Math.round((request.getScore() * 100.0f) / maxScore);
        percentage     = Math.min(100, Math.max(0, percentage));

        int stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : 1;

        GameProgress progress = GameProgress.builder()
                .studentId(request.getStudentId())
                .gameId(request.getGameId())
                .gameName(gameName)
                .score(request.getScore())
                .stars(stars)
                .percentage(percentage)
                .playedAt(LocalDateTime.now())
                .build();

        return toResponse(gameProgressRepository.save(progress));
    }

    @Override
    public StudentSummaryResponse getStudentSummary(Long studentId) {

        List<GameProgress> sessions = gameProgressRepository.findByStudentId(studentId);

        if (sessions.isEmpty()) {
            throw new NotFoundException(
                    "No game sessions found for student id: " + studentId
            );
        }

        Integer totalScore = gameProgressRepository.getTotalScoreByStudentId(studentId);
        Integer totalStars = gameProgressRepository.getTotalStarsByStudentId(studentId);
        boolean masterAchievement = totalScore >= 500;

        return StudentSummaryResponse.builder()
                .studentId(studentId)
                .totalScore(totalScore)
                .totalStars(totalStars)
                .masterAchievement(masterAchievement)
                .sessions(sessions.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public List<GameProgressResponse> getSessionsByStudent(Long studentId) {
        return gameProgressRepository.findByStudentId(studentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GameProgressResponse> getSessionsByStudentAndGame(
            Long studentId, String gameId) {
        return gameProgressRepository.findByStudentIdAndGameId(studentId, gameId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private GameProgressResponse toResponse(GameProgress gp) {
        return GameProgressResponse.builder()
                .id(gp.getId())
                .studentId(gp.getStudentId())
                .gameId(gp.getGameId())
                .gameName(gp.getGameName())
                .score(gp.getScore())
                .stars(gp.getStars())
                .percentage(gp.getPercentage())
                .playedAt(gp.getPlayedAt())
                .build();
    }
}