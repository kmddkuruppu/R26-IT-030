package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * One logged tracing attempt from the Adaptive-vs-Static research feature
 * in LetterTracing.js. Deliberately flat (no JSON columns) — every field
 * maps 1:1 to a primitive, so this needs no Jackson at all, on either the
 * read or write side.
 *
 * deviceId groups attempts by browser/device for multi-device data
 * collection (generated client-side and cached in localStorage — see
 * getOrCreateDeviceId() in the frontend). studentId is optional: fill it
 * in if/when this page is behind login and you want to tie attempts to a
 * specific Student.
 */
@Entity
@Table(name = "experiment_log_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperimentLogEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, length = 100)
    private String deviceId;

    @Column(name = "student_id")
    private Long studentId; // nullable — set only if the student is authenticated

    // epoch millis from the browser's Date.now() when the attempt was logged;
    // kept as a plain number (not a Date/Instant type) so there's zero risk
    // of date-serialization surprises on either side
    @Column(name = "client_timestamp_ms", nullable = false)
    private Long clientTimestampMs;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt; // set server-side on insert, DB-only (never serialized back to JSON)

    @Column(nullable = false, length = 20)
    private String mode; // "adaptive" | "static"

    @Column(nullable = false, length = 10)
    private String letter;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private Integer score;

    @Column
    private Double difficulty; // nullable — 0..1, null on a letter's very first-ever attempt

    @Column(name = "guide_opacity_used", nullable = false)
    private Double guideOpacityUsed;

    @Column(name = "kp_touch_multiplier_used", nullable = false)
    private Double kpTouchMultiplierUsed;

    @Column(name = "boundary_multiplier_used", nullable = false)
    private Double boundaryMultiplierUsed;

    @Column(name = "warning_count", nullable = false)
    private Integer warningCount;

    @Column(name = "duration_ms", nullable = false)
    private Long durationMs;
}