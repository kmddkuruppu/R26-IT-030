package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.LetterHuntAttemptRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterHuntAttemptResponse;

import java.util.List;
import lk.sliit.letter.helper.controller.dto.request.LetterHuntPracticeRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterHuntPracticeResponse;

public interface LetterHuntAdaptiveService {
    LetterHuntPracticeResponse savePracticeSession(String username, LetterHuntPracticeRequest request);
    List<LetterHuntPracticeResponse> getPracticeHistory(String username);


    List<LetterHuntAttemptResponse> saveAttempts(
            String username,
            List<LetterHuntAttemptRequest> attempts
    );

    List<LetterHuntAttemptResponse> getAttemptHistory(
            String username
    );
}
