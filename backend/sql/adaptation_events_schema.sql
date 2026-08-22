CREATE TABLE IF NOT EXISTS adaptation_events (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 username VARCHAR(150) NOT NULL,
    game_session_id BIGINT NULL,
    game_id VARCHAR(50) NOT NULL,
    trigger_state VARCHAR(30) NOT NULL,      -- frustrated | confused | bored
    action_taken VARCHAR(30) NOT NULL,       -- ENCOURAGEMENT | HINT | SIMPLIFY | SUGGEST_SWITCH | SPEED_UP
    engagement_score_at_trigger INT NOT NULL,
    dominant_emotion_at_trigger VARCHAR(30),
    created_at DATETIME NOT NULL,
    INDEX idx_adaptation_username (username),
    INDEX idx_adaptation_game_id (game_id),
    INDEX idx_adaptation_created_at (created_at)
    );