package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.ExperimentLogBatchRequest;
import lk.sliit.letter.helper.controller.dto.request.ExperimentLogEntryRequest;
import lk.sliit.letter.helper.controller.dto.response.ExperimentLogEntryResponse;
import lk.sliit.letter.helper.controller.dto.response.ExperimentSummaryResponse;
import lk.sliit.letter.helper.service.ExperimentLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Backs the "Research data" panel in LetterTracing.js — collects Adaptive
 * vs Static A/B attempt data from every device/browser centrally, instead
 * of each device only having its own localStorage copy.
 *
 * NOTE ON SECURITY: /entries (GET), /summary and /export are read
 * endpoints intended for researchers/admins — if this project has auth set
 * up, guard them the same way other admin-only endpoints are guarded.
 * POST /log and /log/batch are meant to be called from the student-facing
 * LetterTracing.js page itself, so they should stay open to any logged-in
 * (or anonymous, if the page doesn't require login) user.
 */
@RestController
@RequestMapping("/api/experiment-log")
@RequiredArgsConstructor
public class ExperimentLogController {

    private final ExperimentLogService experimentLogService;

    // called once per attempt by LetterTracing.js (handleCheck / handleAutoComplete)
    @PostMapping("/log")
    public ResponseEntity<ExperimentLogEntryResponse> logEntry(@RequestBody ExperimentLogEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(experimentLogService.logEntry(request));
    }

    // called by the "Sync to server" button — uploads a device's whole local log at once
    @PostMapping("/log/batch")
    public ResponseEntity<Map<String, Integer>> logBatch(@RequestBody ExperimentLogBatchRequest request) {
        int saved = experimentLogService.logBatch(request.getEntries());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("saved", saved));
    }

    // raw list — mainly useful for debugging / small-scale inspection
    @GetMapping("/entries")
    public ResponseEntity<List<ExperimentLogEntryResponse>> getAll() {
        return ResponseEntity.ok(experimentLogService.getAll());
    }

    // Adaptive vs Static comparison across ALL devices — the actual research payoff
    @GetMapping("/summary")
    public ResponseEntity<ExperimentSummaryResponse> getSummary() {
        return ResponseEntity.ok(experimentLogService.getSummary());
    }

    // full CSV download of every collected attempt, from every device
    @GetMapping("/export")
    public ResponseEntity<String> exportCsv() {
        String csv = experimentLogService.buildCsv();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "experiment-log-export.csv");
        return ResponseEntity.ok().headers(headers).body(csv);
    }
}