package lk.sliit.letter.helper.controller.dto.request;
import lombok.Data;
import java.util.List;

@Data
public class ConnectSetRequest {
    private String title;
//    private String hint;
    private Integer sortOrder;
    private List<ConnectPairItem> pairs;

    @Data
    public static class ConnectPairItem {
        private String leftText;
        private String rightText;
        private String leftMeaning;
        private String rightMeaning;
        private Integer sortOrder;
    }
}