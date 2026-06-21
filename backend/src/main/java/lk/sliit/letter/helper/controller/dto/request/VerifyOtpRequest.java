package lk.sliit.letter.helper.controller.dto.request;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String otpCode;
}