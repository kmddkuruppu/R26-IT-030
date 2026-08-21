package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.*;
import lk.sliit.letter.helper.controller.dto.response.*;
import lk.sliit.letter.helper.service.GameDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/game-data")
@RequiredArgsConstructor
public class GameDataController {

    private final GameDataService gameDataService;

    // ── Letters ──────────────────────────────────────────────────
    @GetMapping("/letters")
    public ResponseEntity<List<SinhalaLetterResponse>> getLetters() {
        return ResponseEntity.ok(gameDataService.getAllLetters());
    }

    @PostMapping("/letters")
    public ResponseEntity<SinhalaLetterResponse> createLetter(
            @RequestBody SinhalaLetterRequest request) {
        return ResponseEntity.ok(gameDataService.createLetter(request));
    }

    @PutMapping("/letters/{id}")
    public ResponseEntity<SinhalaLetterResponse> updateLetter(
            @PathVariable Long id, @RequestBody SinhalaLetterRequest request) {
        return ResponseEntity.ok(gameDataService.updateLetter(id, request));
    }

    @DeleteMapping("/letters/{id}")
    public ResponseEntity<Void> deleteLetter(@PathVariable Long id) {
        gameDataService.deleteLetter(id);
        return ResponseEntity.noContent().build();
    }

    // ── Words ────────────────────────────────────────────────────
    @GetMapping("/words")
    public ResponseEntity<List<SinhalaWordResponse>> getWords() {
        return ResponseEntity.ok(gameDataService.getAllWords());
    }

    @PostMapping("/words")
    public ResponseEntity<SinhalaWordResponse> createWord(
            @RequestBody SinhalaWordRequest request) {
        return ResponseEntity.ok(gameDataService.createWord(request));
    }

    @PutMapping("/words/{id}")
    public ResponseEntity<SinhalaWordResponse> updateWord(
            @PathVariable Long id, @RequestBody SinhalaWordRequest request) {
        return ResponseEntity.ok(gameDataService.updateWord(id, request));
    }

    @DeleteMapping("/words/{id}")
    public ResponseEntity<Void> deleteWord(@PathVariable Long id) {
        gameDataService.deleteWord(id);
        return ResponseEntity.noContent().build();
    }

    // ── Connect Sets ─────────────────────────────────────────────
    @GetMapping("/connect-sets")
    public ResponseEntity<List<ConnectSetResponse>> getConnectSets() {
        return ResponseEntity.ok(gameDataService.getAllConnectSets());
    }

    @PostMapping("/connect-sets")
    public ResponseEntity<ConnectSetResponse> createConnectSet(
            @RequestBody ConnectSetRequest request) {
        return ResponseEntity.ok(gameDataService.createConnectSet(request));
    }

    @PutMapping("/connect-sets/{id}")
    public ResponseEntity<ConnectSetResponse> updateConnectSet(
            @PathVariable Long id, @RequestBody ConnectSetRequest request) {
        return ResponseEntity.ok(gameDataService.updateConnectSet(id, request));
    }

    @DeleteMapping("/connect-sets/{id}")
    public ResponseEntity<Void> deleteConnectSet(@PathVariable Long id) {
        gameDataService.deleteConnectSet(id);
        return ResponseEntity.noContent().build();
    }
}