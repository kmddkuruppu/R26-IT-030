package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.AchievementCheckRequest;
import lk.sliit.letter.helper.controller.dto.request.FaceReactionRequest;
import lk.sliit.letter.helper.controller.dto.request.GameSessionRequest;
import lk.sliit.letter.helper.controller.dto.response.AchievementResponse;
import lk.sliit.letter.helper.controller.dto.response.FaceReactionResponse;
import lk.sliit.letter.helper.controller.dto.response.GameSessionResponse;
import lk.sliit.letter.helper.controller.dto.response.PlayerStatsResponse;

import java.util.List;

public interface GamifiedLearningService {

    GameSessionResponse saveGameSession(GameSessionRequest request, String username);

    FaceReactionResponse saveFaceReaction(FaceReactionRequest request, String username);

    AchievementResponse checkAndEarnAchievements(AchievementCheckRequest request, String username);

    PlayerStatsResponse getPlayerStats(String username);

    List<FaceReactionResponse> getRecentReactions(String username);
}