package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}