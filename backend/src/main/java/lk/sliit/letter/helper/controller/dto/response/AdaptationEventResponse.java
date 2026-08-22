package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdaptationEventResponse {

    private Long id;
    private String gameId;
    private String triggerState;
    private String actionTaken;
    private Integer engagementScoreAtTrigger;
    private String dominantEmotionAtTrigger;
    private LocalDateTime createdAt;
}