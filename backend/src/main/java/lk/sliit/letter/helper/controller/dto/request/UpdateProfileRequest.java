package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private Integer age;
    private Integer grade;
    private String school;
}