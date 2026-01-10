package com.escaperoom.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "game_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "current_stage", nullable = false, length = 20)
    @Builder.Default
    private String currentStage = "CELL"; // "CELL", "DESK", "ESCAPED"
    
    // Inventory flags
    @Column(name = "has_rod", nullable = false)
    @Builder.Default
    private Boolean hasRod = false;
    
    @Column(name = "has_desk_key", nullable = false)
    @Builder.Default
    private Boolean hasDeskKey = false;
    
    @Column(name = "has_metal_piece", nullable = false)
    @Builder.Default
    private Boolean hasMetalPiece = false;
    
    // Puzzle completion flags
    @Column(name = "cell_drawer_unlocked", nullable = false)
    @Builder.Default
    private Boolean cellDrawerUnlocked = false;
    
    @Column(name = "cell_door_unlocked", nullable = false)
    @Builder.Default
    private Boolean cellDoorUnlocked = false;
    
    @Column(name = "desk_drawer_unlocked", nullable = false)
    @Builder.Default
    private Boolean deskDrawerUnlocked = false;
    
    @Column(name = "final_door_unlocked", nullable = false)
    @Builder.Default
    private Boolean finalDoorUnlocked = false;
    
    // Inspection counts stored as JSON string
    @Column(name = "inspection_counts", columnDefinition = "TEXT")
    @Builder.Default
    private String inspectionCounts = "{}";
    
    @Column(name = "start_time", nullable = false)
    private Instant startTime;
    
    @Column(name = "last_updated", nullable = false)
    private Instant lastUpdated;
    
    @PrePersist
    @PreUpdate
    protected void updateTimestamp() {
        if (startTime == null) {
            startTime = Instant.now();
        }
        lastUpdated = Instant.now();
    }
}
