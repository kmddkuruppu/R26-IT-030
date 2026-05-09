package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.SentenceRequest;
import lk.sliit.letter.helper.model.Sentence;

import java.util.List;

public interface SentenceService {
    void create(SentenceRequest sentenceRequest);
    Sentence findById(Long id);
    List<Sentence> findAll();                                    // NEW
    void update(Long id, SentenceRequest sentenceRequest);       // NEW
    void delete(Long id);                                        // NEW
}