-- ════════════════════════════════════════════════════════════════════
-- New engagement-tracking table.
-- If spring.jpa.hibernate.ddl-auto=update (or create) in your
-- application.properties, Hibernate will create this table automatically
-- from FaceReactionLog.java the first time the app starts — you do NOT
-- need to run this manually in that case. Keep this file for reference /
-- for your Docker MySQL init scripts / documentation.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS face_reaction_logs (
                                                  id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                  username           VARCHAR(150) NOT NULL,   -- matches Authentication.getName(), "guest" for unauthenticated play
    game_session_id    BIGINT NULL,
    game_id            VARCHAR(50) NOT NULL,
    captured_at        DATETIME NOT NULL,
    dominant_emotion   VARCHAR(30) NOT NULL,
    engagement_score   INT NOT NULL,
    confidence         DOUBLE NULL,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_frl_username (username),
    INDEX idx_frl_game_session_id (game_session_id),
    INDEX idx_frl_captured_at (captured_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── OPTIONAL: remove your old single-snapshot face reaction table ─────
-- Only run this once you've confirmed the new system works end-to-end
-- and you don't need the old data. Replace the table name below with
-- whatever your existing @Table(name = "...") annotation on the OLD
-- FaceReaction entity says.
--
-- DROP TABLE IF EXISTS face_reactions;