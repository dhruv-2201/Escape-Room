package com.escaperoom.backend.service;

import com.escaperoom.backend.model.GameSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ItemUsageService {
    
    private final GameSessionService gameSessionService;
    
    @Autowired
    public ItemUsageService(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
    }
    
    @Transactional
    public boolean useItem(GameSession session, String item, String target) {
        if ("rod".equalsIgnoreCase(item)) {
            return useRod(session, target);
        } else if ("deskKey".equalsIgnoreCase(item) || "key".equalsIgnoreCase(item)) {
            return useDeskKey(session, target);
        }
        
        return false;
    }
    
    private boolean useRod(GameSession session, String target) {
        // Rod can only be used in CELL stage
        if (!"CELL".equals(session.getCurrentStage())) {
            return false;
        }
        
        // Player must have the rod
        if (!session.getHasRod()) {
            return false;
        }
        
        // Using rod to retrieve key from outside bars
        if (target == null || "desk".equalsIgnoreCase(target) || "key".equalsIgnoreCase(target)) {
            // Check if drawer is unlocked (prerequisite for finding the rod)
            if (session.getCellDrawerUnlocked() && !session.getHasDeskKey()) {
                session.setHasDeskKey(true);
                gameSessionService.updateSession(session);
                return true;
            }
        }
        
        return false;
    }
    
    private boolean useDeskKey(GameSession session, String target) {
        // Key can be used in DESK stage
        if (!"DESK".equals(session.getCurrentStage())) {
            return false;
        }
        
        // Player must have the key
        if (!session.getHasDeskKey()) {
            return false;
        }
        
        // Key might unlock something (for future expansion)
        // For now, key is just an item that was needed
        return false;
    }
    
    @Transactional
    public void acquireRod(GameSession session) {
        if (session.getCellDrawerUnlocked() && !session.getHasRod()) {
            session.setHasRod(true);
            gameSessionService.updateSession(session);
        }
    }
}
