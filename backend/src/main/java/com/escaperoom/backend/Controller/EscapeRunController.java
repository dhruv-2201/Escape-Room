package com.escaperoom.backend.controller;

import com.escaperoom.backend.dto.EscapeRunRequest;
import com.escaperoom.backend.dto.EscapeRunResponse;
import com.escaperoom.backend.model.DifficultyLevel;
import com.escaperoom.backend.model.EscapeRun;
import com.escaperoom.backend.service.EscapeRunService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/runs")
@Tag(name = "Escape Runs", description = "Endpoints for recording and recalling escape room runs")
@CrossOrigin(origins = "http://localhost:5173")
public class EscapeRunController {

    private final EscapeRunService escapeRunService;

    public EscapeRunController(EscapeRunService escapeRunService) {
        this.escapeRunService = escapeRunService;
    }

    @Operation(summary = "Record a completed run", description = "Persists a user's completed 6-question run.")
    @PostMapping
    public ResponseEntity<EscapeRunResponse> submitRun(@Valid @RequestBody EscapeRunRequest request) {
        EscapeRun run = escapeRunService.recordRun(
                request.getUserId(),
                request.getDifficulty(),
                request.getQuestionIds(),
                request.getTotalTimeMillis()
        );

        EscapeRunResponse response = toResponse(run);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Recall latest run", description = "Returns the most recent completed run for the given user and difficulty.")
    @GetMapping("/latest")
    public ResponseEntity<EscapeRunResponse> latestRun(@RequestParam UUID userId,
                                                       @RequestParam DifficultyLevel difficulty) {
        return escapeRunService.latestRun(userId, difficulty)
                .map(run -> ResponseEntity.ok(toResponse(run)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    private EscapeRunResponse toResponse(EscapeRun run) {
        return new EscapeRunResponse(
                run.getId(),
                run.getDifficulty(),
                run.getTotalTimeMillis(),
                run.getFinishedAt(),
                run.getQuestionIds()
        );
    }
}

