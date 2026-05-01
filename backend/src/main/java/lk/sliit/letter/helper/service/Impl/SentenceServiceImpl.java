package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.SentenceRequest;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.Sentence;
import lk.sliit.letter.helper.repository.SentenceRepository;
import lk.sliit.letter.helper.service.SentenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SentenceServiceImpl implements SentenceService {
    @Autowired
    private SentenceRepository sentenceRepository;

    @Override
    public void create(SentenceRequest sentenceRequest) {
        Sentence sentence = new Sentence();

        sentence.setSentence(sentenceRequest.getSentence());

        sentenceRepository.save(sentence);
    }

    @Override
    public Sentence findById(Long id) {
        return sentenceRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Sentence not found" + id)
        );
    }
}
