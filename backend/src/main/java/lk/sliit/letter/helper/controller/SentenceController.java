package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.SentenceRequest;
import lk.sliit.letter.helper.controller.dto.response.SentenceResponse;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.Sentence;
import lk.sliit.letter.helper.service.SentenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sentences")  // Base path එකට move කළා - cleaner
public class SentenceController {

    @Autowired
    private SentenceService sentenceService;

    // CREATE
    @PostMapping
    public void create(@RequestBody SentenceRequest sentenceRequest) {
        sentenceService.create(sentenceRequest);
    }

    // READ ONE
    @GetMapping("/{id}")
    public SentenceResponse getById(@PathVariable Long id) throws NotFoundException {
        Sentence sentence = sentenceService.findById(id);

        SentenceResponse sentenceResponse = new SentenceResponse();
        sentenceResponse.setSentence(sentence.getSentence());

        return sentenceResponse;
    }

    // READ ALL - NEW
    @GetMapping
    public List<SentenceResponse> getAll() {
        return sentenceService.findAll()
                .stream()
                .map(sentence -> {
                    SentenceResponse response = new SentenceResponse();
                    response.setSentence(sentence.getSentence());
                    return response;
                })
                .collect(Collectors.toList());
    }

    // UPDATE - NEW
    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody SentenceRequest sentenceRequest) throws NotFoundException {
        sentenceService.update(id, sentenceRequest);
    }

    // DELETE - NEW
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) throws NotFoundException {
        sentenceService.delete(id);
    }
}