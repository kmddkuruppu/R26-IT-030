package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class RecognitionFeedbackRequest {

    // From apiService.js → saveRecognitionFeedback()
    private String sessionId;
    private Long recognitionId;
    private Boolean correct;
}