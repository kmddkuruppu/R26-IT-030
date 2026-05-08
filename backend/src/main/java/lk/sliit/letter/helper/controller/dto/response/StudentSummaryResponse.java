package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSummaryResponse {
    private Long studentId;
    private Integer totalScore;
    private Integer totalStars;
    private Boolean masterAchievement;
    private List<GameProgressResponse> sessions;
}