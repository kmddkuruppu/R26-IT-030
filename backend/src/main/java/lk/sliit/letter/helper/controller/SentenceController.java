package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.SentenceRequest;
import lk.sliit.letter.helper.controller.dto.response.SentenceResponse;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.Sentence;
import lk.sliit.letter.helper.service.SentenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sentences")
public class SentenceController {

    @Autowired
    private SentenceService sentenceService;

    // ─── CREATE ───────────────────────────────────────────────────────────────
    @PostMapping
    public void create(@RequestBody SentenceRequest sentenceRequest) {
        sentenceService.create(sentenceRequest);
    }

    // ─── READ ONE ─────────────────────────────────────────────────────────────
    @GetMapping("/{id:\\d+}")
    public SentenceResponse getById(@PathVariable Long id) throws NotFoundException {
        Sentence sentence = sentenceService.findById(id);
        return toResponse(sentence);
    }

    // ─── READ ALL (admin listing - original order maintained) ────────────────
    @GetMapping
    public List<SentenceResponse> getAll() {
        return sentenceService.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── READ ALL SHUFFLED (student practice mode) ────────────────────────────
    // GET /sentences/practice
    @GetMapping("/practice")
    public List<SentenceResponse> getAllShuffled() {
        return sentenceService.findAllShuffled()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    @PutMapping("/{id:\\d+}")
    public void update(@PathVariable Long id, @RequestBody SentenceRequest sentenceRequest) throws NotFoundException {
        sentenceService.update(id, sentenceRequest);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────
    @DeleteMapping("/{id:\\d+}")
    public void delete(@PathVariable Long id) throws NotFoundException {
        sentenceService.delete(id);
    }

    // ─── UPLOAD AUDIO (M4A) ───────────────────────────────────────────────────
    @PostMapping("/{id:\\d+}/audio")
    public ResponseEntity<Void> uploadAudio(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        String contentType = file.getContentType() != null
                ? file.getContentType()
                : "audio/x-m4a";

        sentenceService.saveAudio(id, file.getBytes(), contentType);
        return ResponseEntity.ok().build();
    }

    // ─── STREAM AUDIO ────────────────────────────────────────────────────────
    @GetMapping("/{id:\\d+}/audio")
    public ResponseEntity<byte[]> getAudio(@PathVariable Long id) {
        Sentence sentence = sentenceService.findById(id);

        if (sentence.getAudioData() == null) {
            return ResponseEntity.notFound().build();
        }

        String contentType = sentence.getAudioContentType() != null
                ? sentence.getAudioContentType()
                : "audio/x-m4a";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(sentence.getAudioData());
    }

    // ─── HELPER ───────────────────────────────────────────────────────────────
    private SentenceResponse toResponse(Sentence sentence) {
        SentenceResponse response = new SentenceResponse();
        response.setId(sentence.getId());
        response.setSentence(sentence.getSentence());
        response.setHasAudio(sentence.getAudioData() != null);
        return response;
    }
}