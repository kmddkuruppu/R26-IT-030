package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.ExperimentLogEntryRequest;
import lk.sliit.letter.helper.controller.dto.response.ExperimentLogEntryResponse;
import lk.sliit.letter.helper.controller.dto.response.ExperimentSummaryResponse;

import java.util.List;

public interface ExperimentLogService {
    ExperimentLogEntryResponse logEntry(ExperimentLogEntryRequest request);
    int logBatch(List<ExperimentLogEntryRequest> requests);
    List<ExperimentLogEntryResponse> getAll();
    ExperimentSummaryResponse getSummary();
    String buildCsv(); // whole log as CSV text, for the export endpoint
}