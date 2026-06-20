package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.LoginRequest;
import lk.sliit.letter.helper.controller.dto.request.RegisterRequest;
import lk.sliit.letter.helper.controller.dto.response.AuthResponse;
import lk.sliit.letter.helper.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final StudentService studentService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = studentService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = studentService.login(request);
        return ResponseEntity.ok(response);
    }
}