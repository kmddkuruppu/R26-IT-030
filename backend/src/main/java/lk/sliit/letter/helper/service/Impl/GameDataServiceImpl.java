package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.*;
import lk.sliit.letter.helper.controller.dto.response.*;
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.*;
import lk.sliit.letter.helper.repository.*;
import lk.sliit.letter.helper.service.GameDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameDataServiceImpl implements GameDataService {

    private final SinhalaLetterRepository letterRepository;
    private final SinhalaWordRepository wordRepository;
    private final ConnectSetRepository connectSetRepository;
    private final ConnectPairRepository connectPairRepository;

    // ─── LETTERS ──────────────────────────────────────────────────
    @Override
    public List<SinhalaLetterResponse> getAllLetters() {
        return letterRepository.findAllByOrderByCategoryNameAscSortOrderAsc()
                .stream().map(this::toLetterResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SinhalaLetterResponse createLetter(SinhalaLetterRequest req) {
        SinhalaLetter letter = SinhalaLetter.builder()
                .letter(req.getLetter()).name(req.getName()).sound(req.getSound())
                .categoryName(req.getCategoryName()).categoryColor(req.getCategoryColor())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .build();
        return toLetterResponse(letterRepository.save(letter));
    }

    @Override
    @Transactional
    public SinhalaLetterResponse updateLetter(Long id, SinhalaLetterRequest req) {
        SinhalaLetter letter = letterRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Letter not found: " + id));
        letter.setLetter(req.getLetter()); letter.setName(req.getName());
        letter.setSound(req.getSound()); letter.setCategoryName(req.getCategoryName());
        letter.setCategoryColor(req.getCategoryColor());
        if (req.getSortOrder() != null) letter.setSortOrder(req.getSortOrder());
        return toLetterResponse(letterRepository.save(letter));
    }

    @Override
    @Transactional
    public void deleteLetter(Long id) {
        if (!letterRepository.existsById(id))
            throw new NotFoundException("Letter not found: " + id);
        letterRepository.deleteById(id);
    }

    // ─── WORDS ────────────────────────────────────────────────────
    @Override
    public List<SinhalaWordResponse> getAllWords() {
        return wordRepository.findAllByOrderByIdAsc()
                .stream().map(this::toWordResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SinhalaWordResponse createWord(SinhalaWordRequest req) {
        SinhalaWord word = SinhalaWord.builder()
                .word(req.getWord())
                .syllables(String.join(",", req.getSyllables()))
                .emoji(req.getEmoji())
                .build();
        return toWordResponse(wordRepository.save(word));
    }

    @Override
    @Transactional
    public SinhalaWordResponse updateWord(Long id, SinhalaWordRequest req) {
        SinhalaWord word = wordRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Word not found: " + id));
        word.setWord(req.getWord());
        word.setSyllables(String.join(",", req.getSyllables()));
        word.setEmoji(req.getEmoji());
        return toWordResponse(wordRepository.save(word));
    }

    @Override
    @Transactional
    public void deleteWord(Long id) {
        if (!wordRepository.existsById(id))
            throw new NotFoundException("Word not found: " + id);
        wordRepository.deleteById(id);
    }

    // ─── CONNECT SETS ─────────────────────────────────────────────
    @Override
    public List<ConnectSetResponse> getAllConnectSets() {
        return connectSetRepository.findAllByOrderBySortOrderAsc()
                .stream().map(this::toConnectSetResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConnectSetResponse createConnectSet(ConnectSetRequest req) {
        ConnectSet set = ConnectSet.builder()
                .title(req.getTitle())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .build();
        ConnectSet saved = connectSetRepository.save(set);
        savePairs(saved, req.getPairs());
        return toConnectSetResponse(connectSetRepository.findById(saved.getId()).get());
    }

    @Override
    @Transactional
    public ConnectSetResponse updateConnectSet(Long id, ConnectSetRequest req) {
        ConnectSet set = connectSetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ConnectSet not found: " + id));
        set.setTitle(req.getTitle());
        if (req.getSortOrder() != null) set.setSortOrder(req.getSortOrder());
        connectPairRepository.deleteByConnectSet(set);
        connectSetRepository.save(set);
        savePairs(set, req.getPairs());
        return toConnectSetResponse(connectSetRepository.findById(id).get());
    }

    @Override
    @Transactional
    public void deleteConnectSet(Long id) {
        ConnectSet set = connectSetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ConnectSet not found: " + id));
        connectPairRepository.deleteByConnectSet(set);
        connectSetRepository.delete(set);
    }

    // ─── Helpers ──────────────────────────────────────────────────
    private void savePairs(ConnectSet set, List<ConnectSetRequest.ConnectPairItem> items) {
        if (items == null) return;
        for (int i = 0; i < items.size(); i++) {
            ConnectSetRequest.ConnectPairItem item = items.get(i);
            connectPairRepository.save(ConnectPair.builder()
                    .connectSet(set).leftText(item.getLeftText()).rightText(item.getRightText())
                    .leftMeaning(item.getLeftMeaning()).rightMeaning(item.getRightMeaning())
                    .sortOrder(item.getSortOrder() != null ? item.getSortOrder() : i)
                    .build());
        }
    }

    private SinhalaLetterResponse toLetterResponse(SinhalaLetter l) {
        return SinhalaLetterResponse.builder()
                .id(l.getId()).letter(l.getLetter()).name(l.getName()).sound(l.getSound())
                .categoryName(l.getCategoryName()).categoryColor(l.getCategoryColor())
                .sortOrder(l.getSortOrder()).build();
    }

    private SinhalaWordResponse toWordResponse(SinhalaWord w) {
        return SinhalaWordResponse.builder()
                .id(w.getId()).word(w.getWord())
                .syllables(Arrays.asList(w.getSyllables().split(",")))
                .emoji(w.getEmoji()).build();
    }

    private ConnectSetResponse toConnectSetResponse(ConnectSet set) {
        List<ConnectSetResponse.ConnectPairResponse> pairs =
                connectPairRepository.findByConnectSetOrderBySortOrderAsc(set)
                        .stream().map(p -> ConnectSetResponse.ConnectPairResponse.builder()
                                .id(p.getId()).leftText(p.getLeftText()).rightText(p.getRightText())
                                .leftMeaning(p.getLeftMeaning()).rightMeaning(p.getRightMeaning())
                                .sortOrder(p.getSortOrder()).build())
                        .collect(Collectors.toList());
        return ConnectSetResponse.builder()
                .id(set.getId()).title(set.getTitle())
                .sortOrder(set.getSortOrder()).pairs(pairs).build();
    }
}