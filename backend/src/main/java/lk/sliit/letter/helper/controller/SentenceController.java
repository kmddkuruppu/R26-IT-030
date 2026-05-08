package lk.sliit.letter.helper.controller;

import lk.sliit.letter.helper.controller.dto.request.SentenceRequest;
import lk.sliit.letter.helper.controller.dto.response.SentenceResponse;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.Sentence;
import lk.sliit.letter.helper.service.SentenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class SentenceController {
    @Autowired
    private SentenceService sentenceService;

    @PostMapping(value = "/sentences")
    public void create (@RequestBody SentenceRequest sentenceRequest) {
        sentenceService.create(sentenceRequest);
    }

    @GetMapping(value = "/sentences/{id}")
    public SentenceResponse getById(@PathVariable Long id) throws NotFoundException {
        Sentence sentence = sentenceService.findById(id);

        SentenceResponse sentenceResponse = new SentenceResponse();

        sentenceResponse.setSentence(sentence.getSentence());

        return sentenceResponse;
    }
}
