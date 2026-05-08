package lk.sliit.letter.helper.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseCharsetConfig {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixCharset() {
        jdbcTemplate.execute(
                "ALTER DATABASE letter_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        );
        jdbcTemplate.execute(
                "ALTER TABLE sentences CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        );
    }
}