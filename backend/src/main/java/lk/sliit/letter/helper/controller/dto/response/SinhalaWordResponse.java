package lk.sliit.letter.helper.controller.dto.response;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SinhalaWordResponse {
    private Long id;
    private String word;
    //    private String meaning;
    private List<String> syllables;
    private String imageUrl;
}