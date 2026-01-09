package com.escaperoom.backend.service;

import com.escaperoom.backend.model.DifficultyLevel;
import com.escaperoom.backend.model.EscapeRun;
import com.escaperoom.backend.model.Question;
import com.escaperoom.backend.model.User;
import com.escaperoom.backend.repo.EscapeRunRepo;
import com.escaperoom.backend.repo.QuestionRepo;
import com.escaperoom.backend.repo.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EscapeRunService {

    private static final int EXPECTED_QUESTION_COUNT = 6;

    private final EscapeRunRepo escapeRunRepo;
    private final UserRepo userRepo;
    private final QuestionRepo questionRepo;

    public EscapeRunService(EscapeRunRepo escapeRunRepo, UserRepo userRepo, QuestionRepo questionRepo) {
        this.escapeRunRepo = escapeRunRepo;
        this.userRepo = userRepo;
        this.questionRepo = questionRepo;
    }

    @Transactional
    @SuppressWarnings("null")
    public EscapeRun recordRun(UUID userId,
                               DifficultyLevel difficulty,
                               List<Long> questionIds,
                               long totalTimeMillis) {
        if (userId == null) {
            throw new IllegalArgumentException("User id must be provided.");
        }
        validateParameters(difficulty, questionIds, totalTimeMillis);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for id: " + userId));

        List<Long> orderedQuestionIds = List.copyOf(questionIds);

        Map<Long, Question> questionById = questionRepo.findAllById(orderedQuestionIds).stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        if (questionById.size() != orderedQuestionIds.size()) {
            throw new IllegalArgumentException("One or more question ids are invalid.");
        }

        boolean allMatchDifficulty = orderedQuestionIds.stream()
                .map(questionById::get)
                .map(Question::getDifficulty)
                .allMatch(difficulty::equals);

        if (!allMatchDifficulty) {
            throw new IllegalArgumentException("All questions must match the submitted difficulty.");
        }

        EscapeRun run = EscapeRun.builder()
                .user(user)
                .difficulty(difficulty)
                .totalTimeMillis(totalTimeMillis)
                .finishedAt(Instant.now())
                .questionIds(orderedQuestionIds)
                .build();

        return escapeRunRepo.save(run);
    }

    public Optional<EscapeRun> latestRun(UUID userId, DifficultyLevel difficulty) {
        if (difficulty == null) {
            throw new IllegalArgumentException("Difficulty must be provided.");
        }
        return escapeRunRepo.findFirstByUserIdAndDifficultyOrderByFinishedAtDesc(userId, difficulty);
    }

    private void validateParameters(DifficultyLevel difficulty,
                                    List<Long> questionIds,
                                    long totalTimeMillis) {
        if (difficulty == null || !EnumSet.allOf(DifficultyLevel.class).contains(difficulty)) {
            throw new IllegalArgumentException("Unknown difficulty provided.");
        }
        if (CollectionUtils.isEmpty(questionIds)) {
            throw new IllegalArgumentException("Question ids must be provided.");
        }
        if (questionIds.size() != EXPECTED_QUESTION_COUNT) {
            throw new IllegalArgumentException(
                    "A completed run must include exactly " + EXPECTED_QUESTION_COUNT + " question ids."
            );
        }
        if (questionIds.stream().distinct().count() != questionIds.size()) {
            throw new IllegalArgumentException("Question ids must be unique.");
        }
        if (totalTimeMillis <= 0) {
            throw new IllegalArgumentException("Total time must be a positive value.");
        }
    }
}

