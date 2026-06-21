package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Letter Helper - Password Reset OTP");
        message.setText("Your OTP code is: " + otpCode + "\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.");
        mailSender.send(message);
    }
}