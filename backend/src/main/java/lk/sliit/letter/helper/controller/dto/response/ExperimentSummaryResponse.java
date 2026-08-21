package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Server-wide (all devices/students) Adaptive-vs-Static comparison —
 * the actual research payoff of collecting this data centrally instead
 * of per-device in localStorage.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperimentSummaryResponse {
    private long totalEntries;
    private long distinctDevices;

    private long adaptiveCount;
    private Double adaptiveAvgScore;      // null if adaptiveCount == 0
    private Double adaptiveAvgDurationMs;
    private Double adaptiveAvgWarnings;

    private long staticCount;
    private Double staticAvgScore;        // null if staticCount == 0
    private Double staticAvgDurationMs;
    private Double staticAvgWarnings;
}