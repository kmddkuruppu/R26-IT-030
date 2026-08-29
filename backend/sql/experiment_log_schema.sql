CREATE TABLE IF NOT EXISTS experiment_log_entries (

                                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,

                                                      device_id VARCHAR(100) NOT NULL,

    student_id BIGINT NULL,

    client_timestamp_ms BIGINT NOT NULL,

    received_at DATETIME(6) NOT NULL,

    mode VARCHAR(20) NOT NULL,

    letter VARCHAR(10) NOT NULL,

    category VARCHAR(100) NOT NULL,

    score INT NOT NULL,

    difficulty DOUBLE NULL,

    base_difficulty VARCHAR(20) NULL,

    support_level VARCHAR(20) NULL,

    recent_average_score DOUBLE NULL,

    recent_attempt_count INT NULL,

    attempt_type VARCHAR(30) NULL,

    completed BOOLEAN NULL,

    guide_visible BOOLEAN NULL,

    keypoints_visible BOOLEAN NULL,

    guide_opacity_used DOUBLE NOT NULL,

    kp_touch_multiplier_used DOUBLE NOT NULL,

    boundary_multiplier_used DOUBLE NOT NULL,

    warning_count INT NOT NULL,

    duration_ms BIGINT NOT NULL,

    INDEX idx_experiment_log_device (device_id),

    INDEX idx_experiment_log_mode (mode),

    UNIQUE KEY uk_experiment_device_timestamp (
                                                  device_id,
                                                  client_timestamp_ms
                                              )

    ) ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4;