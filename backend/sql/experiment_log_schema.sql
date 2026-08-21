-- Backs the Adaptive-vs-Static A/B research feature in LetterTracing.js.
-- Flat/plain columns only — no JSON columns, so no serialization library
-- dependency either way.

CREATE TABLE IF NOT EXISTS experiment_log_entries (
                                                      id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                      device_id                   VARCHAR(100) NOT NULL,
    student_id                  BIGINT NULL,
    client_timestamp_ms         BIGINT NOT NULL,
    received_at                 DATETIME(6) NOT NULL,
    mode                        VARCHAR(20)  NOT NULL,
    letter                      VARCHAR(10)  NOT NULL,
    category                    VARCHAR(100) NOT NULL,
    score                       INT NOT NULL,
    difficulty                  DOUBLE NULL,
    guide_opacity_used          DOUBLE NOT NULL,
    kp_touch_multiplier_used    DOUBLE NOT NULL,
    boundary_multiplier_used    DOUBLE NOT NULL,
    warning_count               INT NOT NULL,
    duration_ms                 BIGINT NOT NULL,
    INDEX idx_experiment_log_device (device_id),
    INDEX idx_experiment_log_mode (mode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;