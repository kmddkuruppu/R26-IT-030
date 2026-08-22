package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class FaceReactionBatchRequest {

    private String gameId;
    private Long gameSessionId; // nullable
    private List<FaceReactionDataPointRequest> dataPoints;
}