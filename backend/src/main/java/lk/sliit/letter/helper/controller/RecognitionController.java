package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.RecognitionAttemptRequest;
import lk.sliit.letter.helper.controller.dto.request.RecognitionFeedbackRequest;
import lk.sliit.letter.helper.controller.dto.response.LetterPracticeResponse;
import lk.sliit.letter.helper.controller.dto.response.RecognitionAttemptResponse;
import lk.sliit.letter.helper.controller.dto.response.RecognitionStatsResponse;
import lk.sliit.letter.helper.service.ModelPredictionService;
import lk.sliit.letter.helper.service.RecognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import lk.sliit.letter.helper.service.SentencePredictionService;

import java.util.List;

@RestController
@RequestMapping("/api/recognition")
@RequiredArgsConstructor
public class RecognitionController {

    private final RecognitionService recognitionService;
    private final ModelPredictionService modelPredictionService;
    private final SentencePredictionService sentencePredictionService;

    // Called after mockRecognize() resolves in handleRecognize()
    // POST /api/recognition/attempt
    @PostMapping("/attempt")
    public ResponseEntity<RecognitionAttemptResponse> saveAttempt(
            @RequestBody RecognitionAttemptRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(recognitionService.saveAttempt(request));
    }

    // Called after yes/no button click in handleFeedback()
    // POST /api/recognition/feedback
    @PostMapping("/feedback")
    public ResponseEntity<RecognitionStatsResponse> saveFeedback(
            @RequestBody RecognitionFeedbackRequest request) {
        return ResponseEntity.ok(recognitionService.saveFeedback(request));
    }

    // Called on component mount to restore stats state
    // GET /api/recognition/stats/{sessionId}
    @GetMapping("/stats/{sessionId}")
    public ResponseEntity<RecognitionStatsResponse> getStats(
            @PathVariable String sessionId) {
        return ResponseEntity.ok(recognitionService.getStats(sessionId));
    }

    // GET /api/recognition/history/{sessionId}
    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<RecognitionAttemptResponse>> getHistory(
            @PathVariable String sessionId) {
        return ResponseEntity.ok(recognitionService.getHistory(sessionId));
    }

    // GET /api/recognition/letters/{sessionId}
    @GetMapping("/letters/{sessionId}")
    public ResponseEntity<List<LetterPracticeResponse>> getLetterPractice(
            @PathVariable String sessionId) {
        return ResponseEntity.ok(
                recognitionService.getLetterPracticeHistory(sessionId));
    }

    // POST /api/recognition/predict
    @PostMapping("/predict")
    public ResponseEntity<ModelPredictionService.PredictionResult> predict(
            @RequestParam("image") MultipartFile image) throws Exception {

        return ResponseEntity.ok(
                modelPredictionService.predictImage(image)
        );
    }
	// POST /api/recognition/sentence/predict
	@PostMapping("/sentence/predict")
	public ResponseEntity<SentencePredictionService.PredictionResult> predictSentence(
        	@RequestParam("image") MultipartFile image) throws Exception {

    	return ResponseEntity.ok(
            	sentencePredictionService.predictImage(image)
    	);
    }
}