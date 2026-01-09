package com.escaperoom.backend.dto;

import com.escaperoom.backend.model.DifficultyLevel;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class EscapeRunRequest {

    @NotNull(message = "User id is required")
    private UUID userId;

    @NotNull(message = "Difficulty is required")
    private DifficultyLevel difficulty;

    @NotNull(message = "Question ids are required")
    @Size(min = 6, max = 6, message = "Exactly 6 question ids must be provided")
    private List<Long> questionIds;

    @Positive(message = "Total time must be positive")
    private long totalTimeMillis;
}

