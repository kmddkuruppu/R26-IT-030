package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.GameProgressRequest;
import lk.sliit.letter.helper.controller.dto.response.GameProgressResponse;
import lk.sliit.letter.helper.controller.dto.response.StudentSummaryResponse;
import lk.sliit.letter.helper.service.GameProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/game-progress")
@RequiredArgsConstructor
public class GameProgressController {

    private final GameProgressService gameProgressService;

    @PostMapping
    public ResponseEntity<GameProgressResponse> saveProgress(
            @RequestBody GameProgressRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(gameProgressService.saveProgress(request));
    }

    @GetMapping("/summary/{studentId}")
    public ResponseEntity<StudentSummaryResponse> getStudentSummary(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(gameProgressService.getStudentSummary(studentId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GameProgressResponse>> getSessionsByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(gameProgressService.getSessionsByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/game/{gameId}")
    public ResponseEntity<List<GameProgressResponse>> getSessionsByStudentAndGame(
            @PathVariable Long studentId,
            @PathVariable String gameId) {
        return ResponseEntity.ok(
                gameProgressService.getSessionsByStudentAndGame(studentId, gameId)
        );
    }
}