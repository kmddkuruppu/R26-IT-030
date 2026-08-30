-- ============================================================
-- Letter Tracing Adaptive-vs-Static Research Migration
-- ============================================================

ALTER TABLE experiment_log_entries
    ADD COLUMN base_difficulty VARCHAR(20) NULL AFTER difficulty,
    ADD COLUMN support_level VARCHAR(20) NULL AFTER base_difficulty,
    ADD COLUMN recent_average_score DOUBLE NULL AFTER support_level,
    ADD COLUMN recent_attempt_count INT NULL AFTER recent_average_score,
    ADD COLUMN attempt_type VARCHAR(30) NULL AFTER recent_attempt_count,
    ADD COLUMN completed BOOLEAN NULL AFTER attempt_type,
    ADD COLUMN guide_visible BOOLEAN NULL AFTER completed,
    ADD COLUMN keypoints_visible BOOLEAN NULL AFTER guide_visible;


-- Remove duplicate rows that may already exist because an attempt
-- could previously be auto-sent and later batch-synced again.
DELETE duplicate_row
FROM experiment_log_entries duplicate_row
JOIN experiment_log_entries keep_row
  ON duplicate_row.device_id = keep_row.device_id
 AND duplicate_row.client_timestamp_ms = keep_row.client_timestamp_ms
 AND duplicate_row.id > keep_row.id;


-- Prevent future duplicate research attempts.
ALTER TABLE experiment_log_entries
    ADD CONSTRAINT uk_experiment_device_timestamp
        UNIQUE (device_id, client_timestamp_ms);