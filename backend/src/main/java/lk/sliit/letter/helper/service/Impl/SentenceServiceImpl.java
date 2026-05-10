package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.SentenceRequest;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.Sentence;
import lk.sliit.letter.helper.repository.SentenceRepository;
import lk.sliit.letter.helper.service.SentenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
                () -> new NotFoundException("Sentence not found: " + id)
        );
    }

    @Override
    public List<Sentence> findAll() {
        return sentenceRepository.findAll();
    }

    @Override
    public void update(Long id, SentenceRequest sentenceRequest) {
        Sentence sentence = sentenceRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Sentence not found: " + id)
        );
        sentence.setSentence(sentenceRequest.getSentence());
        sentenceRepository.save(sentence);
    }

    @Override
    public void delete(Long id) {
        Sentence sentence = sentenceRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Sentence not found: " + id)
        );
        sentenceRepository.delete(sentence);
    }

    @Override
    public void saveAudio(Long id, byte[] audioData, String contentType) {
        Sentence sentence = sentenceRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Sentence not found: " + id)
        );
        sentence.setAudioData(audioData);
        sentence.setAudioContentType(contentType);
        sentenceRepository.save(sentence);
    }
}