package com.escaperoom.backend.service;

import com.escaperoom.backend.dto.GameStateDTO;
import com.escaperoom.backend.model.GameSession;
import com.escaperoom.backend.model.User;
import com.escaperoom.backend.repo.GameSessionRepository;
import com.escaperoom.backend.repo.UserRepo;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class GameSessionService {
    
    private final GameSessionRepository gameSessionRepository;
    private final UserRepo userRepo;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public GameSessionService(GameSessionRepository gameSessionRepository, UserRepo userRepo) {
        this.gameSessionRepository = gameSessionRepository;
        this.userRepo = userRepo;
        this.objectMapper = new ObjectMapper();
    }
    
    @Transactional
    public GameSession startNewSession(UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        GameSession session = GameSession.builder()
                .user(user)
                .currentStage("CELL")
                .hasRod(false)
                .hasDeskKey(false)
                .hasMetalPiece(false)
                .cellDrawerUnlocked(false)
                .cellDoorUnlocked(false)
                .deskDrawerUnlocked(false)
                .finalDoorUnlocked(false)
                .inspectionCounts("{}")
                .build();
        
        return gameSessionRepository.save(session);
    }
    
    public Optional<GameSession> getSession(Long sessionId, UUID userId) {
        if (userId != null) {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            return gameSessionRepository.findByIdAndUser(sessionId, user);
        }
        // For development: allow getting session by ID only
        return gameSessionRepository.findById(sessionId);
    }
    
    public Optional<GameSession> getSessionById(Long sessionId) {
        return gameSessionRepository.findById(sessionId);
    }
    
    public Optional<GameSession> getLatestSession(UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return gameSessionRepository.findFirstByUserOrderByLastUpdatedDesc(user);
    }
    
    @Transactional
    public GameSession updateSession(GameSession session) {
        return gameSessionRepository.save(session);
    }
    
    public GameStateDTO convertToDTO(GameSession session) {
        Map<String, Integer> inspectionCounts = parseInspectionCounts(session.getInspectionCounts());
        
        return GameStateDTO.builder()
                .gameSessionId(session.getId())
                .currentStage(session.getCurrentStage())
                .hasRod(session.getHasRod())
                .hasDeskKey(session.getHasDeskKey())
                .hasMetalPiece(session.getHasMetalPiece())
                .cellDrawerUnlocked(session.getCellDrawerUnlocked())
                .cellDoorUnlocked(session.getCellDoorUnlocked())
                .deskDrawerUnlocked(session.getDeskDrawerUnlocked())
                .finalDoorUnlocked(session.getFinalDoorUnlocked())
                .inspectionCounts(inspectionCounts)
                .build();
    }
    
    public Map<String, Integer> parseInspectionCounts(String json) {
        try {
            if (json == null || json.trim().isEmpty()) {
                return new HashMap<>();
            }
            return objectMapper.readValue(json, new TypeReference<Map<String, Integer>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
    
    public String serializeInspectionCounts(Map<String, Integer> counts) {
        try {
            return objectMapper.writeValueAsString(counts);
        } catch (Exception e) {
            return "{}";
        }
    }
    
    @Transactional
    public void incrementInspectionCount(GameSession session, String stage, String area) {
        Map<String, Integer> counts = parseInspectionCounts(session.getInspectionCounts());
        String key = area != null ? stage + "_" + area : stage + "_scene";
        counts.put(key, counts.getOrDefault(key, 0) + 1);
        session.setInspectionCounts(serializeInspectionCounts(counts));
        gameSessionRepository.save(session);
    }
    
    public int getInspectionCount(GameSession session, String stage, String area) {
        Map<String, Integer> counts = parseInspectionCounts(session.getInspectionCounts());
        String key = area != null ? stage + "_" + area : stage + "_scene";
        return counts.getOrDefault(key, 0);
    }
}
