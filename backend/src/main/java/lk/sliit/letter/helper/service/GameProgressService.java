package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.GameProgressRequest;
import lk.sliit.letter.helper.controller.dto.response.GameProgressResponse;
import lk.sliit.letter.helper.controller.dto.response.StudentSummaryResponse;

import java.util.List;

public interface GameProgressService {
    GameProgressResponse saveProgress(GameProgressRequest request);
    StudentSummaryResponse getStudentSummary(Long studentId);
    List<GameProgressResponse> getSessionsByStudent(Long studentId);
    List<GameProgressResponse> getSessionsByStudentAndGame(Long studentId, String gameId);
}