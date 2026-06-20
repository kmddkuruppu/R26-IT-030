package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.UpdateProfileRequest;
import lk.sliit.letter.helper.controller.dto.response.StudentProfileResponse;
import lk.sliit.letter.helper.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PutMapping("/profile")
    public ResponseEntity<StudentProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        String username = authentication.getName(); // set by JwtAuthFilter
        StudentProfileResponse response = studentService.updateProfile(username, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteAccount(Authentication authentication) {
        studentService.deleteAccount(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}