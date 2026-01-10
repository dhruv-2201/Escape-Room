package com.escaperoom.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameStateDTO {
    private Long gameSessionId;
    private String currentStage; // "CELL", "DESK", "ESCAPED"
    
    // Inventory
    private Boolean hasRod;
    private Boolean hasDeskKey;
    private Boolean hasMetalPiece;
    
    // Puzzle flags
    private Boolean cellDrawerUnlocked;
    private Boolean cellDoorUnlocked;
    private Boolean deskDrawerUnlocked;
    private Boolean finalDoorUnlocked;
    
    // Inspection counts (map of stage -> count)
    private Map<String, Integer> inspectionCounts;
    
    // Lock input states (optional, for frontend convenience)
    private Map<String, String> lockInputs;
}
