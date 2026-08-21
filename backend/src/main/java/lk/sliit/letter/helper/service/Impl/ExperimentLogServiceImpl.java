package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.ExperimentLogEntryRequest;
import lk.sliit.letter.helper.controller.dto.response.ExperimentLogEntryResponse;
import lk.sliit.letter.helper.controller.dto.response.ExperimentSummaryResponse;
import lk.sliit.letter.helper.model.ExperimentLogEntry;
import lk.sliit.letter.helper.repository.ExperimentLogEntryRepository;
import lk.sliit.letter.helper.service.ExperimentLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.OptionalDouble;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExperimentLogServiceImpl implements ExperimentLogService {

    private final ExperimentLogEntryRepository repository;

    @Override
    @Transactional
    public ExperimentLogEntryResponse logEntry(ExperimentLogEntryRequest request) {
        ExperimentLogEntry saved = repository.save(toEntity(request));
        return toResponse(saved);
    }

    @Override
    @Transactional
    public int logBatch(List<ExperimentLogEntryRequest> requests) {
        if (requests == null || requests.isEmpty()) return 0;
        List<ExperimentLogEntry> entities = requests.stream().map(this::toEntity).collect(Collectors.toList());
        repository.saveAll(entities);
        return entities.size();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExperimentLogEntryResponse> getAll() {
        return repository.findAllByOrderByReceivedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExperimentSummaryResponse getSummary() {
        List<ExperimentLogEntry> all = repository.findAll();

        List<ExperimentLogEntry> adaptive = all.stream().filter(e -> "adaptive".equals(e.getMode())).collect(Collectors.toList());
        List<ExperimentLogEntry> staticEntries = all.stream().filter(e -> "static".equals(e.getMode())).collect(Collectors.toList());

        Set<String> distinctDevices = all.stream().map(ExperimentLogEntry::getDeviceId).collect(Collectors.toSet());

        return ExperimentSummaryResponse.builder()
                .totalEntries(all.size())
                .distinctDevices(distinctDevices.size())
                .adaptiveCount(adaptive.size())
                .adaptiveAvgScore(avgInt(adaptive, ExperimentLogEntry::getScore))
                .adaptiveAvgDurationMs(avgLong(adaptive, ExperimentLogEntry::getDurationMs))
                .adaptiveAvgWarnings(avgInt(adaptive, ExperimentLogEntry::getWarningCount))
                .staticCount(staticEntries.size())
                .staticAvgScore(avgInt(staticEntries, ExperimentLogEntry::getScore))
                .staticAvgDurationMs(avgLong(staticEntries, ExperimentLogEntry::getDurationMs))
                .staticAvgWarnings(avgInt(staticEntries, ExperimentLogEntry::getWarningCount))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public String buildCsv() {
        List<ExperimentLogEntry> all = repository.findAllByOrderByReceivedAtDesc();
        StringBuilder sb = new StringBuilder();
        sb.append("id,deviceId,studentId,clientTimestampMs,mode,letter,category,score,difficulty,")
                .append("guideOpacityUsed,kpTouchMultiplierUsed,boundaryMultiplierUsed,warningCount,durationMs\n");
        for (ExperimentLogEntry e : all) {
            sb.append(e.getId()).append(',')
                    .append(csvField(e.getDeviceId())).append(',')
                    .append(e.getStudentId() == null ? "" : e.getStudentId()).append(',')
                    .append(e.getClientTimestampMs()).append(',')
                    .append(csvField(e.getMode())).append(',')
                    .append(csvField(e.getLetter())).append(',')
                    .append(csvField(e.getCategory())).append(',')
                    .append(e.getScore()).append(',')
                    .append(e.getDifficulty() == null ? "" : e.getDifficulty()).append(',')
                    .append(e.getGuideOpacityUsed()).append(',')
                    .append(e.getKpTouchMultiplierUsed()).append(',')
                    .append(e.getBoundaryMultiplierUsed()).append(',')
                    .append(e.getWarningCount()).append(',')
                    .append(e.getDurationMs()).append('\n');
        }
        return sb.toString();
    }

    // ───────────────────────── helpers ─────────────────────────

    private ExperimentLogEntry toEntity(ExperimentLogEntryRequest r) {
        return ExperimentLogEntry.builder()
                .deviceId(r.getDeviceId())
                .studentId(r.getStudentId())
                .clientTimestampMs(r.getClientTimestampMs())
                .receivedAt(LocalDateTime.now())
                .mode(r.getMode())
                .letter(r.getLetter())
                .category(r.getCategory())
                .score(r.getScore())
                .difficulty(r.getDifficulty())
                .guideOpacityUsed(r.getGuideOpacityUsed())
                .kpTouchMultiplierUsed(r.getKpTouchMultiplierUsed())
                .boundaryMultiplierUsed(r.getBoundaryMultiplierUsed())
                .warningCount(r.getWarningCount())
                .durationMs(r.getDurationMs())
                .build();
    }

    private ExperimentLogEntryResponse toResponse(ExperimentLogEntry e) {
        return ExperimentLogEntryResponse.builder()
                .id(e.getId())
                .deviceId(e.getDeviceId())
                .studentId(e.getStudentId())
                .clientTimestampMs(e.getClientTimestampMs())
                .mode(e.getMode())
                .letter(e.getLetter())
                .category(e.getCategory())
                .score(e.getScore())
                .difficulty(e.getDifficulty())
                .guideOpacityUsed(e.getGuideOpacityUsed())
                .kpTouchMultiplierUsed(e.getKpTouchMultiplierUsed())
                .boundaryMultiplierUsed(e.getBoundaryMultiplierUsed())
                .warningCount(e.getWarningCount())
                .durationMs(e.getDurationMs())
                .build();
    }

    private Double avgInt(List<ExperimentLogEntry> list, java.util.function.ToIntFunction<ExperimentLogEntry> extractor) {
        if (list.isEmpty()) return null;
        OptionalDouble avg = list.stream().mapToInt(extractor).average();
        return avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : null;
    }

    private Double avgLong(List<ExperimentLogEntry> list, java.util.function.ToLongFunction<ExperimentLogEntry> extractor) {
        if (list.isEmpty()) return null;
        OptionalDouble avg = list.stream().mapToLong(extractor).average();
        return avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : null;
    }

    private String csvField(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}