package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.SpeedQuizAttemptRequest;
import lk.sliit.letter.helper.controller.dto.response.SpeedQuizAttemptResponse;

import java.util.List;
import lk.sliit.letter.helper.controller.dto.request.SpeedQuizPracticeRequest;
import lk.sliit.letter.helper.controller.dto.response.SpeedQuizPracticeResponse;

public interface SpeedQuizAdaptiveService {
    SpeedQuizPracticeResponse savePracticeSession(String username, SpeedQuizPracticeRequest request);
    List<SpeedQuizPracticeResponse> getPracticeHistory(String username);


    List<SpeedQuizAttemptResponse> saveAttempts(
            String username,
            List<SpeedQuizAttemptRequest> attempts
    );

    List<SpeedQuizAttemptResponse> getAttemptHistory(
            String username
    );
}
