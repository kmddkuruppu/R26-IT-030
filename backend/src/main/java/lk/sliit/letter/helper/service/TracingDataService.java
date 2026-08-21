package lk.sliit.letter.helper.service;

import lk.sliit.letter.helper.controller.dto.request.TracingCategoryRequest;
import lk.sliit.letter.helper.controller.dto.request.TracingLetterRequest;
import lk.sliit.letter.helper.controller.dto.response.TracingCategoryResponse;
import lk.sliit.letter.helper.controller.dto.response.TracingFullDataResponse;
import lk.sliit.letter.helper.controller.dto.response.TracingLetterResponse;

import java.util.List;

public interface TracingDataService {

    // used by LetterTracing.js on page load
    List<TracingFullDataResponse> getFullTracingData();

    // categories (admin)
    List<TracingCategoryResponse> getAllCategories();
    TracingCategoryResponse createCategory(TracingCategoryRequest request);
    TracingCategoryResponse updateCategory(Long id, TracingCategoryRequest request);
    void deleteCategory(Long id);

    // letters (admin)
    List<TracingLetterResponse> getAllLetters();
    TracingLetterResponse getLetterById(Long id);
    TracingLetterResponse createLetter(TracingLetterRequest request);
    TracingLetterResponse updateLetter(Long id, TracingLetterRequest request);
    void deleteLetter(Long id);
}