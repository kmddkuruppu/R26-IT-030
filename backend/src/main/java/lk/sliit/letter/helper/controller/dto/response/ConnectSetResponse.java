package lk.sliit.letter.helper.controller.dto.response;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ConnectSetResponse {
    private Long id;
    private String title;
//    private String hint;
    private Integer sortOrder;
    private List<ConnectPairResponse> pairs;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ConnectPairResponse {
        private Long id;
        private String leftText;
        private String rightText;
        private String leftMeaning;
        private String rightMeaning;
        private Integer sortOrder;
    }
}