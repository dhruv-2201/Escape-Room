package com.escaperoom.backend.service;

import com.escaperoom.backend.model.GameSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LockValidationService {
    
    private final GameSessionService gameSessionService;
    
    @Autowired
    public LockValidationService(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
    }
    
    @Transactional
    public boolean validateCellDrawer(GameSession session, String answer) {
        // No prerequisites for cell drawer - it's the first lock
        if ("1247".equals(answer.trim())) {
            session.setCellDrawerUnlocked(true);
            gameSessionService.updateSession(session);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean validateCellDoor(GameSession session, String answer) {
        // Prerequisite: Cell drawer must be unlocked first
        if (!session.getCellDrawerUnlocked()) {
            return false;
        }
        
        if ("3589".equals(answer.trim())) {
            session.setCellDoorUnlocked(true);
            
            // Check if we should transition to DESK stage
            if (session.getCellDoorUnlocked() && "CELL".equals(session.getCurrentStage())) {
                session.setCurrentStage("DESK");
            }
            
            gameSessionService.updateSession(session);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean validateDeskDrawer(GameSession session, String answer) {
        // Prerequisite: Must be in DESK stage
        if (!"DESK".equals(session.getCurrentStage())) {
            return false;
        }
        
        if ("4729".equals(answer.trim())) {
            session.setDeskDrawerUnlocked(true);
            gameSessionService.updateSession(session);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean validateFinalDoor(GameSession session, String answer) {
        // Prerequisite: Desk drawer must be unlocked first
        if (!session.getDeskDrawerUnlocked()) {
            return false;
        }
        
        // Prerequisite: Must be in DESK stage
        if (!"DESK".equals(session.getCurrentStage())) {
            return false;
        }
        
        if ("8264".equals(answer.trim())) {
            session.setFinalDoorUnlocked(true);
            
            // Transition to ESCAPED stage
            if ("DESK".equals(session.getCurrentStage())) {
                session.setCurrentStage("ESCAPED");
            }
            
            gameSessionService.updateSession(session);
            return true;
        }
        return false;
    }
    
    public String getLockName(String lockType) {
        switch (lockType) {
            case "cell-drawer": return "cellDrawer";
            case "cell-door": return "cellDoor";
            case "desk-drawer": return "deskDrawer";
            case "final-door": return "finalDoor";
            default: return null;
        }
    }
}
