package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.KeypointDto;
import lk.sliit.letter.helper.controller.dto.request.TracingCategoryRequest;
import lk.sliit.letter.helper.controller.dto.request.TracingLetterRequest;
import lk.sliit.letter.helper.controller.dto.response.TracingCategoryResponse;
import lk.sliit.letter.helper.controller.dto.response.TracingFullDataResponse;
import lk.sliit.letter.helper.controller.dto.response.TracingLetterResponse;
// NOTE: adjust this import if your NotFoundException lives in a different
// sub-package — it was visible in your project's exception folder.
import lk.sliit.letter.helper.exception.NotFoundException;
import lk.sliit.letter.helper.model.TracingCategory;
import lk.sliit.letter.helper.model.TracingLetterData;
import lk.sliit.letter.helper.repository.TracingCategoryRepository;
import lk.sliit.letter.helper.repository.TracingLetterDataRepository;
import lk.sliit.letter.helper.service.TracingDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * NOTE ON JSON HANDLING: this class deliberately does NOT use Jackson
 * (ObjectMapper / TypeReference / JavaType). Jackson wasn't resolvable on
 * this project's Maven compile classpath ("package com.fasterxml.jackson...
 * does not exist"), so phases/keypoints are hand-serialized to/from a tiny,
 * fully-controlled JSON shape instead — no external dependency needed.
 * If you'd rather use Jackson, add jackson-databind to pom.xml first (it
 * normally comes transitively via spring-boot-starter-web, so check
 * `mvn dependency:tree | findstr jackson` to see why it's missing here).
 */
@Service
@RequiredArgsConstructor
public class TracingDataServiceImpl implements TracingDataService {

    private final TracingCategoryRepository categoryRepository;
    private final TracingLetterDataRepository letterRepository;

