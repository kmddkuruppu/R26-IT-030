package lk.sliit.letter.helper.controller.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * Used by the "Sync to server" button — uploads a whole device's locally
 * stored experiment log in one call (e.g. catching up entries collected
 * before the backend existed, or after being offline).
 */
@Getter
@Setter
public class ExperimentLogBatchRequest {
    private List<ExperimentLogEntryRequest> entries;
}