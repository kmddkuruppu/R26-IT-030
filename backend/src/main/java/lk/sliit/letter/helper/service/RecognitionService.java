package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.RecognitionAttemptRequest;
import lk.sliit.letter.helper.controller.dto.request.RecognitionFeedbackRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterPracticeResponse;
import lk.sliit.letter.helper.controller.dto.response.RecognitionAttemptResponse;
import lk.sliit.letter.helper.controller.dto.response.RecognitionStatsResponse;

import java.util.List;

public interface RecognitionService {

    // POST /api/recognition/attempt
    // Called after mockRecognize() in handleRecognize()
    RecognitionAttemptResponse saveAttempt(RecognitionAttemptRequest request);

    // POST /api/recognition/feedback
    // Called after handleFeedback() — yes/no button click
    RecognitionStatsResponse saveFeedback(RecognitionFeedbackRequest request);

    // GET /api/recognition/stats/{sessionId}
    // Called on component mount to restore stats state
    RecognitionStatsResponse getStats(String sessionId);

    // GET /api/recognition/history/{sessionId}
    // Full attempt history
    List<RecognitionAttemptResponse> getHistory(String sessionId);

    // GET /api/recognition/letters/{sessionId}
    // Per-letter practice breakdown
    List<LetterPracticeResponse> getLetterPracticeHistory(String sessionId);
}