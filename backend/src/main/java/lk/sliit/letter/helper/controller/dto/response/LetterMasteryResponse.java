package lk.sliit.letter.helper.controller.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LetterMasteryResponse {

    private Long id;
    private Long studentId;
    private String letter;
    private String sound;
    private String category;
    private String difficulty;
    private Integer bestScore;
    private Integer attemptCount;
    private Boolean mastered;
    private LocalDateTime firstMasteredAt;
    private LocalDateTime lastAttemptedAt;
}