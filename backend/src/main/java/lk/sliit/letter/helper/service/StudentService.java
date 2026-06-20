package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.LoginRequest;
import lk.sliit.letter.helper.controller.dto.request.RegisterRequest;
import lk.sliit.letter.helper.controller.dto.request.UpdateProfileRequest;
import lk.sliit.letter.helper.controller.dto.response.AuthResponse;
import lk.sliit.letter.helper.controller.dto.response.StudentProfileResponse;

public interface StudentService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    StudentProfileResponse updateProfile(String username, UpdateProfileRequest request);
    void deleteAccount(String username);
}