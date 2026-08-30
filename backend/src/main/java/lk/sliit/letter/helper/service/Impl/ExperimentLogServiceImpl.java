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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.OptionalDouble;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExperimentLogServiceImpl
        implements ExperimentLogService {

    private final ExperimentLogEntryRepository repository;

    @Override
    @Transactional
    public ExperimentLogEntryResponse logEntry(
            ExperimentLogEntryRequest request
    ) {
        validateRequest(request);

        // Prevent the same locally backed-up attempt from being
        // inserted again after a batch sync.
        return repository
                .findByDeviceIdAndClientTimestampMs(
                        request.getDeviceId(),
                        request.getClientTimestampMs()
                )
                .map(this::toResponse)
                .orElseGet(() -> {
                    ExperimentLogEntry saved =
                            repository.save(
                                    toEntity(request)
                            );

                    return toResponse(saved);
                });
    }

    @Override
    @Transactional
    public int logBatch(
            List<ExperimentLogEntryRequest> requests
    ) {
        if (
                requests == null ||
                        requests.isEmpty()
        ) {
            return 0;
        }

        List<ExperimentLogEntry> entities =
                new ArrayList<>();

        // Also avoids duplicates inside the same batch.
        Set<String> seenInBatch =
                new HashSet<>();

        for (
                ExperimentLogEntryRequest request :
                requests
        ) {
            if (!isValidRequest(request)) {
                continue;
            }

            String localKey =
                    request.getDeviceId()
                            + ":"
                            + request
                            .getClientTimestampMs();

            if (!seenInBatch.add(localKey)) {
                continue;
            }

            boolean alreadyExists =
                    repository
                            .existsByDeviceIdAndClientTimestampMs(
                                    request.getDeviceId(),
                                    request
                                            .getClientTimestampMs()
                            );

            if (alreadyExists) {
                continue;
            }

            entities.add(
                    toEntity(request)
            );
        }

        if (entities.isEmpty()) {
            return 0;
        }

        repository.saveAll(entities);

        return entities.size();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExperimentLogEntryResponse> getAll() {
        return repository
                .findAllByOrderByReceivedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExperimentSummaryResponse getSummary() {
        List<ExperimentLogEntry> all =
                repository.findAll();

        List<ExperimentLogEntry> adaptive =
                all.stream()
                        .filter(
                                e ->
                                        "adaptive".equals(
                                                e.getMode()
                                        )
                        )
                        .collect(
                                Collectors.toList()
                        );

        List<ExperimentLogEntry> staticEntries =
                all.stream()
                        .filter(
                                e ->
                                        "static".equals(
                                                e.getMode()
                                        )
                        )
                        .collect(
                                Collectors.toList()
                        );

        Set<String> distinctDevices =
                all.stream()
                        .map(
                                ExperimentLogEntry::
                                        getDeviceId
                        )
                        .filter(
                                id -> id != null
                        )
                        .collect(
                                Collectors.toSet()
                        );

        return ExperimentSummaryResponse
                .builder()
                .totalEntries(all.size())
                .distinctDevices(
                        distinctDevices.size()
                )

                .adaptiveCount(
                        adaptive.size()
                )
                .adaptiveAvgScore(
                        avgInt(
                                adaptive,
                                ExperimentLogEntry::
                                        getScore
                        )
                )
                .adaptiveAvgDurationMs(
                        avgLong(
                                adaptive,
                                ExperimentLogEntry::
                                        getDurationMs
                        )
                )
                .adaptiveAvgWarnings(
                        avgInt(
                                adaptive,
                                ExperimentLogEntry::
                                        getWarningCount
                        )
                )

                .staticCount(
                        staticEntries.size()
                )
                .staticAvgScore(
                        avgInt(
                                staticEntries,
                                ExperimentLogEntry::
                                        getScore
                        )
                )
                .staticAvgDurationMs(
                        avgLong(
                                staticEntries,
                                ExperimentLogEntry::
                                        getDurationMs
                        )
                )
                .staticAvgWarnings(
                        avgInt(
                                staticEntries,
                                ExperimentLogEntry::
                                        getWarningCount
                        )
                )

                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public String buildCsv() {

        List<ExperimentLogEntry> all =
                repository
                        .findAllByOrderByReceivedAtDesc();

        StringBuilder sb =
                new StringBuilder();

        sb.append(
                "id,deviceId,studentId,"
        );

        sb.append(
                "clientTimestampMs,mode,letter,category,"
        );

        sb.append(
                "score,difficulty,baseDifficulty,supportLevel,"
        );

        sb.append(
                "recentAverageScore,recentAttemptCount,"
        );

        sb.append(
                "attemptType,completed,guideVisible,keypointsVisible,"
        );

        sb.append(
                "guideOpacityUsed,kpTouchMultiplierUsed,"
        );

        sb.append(
                "boundaryMultiplierUsed,warningCount,durationMs\n"
        );

        for (
                ExperimentLogEntry e :
                all
        ) {

            sb.append(
                    e.getId()
            ).append(',');

            sb.append(
                    csvField(
                            e.getDeviceId()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getStudentId()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getClientTimestampMs()
                    )
            ).append(',');

            sb.append(
                    csvField(
                            e.getMode()
                    )
            ).append(',');

            sb.append(
                    csvField(
                            e.getLetter()
                    )
            ).append(',');

            sb.append(
                    csvField(
                            e.getCategory()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getScore()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getDifficulty()
                    )
            ).append(',');

            sb.append(
                    csvField(
                            e.getBaseDifficulty()
                    )
            ).append(',');

            sb.append(
                    csvField(
                            e.getSupportLevel()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getRecentAverageScore()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getRecentAttemptCount()
                    )
            ).append(',');

            sb.append(
                    csvField(
                            e.getAttemptType()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getCompleted()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getGuideVisible()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getKeypointsVisible()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getGuideOpacityUsed()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getKpTouchMultiplierUsed()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getBoundaryMultiplierUsed()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getWarningCount()
                    )
            ).append(',');

            sb.append(
                    nullableValue(
                            e.getDurationMs()
                    )
            ).append('\n');
        }

        return sb.toString();
    }

    // ─────────────────────────
    // Mapping
    // ─────────────────────────

    private ExperimentLogEntry toEntity(
            ExperimentLogEntryRequest r
    ) {
        return ExperimentLogEntry
                .builder()

                .deviceId(
                        r.getDeviceId()
                )

                .studentId(
                        r.getStudentId()
                )

                .clientTimestampMs(
                        r.getClientTimestampMs()
                )

                .receivedAt(
                        LocalDateTime.now()
                )

                .mode(
                        r.getMode()
                )

                .letter(
                        r.getLetter()
                )

                .category(
                        r.getCategory()
                )

                .score(
                        r.getScore()
                )

                .difficulty(
                        r.getDifficulty()
                )

                .baseDifficulty(
                        r.getBaseDifficulty()
                )

                .supportLevel(
                        r.getSupportLevel()
                )

                .recentAverageScore(
                        r.getRecentAverageScore()
                )

                .recentAttemptCount(
                        r.getRecentAttemptCount()
                )

                .attemptType(
                        r.getAttemptType()
                )

                .completed(
                        r.getCompleted()
                )

                .guideVisible(
                        r.getGuideVisible()
                )

                .keypointsVisible(
                        r.getKeypointsVisible()
                )

                .guideOpacityUsed(
                        r.getGuideOpacityUsed()
                )

                .kpTouchMultiplierUsed(
                        r.getKpTouchMultiplierUsed()
                )

                .boundaryMultiplierUsed(
                        r.getBoundaryMultiplierUsed()
                )

                .warningCount(
                        r.getWarningCount()
                )

                .durationMs(
                        r.getDurationMs()
                )

                .build();
    }

    private ExperimentLogEntryResponse toResponse(
            ExperimentLogEntry e
    ) {
        return ExperimentLogEntryResponse
                .builder()

                .id(e.getId())

                .deviceId(
                        e.getDeviceId()
                )

                .studentId(
                        e.getStudentId()
                )

                .clientTimestampMs(
                        e.getClientTimestampMs()
                )

                .mode(
                        e.getMode()
                )

                .letter(
                        e.getLetter()
                )

                .category(
                        e.getCategory()
                )

                .score(
                        e.getScore()
                )

                .difficulty(
                        e.getDifficulty()
                )

                .baseDifficulty(
                        e.getBaseDifficulty()
                )

                .supportLevel(
                        e.getSupportLevel()
                )

                .recentAverageScore(
                        e.getRecentAverageScore()
                )

                .recentAttemptCount(
                        e.getRecentAttemptCount()
                )

                .attemptType(
                        e.getAttemptType()
                )

                .completed(
                        e.getCompleted()
                )

                .guideVisible(
                        e.getGuideVisible()
                )

                .keypointsVisible(
                        e.getKeypointsVisible()
                )

                .guideOpacityUsed(
                        e.getGuideOpacityUsed()
                )

                .kpTouchMultiplierUsed(
                        e.getKpTouchMultiplierUsed()
                )

                .boundaryMultiplierUsed(
                        e.getBoundaryMultiplierUsed()
                )

                .warningCount(
                        e.getWarningCount()
                )

                .durationMs(
                        e.getDurationMs()
                )

                .build();
    }

    // ─────────────────────────
    // Validation
    // ─────────────────────────

    private void validateRequest(
            ExperimentLogEntryRequest r
    ) {
        if (!isValidRequest(r)) {
            throw new IllegalArgumentException(
                    "Invalid tracing experiment log entry"
            );
        }
    }

    private boolean isValidRequest(
            ExperimentLogEntryRequest r
    ) {
        if (r == null) {
            return false;
        }

        if (
                r.getDeviceId() == null ||
                        r.getDeviceId().isBlank()
        ) {
            return false;
        }

        if (
                r.getClientTimestampMs() == null ||
                        r.getClientTimestampMs() <= 0
        ) {
            return false;
        }

        if (
                !"adaptive".equals(
                        r.getMode()
                ) &&
                        !"static".equals(
                                r.getMode()
                        )
        ) {
            return false;
        }

        if (
                r.getLetter() == null ||
                        r.getLetter().isBlank()
        ) {
            return false;
        }

        if (r.getScore() == null) {
            return false;
        }

        return
                r.getScore() >= 0 &&
                        r.getScore() <= 100;
    }

    // ─────────────────────────
    // Summary helpers
    // ─────────────────────────

    private Double avgInt(
            List<ExperimentLogEntry> list,
            java.util.function.ToIntFunction<
                    ExperimentLogEntry
                    > extractor
    ) {
        if (list.isEmpty()) {
            return null;
        }

        OptionalDouble avg =
                list.stream()
                        .mapToInt(extractor)
                        .average();

        return avg.isPresent()
                ? Math.round(
                avg.getAsDouble() * 10.0
        ) / 10.0
                : null;
    }

    private Double avgLong(
            List<ExperimentLogEntry> list,
            java.util.function.ToLongFunction<
                    ExperimentLogEntry
                    > extractor
    ) {
        if (list.isEmpty()) {
            return null;
        }

        OptionalDouble avg =
                list.stream()
                        .mapToLong(extractor)
                        .average();

        return avg.isPresent()
                ? Math.round(
                avg.getAsDouble() * 10.0
        ) / 10.0
                : null;
    }

    private String csvField(
            String value
    ) {
        if (value == null) {
            return "";
        }

        String escaped =
                value.replace(
                        "\"",
                        "\"\""
                );

        return "\"" +
                escaped +
                "\"";
    }

    private String nullableValue(
            Object value
    ) {
        return value == null
                ? ""
                : String.valueOf(value);
    }
}