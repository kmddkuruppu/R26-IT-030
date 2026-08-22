package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.FaceReactionBatchRequest;
import lk.sliit.letter.helper.controller.dto.response.FaceReactionLogResponse;
import lk.sliit.letter.helper.controller.dto.response.SessionEngagementSummaryResponse;

import java.util.List;

public interface FaceReactionService {

    List<FaceReactionLogResponse> saveBatch(FaceReactionBatchRequest request, String username);

    SessionEngagementSummaryResponse getSessionSummary(Long gameSessionId);

    List<FaceReactionLogResponse> getRecentEngagement(String username, int limit);
}