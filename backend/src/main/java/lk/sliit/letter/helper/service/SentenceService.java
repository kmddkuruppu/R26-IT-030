package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.SentenceRequest;
import lk.sliit.letter.helper.model.Sentence;

public interface SentenceService {
    public void create (SentenceRequest sentenceRequest);

    public Sentence findById(Long id);
}
