package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.AchievementCheckRequest;
import lk.sliit.letter.helper.controller.dto.request.FaceReactionRequest;
import lk.sliit.letter.helper.controller.dto.request.GameSessionRequest;
import lk.sliit.letter.helper.controller.dto.response.*;

import java.util.List;

public interface GamifiedLearningService {

    GameSessionResponse saveGameSession(GameSessionRequest request, String username);

    FaceReactionResponse saveFaceReaction(FaceReactionRequest request, String username);

    AchievementResponse checkAndEarnAchievements(AchievementCheckRequest request, String username);

    PlayerStatsResponse getPlayerStats(String username);

    List<FaceReactionResponse> getRecentReactions(String username);

    GameProgressResponse getGameProgress(String username);
}