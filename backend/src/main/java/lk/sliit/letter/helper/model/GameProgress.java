package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "game_id", nullable = false)
    private String gameId;

    @Column(name = "game_name", nullable = false)
    private String gameName;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer stars;

    @Column(nullable = false)
    private Integer percentage;

    @Column(name = "played_at", nullable = false)
    private LocalDateTime playedAt;
}