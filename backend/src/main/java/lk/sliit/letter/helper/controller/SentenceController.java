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
    @GetMapping("/{id}")
    public SentenceResponse getById(@PathVariable Long id) throws NotFoundException {
        Sentence sentence = sentenceService.findById(id);
        return toResponse(sentence);
    }

    // ─── READ ALL ─────────────────────────────────────────────────────────────
    @GetMapping
    public List<SentenceResponse> getAll() {
        return sentenceService.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody SentenceRequest sentenceRequest) throws NotFoundException {
        sentenceService.update(id, sentenceRequest);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) throws NotFoundException {
        sentenceService.delete(id);
    }

    // ─── UPLOAD AUDIO (M4A) ───────────────────────────────────────────────────
    // POST /sentences/{id}/audio   (multipart/form-data, field name = "file")
    @PostMapping("/{id}/audio")
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
    // GET /sentences/{id}/audio
    @GetMapping("/{id}/audio")
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
        response.setId(sentence.getId());           // frontend ට id ඕනේ audio call ට
        response.setSentence(sentence.getSentence());
        response.setHasAudio(sentence.getAudioData() != null);  // audio තියෙනවද කියලා flag
        return response;
    }
}