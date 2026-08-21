package lk.sliit.letter.helper.controller.dto.response;

import lk.sliit.letter.helper.controller.dto.request.KeypointDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TracingLetterResponse {
    private Long id;
    private Long categoryId;
    private String letter;
    private String sound;
    private Integer strokes;
    private String difficulty;
    private String tip;
    private List<String> phases;
    private List<KeypointDto> keypoints;
    private Integer orderIndex;
}