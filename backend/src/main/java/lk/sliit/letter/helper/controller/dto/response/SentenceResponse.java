package lk.sliit.letter.helper.controller.dto.response;

import lombok.Data;

@Data
public class SentenceResponse {
    private Long id;
    private String sentence;
    private boolean hasAudio;
}