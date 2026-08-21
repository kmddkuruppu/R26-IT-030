package lk.sliit.letter.helper.controller.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TracingCategoryRequest {
    private String code;      // "vowels", "ka", ...
    private String name;      // Sinhala name
    private String nameEn;    // English name
    private Integer orderIndex;
}