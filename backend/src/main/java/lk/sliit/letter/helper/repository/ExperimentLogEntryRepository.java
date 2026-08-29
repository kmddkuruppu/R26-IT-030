package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.ExperimentLogEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExperimentLogEntryRepository
        extends JpaRepository<ExperimentLogEntry, Long> {

    List<ExperimentLogEntry>
    findAllByOrderByReceivedAtDesc();

    List<ExperimentLogEntry>
    findByMode(String mode);

    boolean existsByDeviceIdAndClientTimestampMs(
            String deviceId,
            Long clientTimestampMs
    );

    Optional<ExperimentLogEntry>
    findByDeviceIdAndClientTimestampMs(
            String deviceId,
            Long clientTimestampMs
    );
}