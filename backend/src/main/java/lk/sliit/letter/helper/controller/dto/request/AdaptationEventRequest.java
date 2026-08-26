package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class AdaptationEventRequest {

    private String gameId;
    private Long gameSessionId;        // nullable
    private String triggerState;       // frustrated | confused | bored
    private String actionTaken;        // ENCOURAGEMENT | HINT | SIMPLIFY | SUGGEST_SWITCH | SPEED_UP
    private Integer engagementScoreAtTrigger;
    private String dominantEmotionAtTrigger;
}