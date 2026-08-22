package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.AdaptationEventRequest;
import lk.sliit.letter.helper.controller.dto.response.AdaptationAnalyticsResponse;
import lk.sliit.letter.helper.controller.dto.response.AdaptationEventResponse;

public interface AdaptationService {

    AdaptationEventResponse logEvent(AdaptationEventRequest request, String username);

    AdaptationAnalyticsResponse getAnalytics(String username, boolean global);
}