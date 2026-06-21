package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String username;
    private Integer age;
    private Integer grade;
    private String school;
    private String password;
    private String email;
}