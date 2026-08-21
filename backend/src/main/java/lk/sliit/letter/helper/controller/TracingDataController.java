package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.TracingCategoryRequest;
import lk.sliit.letter.helper.controller.dto.request.TracingLetterRequest;
import lk.sliit.letter.helper.controller.dto.response.TracingCategoryResponse;
import lk.sliit.letter.helper.controller.dto.response.TracingFullDataResponse;
import lk.sliit.letter.helper.controller.dto.response.TracingLetterResponse;
import lk.sliit.letter.helper.service.TracingDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * NOTE ON SECURITY: /categories and /letters write endpoints (POST/PUT/DELETE)
 * are meant to be called only from AddTracingData.js (admin). If your project
 * has Spring Security / JWT set up (see ProtectedRoute.js on the frontend),
 * wire the same guard here — e.g. @PreAuthorize("hasRole('ADMIN')") on each
 * write method, or a SecurityFilterChain rule for "/api/tracing-data/**".
 * GET /full is intentionally left open since LetterTracing.js (students)
 * needs it too.
 */
@RestController
@RequestMapping("/api/tracing-data")
@RequiredArgsConstructor
public class TracingDataController {

    private final TracingDataService tracingDataService;

    // used by LetterTracing.js
    @GetMapping("/full")
    public ResponseEntity<List<TracingFullDataResponse>> getFullTracingData() {
        return ResponseEntity.ok(tracingDataService.getFullTracingData());
    }

    // ── categories ──

    @GetMapping("/categories")
    public ResponseEntity<List<TracingCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(tracingDataService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<TracingCategoryResponse> createCategory(@RequestBody TracingCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tracingDataService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<TracingCategoryResponse> updateCategory(@PathVariable Long id,
                                                                  @RequestBody TracingCategoryRequest request) {
        return ResponseEntity.ok(tracingDataService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        tracingDataService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ── letters ──

    @GetMapping("/letters")
    public ResponseEntity<List<TracingLetterResponse>> getAllLetters() {
        return ResponseEntity.ok(tracingDataService.getAllLetters());
    }

    @GetMapping("/letters/{id}")
    public ResponseEntity<TracingLetterResponse> getLetterById(@PathVariable Long id) {
        return ResponseEntity.ok(tracingDataService.getLetterById(id));
    }

    @PostMapping("/letters")
    public ResponseEntity<TracingLetterResponse> createLetter(@RequestBody TracingLetterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tracingDataService.createLetter(request));
    }

    @PutMapping("/letters/{id}")
    public ResponseEntity<TracingLetterResponse> updateLetter(@PathVariable Long id,
                                                              @RequestBody TracingLetterRequest request) {
        return ResponseEntity.ok(tracingDataService.updateLetter(id, request));
    }

    @DeleteMapping("/letters/{id}")
    public ResponseEntity<Void> deleteLetter(@PathVariable Long id) {
        tracingDataService.deleteLetter(id);
        return ResponseEntity.noContent().build();
    }
}