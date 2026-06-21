package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.config.JwtUtil;
import lk.sliit.letter.helper.controller.dto.request.*;
import lk.sliit.letter.helper.controller.dto.response.AuthResponse;
import lk.sliit.letter.helper.controller.dto.response.StudentProfileResponse;
import lk.sliit.letter.helper.exception.InvalidCredentialsException;
import lk.sliit.letter.helper.exception.OtpException;
import lk.sliit.letter.helper.exception.UsernameAlreadyExistsException;
import lk.sliit.letter.helper.model.PasswordResetOtp;
import lk.sliit.letter.helper.model.Student;
import lk.sliit.letter.helper.repository.PasswordResetOtpRepository;
import lk.sliit.letter.helper.repository.StudentRepository;
import lk.sliit.letter.helper.service.EmailService;
import lk.sliit.letter.helper.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final PasswordResetOtpRepository otpRepository;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (studentRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("Username already taken: " + request.getUsername());
        }

        Student student = new Student();
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setUsername(request.getUsername());
        student.setAge(request.getAge());
        student.setGrade(request.getGrade());
        student.setSchool(request.getSchool());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));

        Student saved = studentRepository.save(student);
        String token = jwtUtil.generateToken(saved.getUsername());

        return new AuthResponse(
                token, saved.getId(), saved.getFirstName(), saved.getLastName(),
                saved.getUsername(), saved.getAge(), saved.getGrade(), saved.getSchool()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Student student = studentRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(student.getUsername());

        return new AuthResponse(
                token, student.getId(), student.getFirstName(), student.getLastName(),
                student.getUsername(), student.getAge(), student.getGrade(), student.getSchool()
        );
    }

    @Override
    public StudentProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Student not found"));

        if (request.getFirstName() != null) student.setFirstName(request.getFirstName());
        if (request.getLastName() != null)  student.setLastName(request.getLastName());
        if (request.getAge() != null)       student.setAge(request.getAge());
        if (request.getGrade() != null)     student.setGrade(request.getGrade());
        if (request.getSchool() != null)    student.setSchool(request.getSchool());

        Student saved = studentRepository.save(student);

        return new StudentProfileResponse(
                saved.getId(), saved.getFirstName(), saved.getLastName(),
                saved.getUsername(), saved.getAge(), saved.getGrade(), saved.getSchool()
        );
    }

    @Override
    public void deleteAccount(String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Student not found"));
        studentRepository.delete(student);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("No account found with this email"));

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        PasswordResetOtp resetOtp = new PasswordResetOtp();
        resetOtp.setEmail(student.getEmail());
        resetOtp.setOtpCode(otp);
        resetOtp.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(10));
        resetOtp.setUsed(false);
        otpRepository.save(resetOtp);

        emailService.sendOtpEmail(student.getEmail(), otp);
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request) {
        PasswordResetOtp resetOtp = otpRepository.findTopByEmailAndUsedFalseOrderByIdDesc(request.getEmail())
                .orElseThrow(() -> new OtpException("No OTP request found. Please request a new one."));

        if (resetOtp.isUsed()) {
            throw new OtpException("This OTP has already been used.");
        }
        if (resetOtp.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new OtpException("OTP has expired. Please request a new one.");
        }
        if (!resetOtp.getOtpCode().equals(request.getOtpCode())) {
            throw new OtpException("Invalid OTP code.");
        }
        // Valid — caller proceeds to resetPassword next.
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetOtp resetOtp = otpRepository.findTopByEmailAndUsedFalseOrderByIdDesc(request.getEmail())
                .orElseThrow(() -> new OtpException("No OTP request found. Please request a new one."));

        if (resetOtp.isUsed()) {
            throw new OtpException("This OTP has already been used.");
        }
        if (resetOtp.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new OtpException("OTP has expired. Please request a new one.");
        }
        if (!resetOtp.getOtpCode().equals(request.getOtpCode())) {
            throw new OtpException("Invalid OTP code.");
        }

        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Student not found"));

        student.setPassword(passwordEncoder.encode(request.getNewPassword()));
        studentRepository.save(student);

        resetOtp.setUsed(true);
        otpRepository.save(resetOtp);
    }
}