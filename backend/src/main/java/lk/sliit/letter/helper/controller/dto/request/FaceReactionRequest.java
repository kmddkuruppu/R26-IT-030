package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class FaceReactionRequest {
    // Matches frontend EXPRESSION_MAP + onReaction payload
    private String gameId;
    private String rawExpression;  // "happy", "neutral", etc.
    private String emoji;
    private String labelEn;
    private String labelSi;
    private String labelTa;
    private Double confidence;
}