package lk.sliit.letter.helper.controller.dto.request;
import lombok.Data;
import java.util.List;

@Data
public class SinhalaWordRequest {
    private String word;
    //    private String meaning;
    private List<String> syllables;
    private String imageUrl;
}