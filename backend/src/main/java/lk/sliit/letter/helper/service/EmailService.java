package lk.sliit.letter.helper.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
}