package com.escaperoom.backend.dto;

import com.escaperoom.backend.model.DifficultyLevel;
import jakarta.validation.constraints.*;

import lombok.Data;

@Data
public class QuestionRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotBlank(message = "Answer is required")
    private String answer;

    private String hint;

    @Min(value = 1, message = "Order number must be at least 1")
    private int orderNumber;

    @NotNull(message = "Difficulty is required")
    private DifficultyLevel difficulty;
}
