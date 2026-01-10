package com.escaperoom.backend.service;

import com.escaperoom.backend.model.GameSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
public class InspectionService {
    
    private final GameSessionService gameSessionService;
    private final Random random;
    
    @Autowired
    public InspectionService(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
        this.random = new Random();
    }
    
    public String getInspectionText(GameSession session, String stage, String area) {
        // Increment inspection count
        gameSessionService.incrementInspectionCount(session, stage, area);
        int count = gameSessionService.getInspectionCount(session, stage, area);
        
        if ("CELL".equals(stage)) {
            return getCellInspectionText(session, count, area);
        } else if ("DESK".equals(stage)) {
            return getDeskInspectionText(session, count, area);
        }
        
        return "You look around, but nothing stands out.";
    }
    
    private String getCellInspectionText(GameSession session, int count, String area) {
        // First few clicks: General observations (flavor text)
        if (count <= 3) {
            List<String> flavorTexts = Arrays.asList(
                "The cell is dimly lit. Stone walls surround you.",
                "You notice the bars are sturdy, made of iron.",
                "There's a small window, too high to reach.",
                "The floor is cold and rough beneath your feet.",
                "A single cot sits in the corner, covered with a thin blanket."
            );
            return getRandomText(flavorTexts);
        }
        
        // After 3 clicks: Start hinting at drawer (if not unlocked)
        if (!session.getCellDrawerUnlocked() && count == 4) {
            return "There's a small drawer in the corner, but it's locked.";
        }
        
        // If drawer unlocked but rod not found: Hint at rod
        if (session.getCellDrawerUnlocked() && !session.getHasRod() && count >= 5) {
            return "The drawer is open. Inside, you see a metal rod, about a foot long. It might be useful.";
        }
        
        // If rod found but key not retrieved: Hint at using it
        if (session.getHasRod() && !session.getHasDeskKey() && count >= 6) {
            return "Through the bars, you can see a key on the deputy's desk, just out of reach. Perhaps you can use something to retrieve it.";
        }
        
        // After using rod to get key: Success message
        if (session.getHasDeskKey() && count >= 7) {
            return "You successfully retrieved the key using the rod. It might unlock something.";
        }
        
        // If door is unlocked but still in CELL stage
        if (session.getCellDoorUnlocked()) {
            return "The cell door is now unlocked. You can move forward.";
        }
        
        // Default: Return varied flavor text
        List<String> defaultTexts = Arrays.asList(
            "You examine the cell more carefully, but find nothing new.",
            "The stone walls offer no secrets.",
            "Time passes slowly in this place."
        );
        return getRandomText(defaultTexts);
    }
    
    private String getDeskInspectionText(GameSession session, int count, String area) {
        // First few clicks: General observations
        if (count <= 3) {
            List<String> flavorTexts = Arrays.asList(
                "The deputy's desk is cluttered with paperwork.",
                "A lamp casts shadows across the room.",
                "You're now outside the cell, but still in the prison.",
                "The desk drawer appears to be locked.",
                "Various items are scattered on the desk surface."
            );
            return getRandomText(flavorTexts);
        }
        
        // After 3 clicks: Hint at desk drawer
        if (!session.getDeskDrawerUnlocked() && count == 4) {
            return "The desk drawer is locked. You'll need to find the right combination.";
        }
        
        // If desk drawer unlocked
        if (session.getDeskDrawerUnlocked() && !session.getFinalDoorUnlocked()) {
            return "The drawer is open. Inside, you find a note with numbers: 4-7-2-9. This might be important.";
        }
        
        // If final door unlocked
        if (session.getFinalDoorUnlocked()) {
            return "The path to freedom is clear. You have escaped!";
        }
        
        // Default: Return varied flavor text
        List<String> defaultTexts = Arrays.asList(
            "You search the desk area, but find nothing new.",
            "The paperwork reveals nothing useful.",
            "Time is running out."
        );
        return getRandomText(defaultTexts);
    }
    
    private String getRandomText(List<String> texts) {
        return texts.get(random.nextInt(texts.size()));
    }
}
