package lk.sliit.letter.helper.controller.dto.request;
import lombok.Data;

@Data
public class SinhalaLetterRequest {
    private String letter;
    private String name;
    private String sound;
    private String categoryName;
    private String categoryColor;
    private Integer sortOrder;
}