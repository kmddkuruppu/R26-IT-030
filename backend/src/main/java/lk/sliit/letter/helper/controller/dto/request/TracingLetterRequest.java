package lk.sliit.letter.helper.controller.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TracingLetterRequest {
    private Long categoryId;
    private String letter;
    private String sound;
    private Integer strokes;
    private String difficulty;      // "Easy" | "Medium" | "Hard"
    private String tip;
    private List<String> phases;
    private List<KeypointDto> keypoints;
    private Integer orderIndex;
}