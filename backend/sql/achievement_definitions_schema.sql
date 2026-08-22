-- ═══════════════════════════════════════════════════════════════════
-- achievement_definitions — NEW table, run once on your Docker MySQL (port 3307)
-- Does NOT touch player_achievements or game_sessions — purely additive.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS achievement_definitions (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    code              VARCHAR(50)  NOT NULL UNIQUE,
    title_en          VARCHAR(100) NOT NULL,
    title_si          VARCHAR(100) NOT NULL,
    description_en    VARCHAR(255),
    description_si    VARCHAR(255),
    icon              VARCHAR(16)  DEFAULT '🏆',
    tier              ENUM('BRONZE','SILVER','GOLD') DEFAULT 'BRONZE',
    criteria_type     ENUM(
                          'TOTAL_SCORE','GAME_MASTERY','GAMES_EXPLORED',
                          'ALL_GAMES_MASTERED','STREAK_DAYS','PERFECT_SESSION',
                          'LOW_MOVES','POSITIVE_MOOD'
                      ) NOT NULL,
    criteria_value    INT NOT NULL DEFAULT 0,
    criteria_game_id  VARCHAR(32) NULL,
    sort_order        INT DEFAULT 0,
    active            BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Seed: recreates your 4 existing hardcoded achievements as data rows
--    (SAME codes: 'master','speed_demon','puzzle_master','word_wizard' —
--    so students who already earned these keep them, nothing breaks),
--    PLUS finishes 'perfect_memory' (title/desc already existed in your
--    Java code but had no working check — now it does), PLUS new ones.
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO achievement_definitions
(code, title_en, title_si, description_en, description_si, icon, tier, criteria_type, criteria_value, criteria_game_id, sort_order) VALUES

('master', 'Master Learner', 'ප්‍රධාන ඉගෙන්නා',
 'Earned 500+ total points', 'මුළු ලකුණු 500ක් හෝ වැඩි ප්‍රමාණයක් ලබා ගත්තා',
 '🌟', 'SILVER', 'TOTAL_SCORE', 500, NULL, 1),

('speed_demon', 'Speed Demon', 'වේග රාක්ෂයා',
 'Scored 100+ in Speed Quiz', 'වේග ප්‍රශ්නාවලියේ ලකුණු 100+ ලබා ගත්තා',
 '⚡', 'BRONZE', 'GAME_MASTERY', 3, 'speed-quiz', 2),

('puzzle_master', 'Puzzle Master', 'ප්‍රහේලිකා ප්‍රවීණයා',
 'High score in Letter Puzzle', 'අකුරු ප්‍රහේලිකාවේ ඉහළ ලකුණු',
 '🧩', 'BRONZE', 'GAME_MASTERY', 3, 'letter-puzzle', 3),

('word_wizard', 'Word Wizard', 'වචන මායාකරුවා',
 'Mastered Word Builder', 'වචන ගොඩනැගිල්ල ප්‍රගුණ කළා',
 '📝', 'BRONZE', 'GAME_MASTERY', 3, 'word-builder', 4),

('perfect_memory', 'Perfect Memory', 'පරිපූර්ණ මතකය',
 'Completed Memory Match in 6 moves or fewer', 'මතක ගැලපීම ගමන් 6කින් හෝ අඩුවෙන් සම්පූර්ණ කළා',
 '🧠', 'GOLD', 'LOW_MOVES', 6, 'memory-match', 5),

('explorer_4', 'Explorer', 'ගවේෂකයා',
 'Tried 4 different games', 'විවිධ ක්‍රීඩා 4ක් උත්සාහ කළා',
 '🧭', 'BRONZE', 'GAMES_EXPLORED', 4, NULL, 6),

('explorer_all', 'Completionist', 'සම්පූර්ණකරු',
 'Tried every game at least once', 'සියලුම ක්‍රීඩා අවම වශයෙන් එක් වරක් උත්සාහ කළා',
 '🗺️', 'SILVER', 'GAMES_EXPLORED', 8, NULL, 7),

('perfectionist', 'Perfectionist', 'පරිපූර්ණවාදියා',
 'Got 3 stars in every game', 'සෑම ක්‍රීඩාවකම තරු 3ක් ලබා ගත්තා',
 '💎', 'GOLD', 'ALL_GAMES_MASTERED', 8, NULL, 8),

('streak_3', 'Consistent', 'නිරන්තර',
 'Played 3 days in a row', 'දින 3ක් අඛණ්ඩව ක්‍රීඩා කළා',
 '🔥', 'BRONZE', 'STREAK_DAYS', 3, NULL, 9),

('streak_7', 'Dedicated', 'කැපවූ',
 'Played 7 days in a row', 'දින 7ක් අඛණ්ඩව ක්‍රීඩා කළා',
 '🔥', 'GOLD', 'STREAK_DAYS', 7, NULL, 10),

('flawless', 'Flawless', 'දෝෂයෙන් තොර',
 'Scored 100% in a single game', 'එක් ක්‍රීඩාවක ලකුණු 100%ක් ලබා ගත්තා',
 '✨', 'SILVER', 'PERFECT_SESSION', 100, NULL, 11),

('happy_learner', 'Happy Learner', 'සතුටින් ඉගෙන ගන්නා',
 'Showed 10 happy reactions while playing', 'ක්‍රීඩා කරන අතරතුර සතුටු ප්‍රතික්‍රියා 10ක් පෙන්නුවා',
 '😄', 'BRONZE', 'POSITIVE_MOOD', 10, NULL, 12)

ON DUPLICATE KEY UPDATE code = code;
