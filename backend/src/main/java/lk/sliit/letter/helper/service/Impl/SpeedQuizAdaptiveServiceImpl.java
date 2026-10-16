package lk.sliit.letter.helper.service.Impl;

import lk.sliit.letter.helper.controller.dto.request.SpeedQuizAttemptRequest;
import lk.sliit.letter.helper.controller.dto.response.SpeedQuizAttemptResponse;
import lk.sliit.letter.helper.model.SpeedQuizAttempt;
import lk.sliit.letter.helper.model.Student;
import lk.sliit.letter.helper.repository.SpeedQuizAttemptRepository;
import lk.sliit.letter.helper.repository.StudentRepository;
import lk.sliit.letter.helper.service.SpeedQuizAdaptiveService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import lk.sliit.letter.helper.model.SpeedQuizPracticeSession;
import lk.sliit.letter.helper.repository.SpeedQuizPracticeSessionRepository;
import lk.sliit.letter.helper.controller.dto.request.SpeedQuizPracticeRequest;
import lk.sliit.letter.helper.controller.dto.response.SpeedQuizPracticeResponse;

@Service
@RequiredArgsConstructor
public class SpeedQuizAdaptiveServiceImpl implements SpeedQuizAdaptiveService {

    private final SpeedQuizAttemptRepository attemptRepository;
    private final StudentRepository studentRepository;
    private final SpeedQuizPracticeSessionRepository practiceRepository;

    @Override
    @Transactional
    public SpeedQuizPracticeResponse savePracticeSession(
            String username, SpeedQuizPracticeRequest request) {

        if (request == null || request.getTargetLetter() == null
                || request.getConfusedLetter() == null
                || request.getTargetLetter().isBlank()
                || request.getConfusedLetter().isBlank()
                || request.getTargetLetter().length() > 20
                || request.getConfusedLetter().length() > 20
                || request.getTargetLetter().equals(request.getConfusedLetter())
                || request.getInitialConfusionCount() == null
                || request.getInitialConfusionCount() < 0
                || request.getPracticeAttempts() == null
                || request.getPracticeAttempts() < 1
                || request.getCorrectAttempts() == null
                || request.getCorrectAttempts() < 0
                || request.getCorrectAttempts() > request.getPracticeAttempts()
                || !Boolean.TRUE.equals(request.getMastered())) {
            throw new IllegalArgumentException("Invalid practice session");
        }

        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        SpeedQuizPracticeSession session = SpeedQuizPracticeSession.builder()
                .student(student)
                .targetLetter(request.getTargetLetter())
                .confusedLetter(request.getConfusedLetter())
                .initialConfusionCount(request.getInitialConfusionCount())
                .practiceAttempts(request.getPracticeAttempts())
                .correctAttempts(request.getCorrectAttempts())
                .mastered(request.getMastered())
                .build();

        return toPracticeResponse(practiceRepository.save(session));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpeedQuizPracticeResponse> getPracticeHistory(String username) {
        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return practiceRepository
                .findByStudentIdOrderByCompletedAtDescIdDesc(student.getId())
                .stream().map(this::toPracticeResponse).toList();
    }

    private SpeedQuizPracticeResponse toPracticeResponse(SpeedQuizPracticeSession s) {
        return new SpeedQuizPracticeResponse(
                s.getId(), s.getTargetLetter(), s.getConfusedLetter(),
                s.getInitialConfusionCount(), s.getPracticeAttempts(),
                s.getCorrectAttempts(), s.getMastered(), s.getCompletedAt());
    }


    @Override
    @Transactional
    public List<SpeedQuizAttemptResponse> saveAttempts(
            String username,
            List<SpeedQuizAttemptRequest> attempts) {

        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        if (attempts == null || attempts.isEmpty()) {
            throw new IllegalArgumentException("Attempts cannot be empty");
        }

        if (attempts.size() > 500) {
            throw new IllegalArgumentException("Too many attempts");
        }

        List<SpeedQuizAttempt> entities = attempts.stream()
                .map(request -> {
                    if (request == null
                            || request.getTargetLetter() == null
                            || request.getSelectedLetter() == null
                            || request.getTargetLetter().isBlank()
                            || request.getSelectedLetter().isBlank()
                            || request.getTargetLetter().length() > 20
                            || request.getSelectedLetter().length() > 20) {
                        throw new IllegalArgumentException("Invalid attempt data");
                    }

                    String target = request.getTargetLetter();
                    String selected = request.getSelectedLetter();

                    return SpeedQuizAttempt.builder()
                            .student(student)
                            .targetLetter(target)
                            .selectedLetter(selected)
                            .correct(target.equals(selected))
                            .build();
                })
                .toList();

        return attemptRepository.saveAll(entities)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpeedQuizAttemptResponse> getAttemptHistory(String username) {

        Student student = studentRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        return attemptRepository
                .findByStudentIdOrderByAttemptedAtAscIdAsc(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SpeedQuizAttemptResponse toResponse(SpeedQuizAttempt attempt) {
        return new SpeedQuizAttemptResponse(
                attempt.getId(),
                attempt.getTargetLetter(),
                attempt.getSelectedLetter(),
                attempt.getCorrect(),
                attempt.getAttemptedAt()
        );
    }
}
