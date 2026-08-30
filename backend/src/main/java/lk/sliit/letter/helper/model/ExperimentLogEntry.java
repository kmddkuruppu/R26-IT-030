package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "experiment_log_entries",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_experiment_device_timestamp",
                        columnNames = {
                                "device_id",
                                "client_timestamp_ms"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperimentLogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "device_id",
            nullable = false,
            length = 100
    )
    private String deviceId;

    @Column(name = "student_id")
    private Long studentId;

    @Column(
            name = "client_timestamp_ms",
            nullable = false
    )
    private Long clientTimestampMs;

    @Column(
            name = "received_at",
            nullable = false
    )
    private LocalDateTime receivedAt;

    @Column(
            nullable = false,
            length = 20
    )
    private String mode;

    @Column(
            nullable = false,
            length = 10
    )
    private String letter;

    @Column(
            nullable = false,
            length = 100
    )
    private String category;

    @Column(nullable = false)
    private Integer score;

    // Existing numeric adaptive value.
    @Column
    private Double difficulty;

    // Admin-defined initial difficulty.
    @Column(
            name = "base_difficulty",
            length = 20
    )
    private String baseDifficulty;

    // LOW | MEDIUM | HIGH
    @Column(
            name = "support_level",
            length = 20
    )
    private String supportLevel;

    @Column(name = "recent_average_score")
    private Double recentAverageScore;

    @Column(name = "recent_attempt_count")
    private Integer recentAttemptCount;

    @Column(
            name = "attempt_type",
            length = 30
    )
    private String attemptType;

    @Column(name = "completed")
    private Boolean completed;

    @Column(name = "guide_visible")
    private Boolean guideVisible;

    @Column(name = "keypoints_visible")
    private Boolean keypointsVisible;

    @Column(
            name = "guide_opacity_used",
            nullable = false
    )
    private Double guideOpacityUsed;

    @Column(
            name = "kp_touch_multiplier_used",
            nullable = false
    )
    private Double kpTouchMultiplierUsed;

    @Column(
            name = "boundary_multiplier_used",
            nullable = false
    )
    private Double boundaryMultiplierUsed;

    @Column(
            name = "warning_count",
            nullable = false
    )
    private Integer warningCount;

    @Column(
            name = "duration_ms",
            nullable = false
    )
    private Long durationMs;
}