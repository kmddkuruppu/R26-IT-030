package lk.sliit.letter.helper.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudentProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private Integer age;
    private Integer grade;
    private String school;
}