    // ───────────────────────── full grouped data ─────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<TracingFullDataResponse> getFullTracingData() {
        List<TracingCategory> categories = categoryRepository.findAllByOrderByOrderIndexAsc();
        return categories.stream()
                .map(cat -> TracingFullDataResponse.builder()
                        .id(cat.getCode())
                        .name(cat.getName())
                        .nameEn(cat.getNameEn())
                        .letters(letterRepository.findByCategory_IdOrderByOrderIndexAsc(cat.getId())
                                .stream()
                                .map(this::toLetterResponse)
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    // ───────────────────────── categories ─────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<TracingCategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByOrderIndexAsc().stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TracingCategoryResponse createCategory(TracingCategoryRequest request) {
        TracingCategory category = TracingCategory.builder()
                .code(request.getCode())
                .name(request.getName())
                .nameEn(request.getNameEn())
                .orderIndex(request.getOrderIndex())
                .build();
        return toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public TracingCategoryResponse updateCategory(Long id, TracingCategoryRequest request) {
        TracingCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found: " + id));
        category.setCode(request.getCode());
        category.setName(request.getName());
        category.setNameEn(request.getNameEn());
        category.setOrderIndex(request.getOrderIndex());
        return toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new NotFoundException("Category not found: " + id);
        }
        categoryRepository.deleteById(id);
    }

    // ───────────────────────── letters ─────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<TracingLetterResponse> getAllLetters() {
        return letterRepository.findAllByOrderByOrderIndexAsc().stream()
                .map(this::toLetterResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TracingLetterResponse getLetterById(Long id) {
        TracingLetterData letter = letterRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Letter not found: " + id));
        return toLetterResponse(letter);
    }

    @Override
    @Transactional
    public TracingLetterResponse createLetter(TracingLetterRequest request) {
        TracingCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found: " + request.getCategoryId()));

        TracingLetterData letter = TracingLetterData.builder()
                .category(category)
                .letter(request.getLetter())
                .sound(request.getSound())
                .strokes(request.getStrokes())
                .difficulty(request.getDifficulty())
                .tip(request.getTip())
                .phasesJson(writePhasesJson(request.getPhases()))
                .keypointsJson(writeKeypointsJson(request.getKeypoints()))
                .orderIndex(request.getOrderIndex())
                .build();

        return toLetterResponse(letterRepository.save(letter));
    }

    @Override
    @Transactional
    public TracingLetterResponse updateLetter(Long id, TracingLetterRequest request) {
        TracingLetterData letter = letterRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Letter not found: " + id));

        if (request.getCategoryId() != null
                && (letter.getCategory() == null || !request.getCategoryId().equals(letter.getCategory().getId()))) {
            TracingCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found: " + request.getCategoryId()));
            letter.setCategory(category);
        }

        letter.setLetter(request.getLetter());
        letter.setSound(request.getSound());
        letter.setStrokes(request.getStrokes());
        letter.setDifficulty(request.getDifficulty());
        letter.setTip(request.getTip());
        letter.setPhasesJson(writePhasesJson(request.getPhases()));
        letter.setKeypointsJson(writeKeypointsJson(request.getKeypoints()));
        letter.setOrderIndex(request.getOrderIndex());

        return toLetterResponse(letterRepository.save(letter));
    }

    @Override
    @Transactional
    public void deleteLetter(Long id) {
        if (!letterRepository.existsById(id)) {
            throw new NotFoundException("Letter not found: " + id);
        }
        letterRepository.deleteById(id);
    }

    // ───────────────────────── mapping helpers ─────────────────────────

    private TracingCategoryResponse toCategoryResponse(TracingCategory category) {
        return TracingCategoryResponse.builder()
                .id(category.getId())
                .code(category.getCode())
                .name(category.getName())
                .nameEn(category.getNameEn())
                .orderIndex(category.getOrderIndex())
                .build();
    }

    private TracingLetterResponse toLetterResponse(TracingLetterData letter) {
        return TracingLetterResponse.builder()
                .id(letter.getId())
                .categoryId(letter.getCategory() != null ? letter.getCategory().getId() : null)
                .letter(letter.getLetter())
                .sound(letter.getSound())
                .strokes(letter.getStrokes())
                .difficulty(letter.getDifficulty())
                .tip(letter.getTip())
                .phases(readPhasesJson(letter.getPhasesJson()))
                .keypoints(readKeypointsJson(letter.getKeypointsJson()))
                .orderIndex(letter.getOrderIndex())
                .build();
    }

    // ───────────────────────── tiny hand-rolled JSON (no Jackson) ─────────────────────────

    private String writePhasesJson(List<String> phases) {
        StringBuilder sb = new StringBuilder("[");
        if (phases != null) {
            for (int i = 0; i < phases.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(jsonEscape(phases.get(i)));
            }
        }
        return sb.append(']').toString();
    }

    private String writeKeypointsJson(List<KeypointDto> keypoints) {
        StringBuilder sb = new StringBuilder("[");
        if (keypoints != null) {
            for (int i = 0; i < keypoints.size(); i++) {
                if (i > 0) sb.append(',');
                KeypointDto kp = keypoints.get(i);
                sb.append("{\"x\":").append(kp.getX()).append(",\"y\":").append(kp.getY()).append('}');
            }
        }
        return sb.append(']').toString();
    }

    private String jsonEscape(String value) {
        String s = value == null ? "" : value;
        StringBuilder sb = new StringBuilder(s.length() + 2);
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':  sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n");  break;
                case '\r': sb.append("\\r");  break;
                case '\t': sb.append("\\t");  break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        return sb.append('"').toString();
    }

    private List<String> readPhasesJson(String json) {
        List<String> result = new ArrayList<>();
        if (json == null || json.isBlank()) return result;
        String s = json.trim();
        if (s.length() < 2) return result;
        s = s.substring(1, s.length() - 1); // strip outer [ ]

        int i = 0;
        while (i < s.length()) {
            while (i < s.length() && (s.charAt(i) == ',' || Character.isWhitespace(s.charAt(i)))) i++;
            if (i >= s.length() || s.charAt(i) != '"') break;
            i++; // skip opening quote
            StringBuilder val = new StringBuilder();
            while (i < s.length() && s.charAt(i) != '"') {
                char c = s.charAt(i);
                if (c == '\\' && i + 1 < s.length()) {
                    char next = s.charAt(i + 1);
                    switch (next) {
                        case '"':  val.append('"');  break;
                        case '\\': val.append('\\'); break;
                        case 'n':  val.append('\n'); break;
                        case 'r':  val.append('\r'); break;
                        case 't':  val.append('\t'); break;
                        default:   val.append(next);
                    }
                    i += 2;
                } else {
                    val.append(c);
                    i++;
                }
            }
            i++; // skip closing quote
            result.add(val.toString());
        }
        return result;
    }

    private List<KeypointDto> readKeypointsJson(String json) {
        List<KeypointDto> result = new ArrayList<>();
        if (json == null || json.isBlank()) return result;
        String s = json.trim();
        if (s.length() < 2) return result;
        s = s.substring(1, s.length() - 1); // strip outer [ ]

        int i = 0;
        while (i < s.length()) {
            while (i < s.length() && (s.charAt(i) == ',' || Character.isWhitespace(s.charAt(i)))) i++;
            if (i >= s.length() || s.charAt(i) != '{') break;
            int end = s.indexOf('}', i);
            if (end == -1) break;
            String obj = s.substring(i + 1, end);

            double x = 0, y = 0;
            for (String part : obj.split(",")) {
                String[] kv = part.split(":");
                if (kv.length != 2) continue;
                String key = kv[0].trim().replace("\"", "");
                double val;
                try {
                    val = Double.parseDouble(kv[1].trim());
                } catch (NumberFormatException e) {
                    continue;
                }
                if (key.equals("x")) x = val;
                else if (key.equals("y")) y = val;
            }
            result.add(new KeypointDto(x, y));
            i = end + 1;
        }
        return result;
    }
}