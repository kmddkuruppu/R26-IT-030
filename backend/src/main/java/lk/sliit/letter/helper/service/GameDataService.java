package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.*;
import lk.sliit.letter.helper.controller.dto.response.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface GameDataService {
    // Letters
    List<SinhalaLetterResponse> getAllLetters();
    SinhalaLetterResponse createLetter(SinhalaLetterRequest request);
    SinhalaLetterResponse updateLetter(Long id, SinhalaLetterRequest request);
    void deleteLetter(Long id);

    // Words
    List<SinhalaWordResponse> getAllWords();
    SinhalaWordResponse createWord(SinhalaWordRequest request);
    SinhalaWordResponse updateWord(Long id, SinhalaWordRequest request);
    void deleteWord(Long id);
    String uploadWordImage(MultipartFile file);

    // Connect Sets
    List<ConnectSetResponse> getAllConnectSets();
    ConnectSetResponse createConnectSet(ConnectSetRequest request);
    ConnectSetResponse updateConnectSet(Long id, ConnectSetRequest request);
    void deleteConnectSet(Long id);
}