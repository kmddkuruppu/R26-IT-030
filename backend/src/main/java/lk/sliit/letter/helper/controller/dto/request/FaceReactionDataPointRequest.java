package lk.sliit.letter.helper.controller.dto.request;
// NOTE: matches your existing package layout, e.g. FaceReactionRequest.java

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FaceReactionDataPointRequest {

    private LocalDateTime capturedAt;
    private Integer engagementScore;
    private String dominantEmotion;
    private Double confidence;
}