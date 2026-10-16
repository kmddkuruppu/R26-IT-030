package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class LetterHuntAttemptRequest {

    private String targetLetter;

    private String selectedLetter;
}