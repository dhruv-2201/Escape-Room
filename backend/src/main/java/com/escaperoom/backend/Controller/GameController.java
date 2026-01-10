package com.escaperoom.backend.controller;

import com.escaperoom.backend.dto.*;
import com.escaperoom.backend.model.GameSession;
import com.escaperoom.backend.service.GameSessionService;
import com.escaperoom.backend.service.InspectionService;
import com.escaperoom.backend.service.ItemUsageService;
import com.escaperoom.backend.service.LockValidationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Game", description = "Endpoints for escape room game")
public class GameController {
    
    private final GameSessionService gameSessionService;
    private final InspectionService inspectionService;
    private final LockValidationService lockValidationService;
    private final ItemUsageService itemUsageService;
    
    @Autowired
    public GameController(
            GameSessionService gameSessionService,
            InspectionService inspectionService,
            LockValidationService lockValidationService,
            ItemUsageService itemUsageService) {
        this.gameSessionService = gameSessionService;
        this.inspectionService = inspectionService;
        this.lockValidationService = lockValidationService;
        this.itemUsageService = itemUsageService;
    }
    
    @PostMapping("/session/start")
    public ResponseEntity<GameStateDTO> startGameSession(@Valid @RequestBody StartGameSessionRequestDTO request) {
        try {
            GameSession session = gameSessionService.startNewSession(request.getUserId());
            GameStateDTO initialState = gameSessionService.convertToDTO(session);
            return ResponseEntity.ok(initialState);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<GameStateDTO> getGameSession(
            @PathVariable Long sessionId,
            @RequestParam UUID userId) {
        return gameSessionService.getSession(sessionId, userId)
                .map(session -> ResponseEntity.ok(gameSessionService.convertToDTO(session)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/session/latest")
    public ResponseEntity<GameStateDTO> getLatestGameSession(@RequestParam UUID userId) {
        return gameSessionService.getLatestSession(userId)
                .map(session -> ResponseEntity.ok(gameSessionService.convertToDTO(session)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/session/{sessionId}/state")
    public ResponseEntity<GameStateDTO> updateGameState(
            @PathVariable Long sessionId,
            @RequestParam UUID userId,
            @Valid @RequestBody GameStateDTO gameState) {
        return gameSessionService.getSession(sessionId, userId)
                .map(session -> {
                    // Update session from DTO (only allow certain fields to be updated)
                    if (gameState.getCurrentStage() != null) {
                        session.setCurrentStage(gameState.getCurrentStage());
                    }
                    if (gameState.getHasRod() != null) {
                        session.setHasRod(gameState.getHasRod());
                    }
                    if (gameState.getHasDeskKey() != null) {
                        session.setHasDeskKey(gameState.getHasDeskKey());
                    }
                    if (gameState.getCellDrawerUnlocked() != null) {
                        session.setCellDrawerUnlocked(gameState.getCellDrawerUnlocked());
                    }
                    if (gameState.getCellDoorUnlocked() != null) {
                        session.setCellDoorUnlocked(gameState.getCellDoorUnlocked());
                    }
                    if (gameState.getDeskDrawerUnlocked() != null) {
                        session.setDeskDrawerUnlocked(gameState.getDeskDrawerUnlocked());
                    }
                    if (gameState.getFinalDoorUnlocked() != null) {
                        session.setFinalDoorUnlocked(gameState.getFinalDoorUnlocked());
                    }
                    GameSession updated = gameSessionService.updateSession(session);
                    return ResponseEntity.ok(gameSessionService.convertToDTO(updated));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping("/inspect")
    public ResponseEntity<InspectionResponseDTO> inspectScene(@Valid @RequestBody InspectionRequestDTO request) {
        // For now, we get session by ID only. In production, validate userId from auth context
        return gameSessionService.getSessionById(request.getGameSessionId())
                .map(session -> {
                    String inspectionText = inspectionService.getInspectionText(
                            session, 
                            request.getStage(), 
                            request.getInspectionArea()
                    );
                    
                    // If inspection might have triggered state changes (like acquiring rod)
                    // We check and update state here
                    if ("CELL".equals(request.getStage()) && session.getCellDrawerUnlocked() && !session.getHasRod()) {
                        // Player should have rod available after drawer is unlocked and inspecting
                        int count = gameSessionService.getInspectionCount(session, request.getStage(), request.getInspectionArea());
                        if (count >= 5) {
                            itemUsageService.acquireRod(session);
                            // Refresh session
                            session = gameSessionService.getSessionById(request.getGameSessionId())
                                    .orElse(session);
                        }
                    }
                    
                    // Refresh session to get latest state after inspection count update
                    session = gameSessionService.getSessionById(request.getGameSessionId())
                            .orElse(session);
                    
                    GameStateDTO updatedState = gameSessionService.convertToDTO(session);
                    
                    InspectionResponseDTO response = InspectionResponseDTO.builder()
                            .inspectionText(inspectionText)
                            .updatedState(updatedState)
                            .build();
                    
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping("/validate/cell-drawer")
    public ResponseEntity<LockValidationResponseDTO> validateCellDrawer(@Valid @RequestBody LockValidationRequestDTO request) {
        return validateLock("cell-drawer", request);
    }
    
    @PostMapping("/validate/cell-door")
    public ResponseEntity<LockValidationResponseDTO> validateCellDoor(@Valid @RequestBody LockValidationRequestDTO request) {
        return validateLock("cell-door", request);
    }
    
    @PostMapping("/validate/desk-drawer")
    public ResponseEntity<LockValidationResponseDTO> validateDeskDrawer(@Valid @RequestBody LockValidationRequestDTO request) {
        return validateLock("desk-drawer", request);
    }
    
    @PostMapping("/validate/final-door")
    public ResponseEntity<LockValidationResponseDTO> validateFinalDoor(@Valid @RequestBody LockValidationRequestDTO request) {
        return validateLock("final-door", request);
    }
    
    private ResponseEntity<LockValidationResponseDTO> validateLock(String lockType, LockValidationRequestDTO request) {
        // Note: In production, you should validate userId from session/authentication
        // For now, we'll get session by ID only
        return gameSessionService.getSessionById(request.getGameSessionId())
                .map(session -> {
                    boolean correct = false;
                    String message;
                    
                    switch (lockType) {
                        case "cell-drawer":
                            correct = lockValidationService.validateCellDrawer(session, request.getAnswer());
                            break;
                        case "cell-door":
                            correct = lockValidationService.validateCellDoor(session, request.getAnswer());
                            break;
                        case "desk-drawer":
                            correct = lockValidationService.validateDeskDrawer(session, request.getAnswer());
                            break;
                        case "final-door":
                            correct = lockValidationService.validateFinalDoor(session, request.getAnswer());
                            break;
                    }
                    
                    // Refresh session to get latest state
                    session = gameSessionService.getSessionById(request.getGameSessionId())
                            .orElse(session);
                    
                    GameStateDTO updatedState = gameSessionService.convertToDTO(session);
                    
                    if (correct) {
                        message = "Correct!";
                    } else {
                        message = "Incorrect. Try again.";
                    }
                    
                    LockValidationResponseDTO response = LockValidationResponseDTO.builder()
                            .correct(correct)
                            .message(message)
                            .updatedState(updatedState)
                            .build();
                    
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping("/use-item")
    public ResponseEntity<InspectionResponseDTO> useItem(@Valid @RequestBody UseItemRequestDTO request) {
        return gameSessionService.getSessionById(request.getGameSessionId())
                .map(session -> {
                    boolean success = itemUsageService.useItem(session, request.getItem(), request.getTarget());
                    
                    // Refresh session
                    session = gameSessionService.getSessionById(request.getGameSessionId())
                            .orElse(session);
                    
                    GameStateDTO updatedState = gameSessionService.convertToDTO(session);
                    
                    String message = success 
                            ? "Item used successfully." 
                            : "Cannot use item in this context.";
                    
                    InspectionResponseDTO response = InspectionResponseDTO.builder()
                            .inspectionText(message)
                            .updatedState(updatedState)
                            .build();
                    
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping("/transition")
    public ResponseEntity<GameStateDTO> transitionStage(
            @RequestParam Long gameSessionId,
            @RequestParam String targetStage) {
        Optional<GameSession> sessionOpt = gameSessionService.getSessionById(gameSessionId);
        
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        GameSession session = sessionOpt.get();
        
        // Validate transition prerequisites
        if ("DESK".equals(targetStage) && !session.getCellDoorUnlocked()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        if ("ESCAPED".equals(targetStage) && !session.getFinalDoorUnlocked()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        session.setCurrentStage(targetStage);
        GameSession updated = gameSessionService.updateSession(session);
        return ResponseEntity.ok(gameSessionService.convertToDTO(updated));
    }
}
