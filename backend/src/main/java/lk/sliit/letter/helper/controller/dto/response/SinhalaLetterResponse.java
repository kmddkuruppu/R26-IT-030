package lk.sliit.letter.helper.controller.dto.response;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SinhalaLetterResponse {
    private Long id;
    private String letter;
    private String name;
    private String sound;
    private String categoryName;
    private String categoryColor;
    private Integer sortOrder;
}