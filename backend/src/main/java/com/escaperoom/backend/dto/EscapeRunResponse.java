package com.escaperoom.backend.dto;

import com.escaperoom.backend.model.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
public class EscapeRunResponse {

    private Long runId;
    private DifficultyLevel difficulty;
    private long totalTimeMillis;
    private Instant finishedAt;
    private List<Long> questionIds;
}

