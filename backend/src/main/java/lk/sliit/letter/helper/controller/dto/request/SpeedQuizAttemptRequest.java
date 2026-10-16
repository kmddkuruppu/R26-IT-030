package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class SpeedQuizAttemptRequest {

    private String targetLetter;

    private String selectedLetter;
}