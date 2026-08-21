-- Tables backing the Letter Tracing feature (replaces the old hard-coded
-- LETTER_CATEGORIES / KEYPOINTS_SRC data in LetterTracing.js).
-- Adjust engine/charset lines if they don't match the rest of your schema.

CREATE TABLE IF NOT EXISTS tracing_categories (
                                                  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                  code        VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    name_en     VARCHAR(100) NOT NULL,
    order_index INT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tracing_letters (
                                               id             BIGINT AUTO_INCREMENT PRIMARY KEY,
                                               category_id    BIGINT NOT NULL,
                                               letter         VARCHAR(10)  NOT NULL,
    sound          VARCHAR(20)  NOT NULL,
    strokes        INT          NOT NULL,
    difficulty     VARCHAR(20)  NOT NULL,
    tip            VARCHAR(255) NOT NULL,
    phases_json    TEXT         NOT NULL,
    keypoints_json TEXT         NOT NULL,
    order_index    INT,
    CONSTRAINT fk_tracing_letters_category
    FOREIGN KEY (category_id) REFERENCES tracing_categories(id)
    ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;