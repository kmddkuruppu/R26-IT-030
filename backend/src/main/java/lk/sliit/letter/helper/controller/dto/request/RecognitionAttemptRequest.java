package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class RecognitionAttemptRequest {

    // From apiService.js → saveRecognitionAttempt()
    private String sessionId;
    private String selectedLetter;      // nullable
    private String recognizedLetter;
    private Integer confidence;
    private String inputType;           // "draw" | "upload"
}