package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Research-facing analytics: how often each intervention fires, and —
 * more importantly — whether it actually helped. `effectivenessByAction`
 * compares each student's average engagement score in the 5s-40s window
 * AFTER an intervention against the engagement score AT the moment of
 * the trigger. A positive value means engagement recovered after the
 * intervention; near-zero/negative means that action type isn't working.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdaptationAnalyticsResponse {

    private long totalEvents;
    private Map<String, Long> breakdownByTriggerState;
    private Map<String, Long> breakdownByAction;
    private Map<String, Double> effectivenessByAction; // avg post-intervention engagement delta
    private double averageEngagementDeltaOverall;
    private List<AdaptationEventResponse> recentEvents;
}