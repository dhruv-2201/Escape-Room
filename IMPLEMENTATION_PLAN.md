# Escape Room Game - Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for a state-driven, scene-based escape room game with React frontend and Spring Boot backend.

---

## 1. ARCHITECTURE OVERVIEW

### Core Design Principles
- **State-driven gameplay**: Game progress determined by state flags, not UI interactions
- **No visual indicators**: No cursor changes, hover effects, or clickable hotspots
- **Contextual clues**: Meaning emerges from sequencing and state, not discoverability
- **Clean separation**: Scene rendering, puzzle logic, and state management are modular

### Technology Stack
- **Frontend**: React (existing)
- **Backend**: Spring Boot REST API (existing)
- **State Management**: React Context API + useState (recommended for simplicity)
- **Communication**: REST API calls (no WebSockets needed)

---

## 2. STATE MODEL

### Game State Structure

```typescript
interface GameState {
  // Stage progression
  currentStage: 'CELL' | 'DESK' | 'ESCAPED';
  
  // Inventory/Items (what player has acquired)
  inventory: {
    hasRod: boolean;
    hasDeskKey: boolean;
    hasMetalPiece: boolean; // example for future expansion
  };
  
  // Puzzle completion flags
  puzzles: {
    cellDrawerUnlocked: boolean;
    cellDoorUnlocked: boolean;
    deskDrawerUnlocked: boolean;
    finalDoorUnlocked: boolean;
  };
  
  // Inspection history (for context-dependent responses)
  inspectionCount: {
    cellScene: number;      // How many times clicked in CELL stage
    deskScene: number;      // How many times clicked in DESK stage
    [key: string]: number;  // Expandable for specific areas
  };
  
  // Current inspection text (last click result)
  currentInspectionText: string;
  
  // Lock input states
  lockInputs: {
    cellDrawer: string;
    cellDoor: string;
    deskDrawer: string;
    finalDoor: string;
  };
  
  // Game metadata
  gameSessionId: string | null;
  userId: string | null;
  startTime: string | null;
}
```

### Backend State Model (JPA Entity)

```java
@Entity
public class GameSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private User user;
    
    private String currentStage; // "CELL", "DESK", "ESCAPED"
    
    // Inventory flags
    private Boolean hasRod = false;
    private Boolean hasDeskKey = false;
    
    // Puzzle flags
    private Boolean cellDrawerUnlocked = false;
    private Boolean cellDoorUnlocked = false;
    private Boolean deskDrawerUnlocked = false;
    private Boolean finalDoorUnlocked = false;
    
    private LocalDateTime startTime;
    private LocalDateTime lastUpdated;
    
    // Inspection counts (stored as JSON or separate table)
    private String inspectionCounts; // JSON string
}
```

---

## 3. REACT COMPONENT STRUCTURE

### Recommended Component Hierarchy

```
App.jsx
└── GamePage.jsx (main game container)
    ├── StageContainer.jsx (handles stage rendering)
    │   ├── SceneImage.jsx (clickable image, NO visual indicators)
    │   ├── InspectionPanel.jsx (displays inspection text)
    │   └── StageTransition.jsx (handles stage changes)
    ├── LockPanel.jsx (all locks for current stage)
    │   ├── LockInput.jsx (reusable lock component)
    │   └── LockSubmit.jsx (submit button for each lock)
    ├── InventoryPanel.jsx (shows collected items)
    └── GameActions.jsx (item usage, stage actions)
```

### Component Responsibilities

#### `GamePage.jsx`
- Main container and state management
- Communicates with backend API
- Handles stage transitions
- Manages inspection text state

#### `StageContainer.jsx`
- Renders appropriate scene based on `currentStage`
- Handles image selection based on state (e.g., drawer open/closed)
- Manages image layering if needed

#### `SceneImage.jsx`
- **Critical**: Clickable image with `cursor: default` (no pointer)
- **Critical**: No hover effects, no visual feedback
- On click: calls parent handler with stage and click coordinates (optional)
- Displays image based on current state (different images for different states)

#### `InspectionPanel.jsx`
- Simple text display area
- Shows `currentInspectionText` from state
- Scrollable if text is long
- No formatting except basic text styling

#### `LockPanel.jsx`
- Conditionally renders locks based on current stage
- Each lock is independent UI component (input + submit)
- Locks appear/disappear based on puzzle prerequisites

#### `LockInput.jsx`
- Reusable component for numeric/alphabetical locks
- Controlled input component
- Submit button disabled until input matches expected format
- No visual feedback until submission (backend validation)

---

## 4. FRONTEND-BACKEND COMMUNICATION

### API Endpoints Design

#### Game Session Management
```
POST /api/game/session/start
  Request: { userId: string, difficulty?: string }
  Response: { gameSessionId: string, initialState: GameState }

GET /api/game/session/{sessionId}
  Response: { gameState: GameState }

PUT /api/game/session/{sessionId}/state
  Request: { gameState: GameState }
  Response: { success: boolean }
```

#### Inspection Actions
```
POST /api/game/inspect
  Request: { 
    gameSessionId: string,
    stage: string,
    inspectionArea?: string,  // optional: "drawer", "desk", etc.
    clickCoordinates?: { x: number, y: number }  // optional, for future use
  }
  Response: { 
    inspectionText: string,
    updatedState?: GameState  // if inspection changed state
  }
```

#### Lock Validation
```
POST /api/game/validate/cell-drawer
  Request: { gameSessionId: string, answer: string }
  Response: { 
    correct: boolean,
    message: string,  // "Correct!" or "Incorrect. Try again."
    updatedState?: GameState  // if lock opened
  }

POST /api/game/validate/cell-door
POST /api/game/validate/desk-drawer
POST /api/game/validate/final-door
  (Same structure as above)
```

#### Item Usage
```
POST /api/game/use-item
  Request: { 
    gameSessionId: string,
    item: string,  // "rod", "deskKey", etc.
    target?: string  // optional: "drawer", "door", etc.
  }
  Response: { 
    success: boolean,
    message: string,
    updatedState: GameState
  }
```

#### Stage Transition
```
POST /api/game/transition
  Request: { 
    gameSessionId: string,
    targetStage: string
  }
  Response: { 
    success: boolean,
    updatedState: GameState
  }
```

### Request/Response Flow Example

**Example: Player clicks scene image**

1. Frontend: `SceneImage` onClick handler triggered
2. Frontend: Call `POST /api/game/inspect` with sessionId and stage
3. Backend: 
   - Retrieve current game state
   - Determine inspection response based on:
     - Current stage
     - Current state flags
     - Inspection count (for variety)
   - Update inspection count
   - Return appropriate text
4. Frontend: Update `currentInspectionText` state, display in `InspectionPanel`

**Example: Player submits lock answer**

1. Frontend: `LockInput` submit handler
2. Frontend: Call `POST /api/game/validate/{lock-name}` with sessionId and answer
3. Backend:
   - Validate answer (check prerequisites first!)
   - If correct: Update puzzle flag, check for stage transitions
   - Return result with updated state
4. Frontend: 
   - If correct: Update local state, clear input, show success message
   - If incorrect: Show error, keep input for retry

---

## 5. STEP-BY-STEP IMPLEMENTATION PLAN

### Phase 1: Backend Foundation (Week 1)

#### Step 1.1: Create Game Session Entity & Repository
- [ ] Create `GameSession.java` entity with all state fields
- [ ] Create `GameSessionRepository.java` extending JpaRepository
- [ ] Add database migration/update scripts if using Flyway/Liquibase

#### Step 1.2: Create Game Service Layer
- [ ] Create `GameSessionService.java`
  - Methods: `startNewSession()`, `getSession()`, `updateSession()`
  - Validation logic for state transitions
- [ ] Create `InspectionService.java`
  - Method: `getInspectionText(sessionId, stage, area)`
  - Logic to determine text based on state
- [ ] Create `LockValidationService.java`
  - Methods: `validateCellDrawer()`, `validateCellDoor()`, etc.
  - **Critical**: Enforce prerequisites (can't unlock door without drawer, etc.)
  - Return appropriate success/failure messages

#### Step 1.3: Create Game Controller
- [ ] Create `GameController.java`
- [ ] Implement all endpoints listed in Section 4
- [ ] Add proper error handling and validation
- [ ] Use DTOs for request/response (create `GameStateDTO`, `InspectionRequestDTO`, etc.)

#### Step 1.4: Create Inspection Text Repository
- [ ] Create `InspectionText.java` entity (or use JSON file/constants)
  - Fields: `stage`, `stateConditions` (JSON), `text`, `priority`
- [ ] Populate with initial inspection texts for CELL stage
- [ ] Design logic: Matching state conditions to return appropriate text

**Recommendation**: Store inspection texts in database for easy updates, or use a configuration class if texts are static.

### Phase 2: Frontend State Management (Week 1-2)

#### Step 2.1: Create Game Context
- [ ] Create `contexts/GameContext.jsx`
- [ ] Define `GameState` interface/type (TypeScript if using, or PropTypes)
- [ ] Create `GameProvider` component
- [ ] Implement state management with `useReducer` or `useState`
- [ ] Expose context methods: `updateState`, `inspectScene`, `submitLock`, `useItem`

#### Step 2.2: Create API Service Layer
- [ ] Update `services/api.js` (or create `services/gameAPI.js`)
- [ ] Implement all API calls from Section 4
- [ ] Handle errors gracefully
- [ ] Add loading states

#### Step 2.3: Create Basic Component Structure
- [ ] Refactor `GamePage.jsx` to use new state management
- [ ] Create placeholder components: `StageContainer`, `SceneImage`, `InspectionPanel`, `LockPanel`
- [ ] Wire up basic rendering (no functionality yet)

### Phase 3: Scene & Inspection System (Week 2)

#### Step 3.1: Implement SceneImage Component
- [ ] **Critical**: Set `cursor: default` (no pointer)
- [ ] **Critical**: Remove all hover effects
- [ ] Implement onClick handler that calls inspection API
- [ ] Display image based on state (e.g., `cell-scene-closed-drawer.png` vs `cell-scene-open-drawer.png`)
- [ ] Test: Clicking should not show any visual feedback except text in InspectionPanel

#### Step 3.2: Implement InspectionPanel Component
- [ ] Simple scrollable text area
- [ ] Display `currentInspectionText` from state
- [ ] Style appropriately (readable, but not distracting)
- [ ] Clear old text when new inspection occurs

#### Step 3.3: Implement Backend Inspection Logic
- [ ] Create inspection text mapping for CELL stage
- [ ] Implement state-based text selection
- [ ] Add variety: Same click can return different texts based on inspection count
- [ ] Include both useful clues and flavor text (indistinguishable)

#### Step 3.4: Test Inspection Flow
- [ ] Click scene multiple times, verify varied responses
- [ ] Verify no visual indicators
- [ ] Verify state changes affect inspection text

### Phase 4: Lock System (Week 2-3)

#### Step 4.1: Create LockInput Component
- [ ] Reusable component accepting: `lockId`, `label`, `type` (numeric/alphabetical), `maxLength`
- [ ] Controlled input with validation
- [ ] Submit button (disabled if input invalid)
- [ ] Loading state during API call
- [ ] Success/error message display

#### Step 4.2: Create LockPanel Component
- [ ] Conditionally render locks based on stage and prerequisites
- [ ] For CELL stage: Show `cellDrawerLock` and `cellDoorLock` (if drawer unlocked)
- [ ] For DESK stage: Show `deskDrawerLock` and `finalDoorLock`
- [ ] Handle lock visibility based on state

#### Step 4.3: Implement Backend Lock Validation
- [ ] Implement validation for each lock type
- [ ] **Critical**: Check prerequisites before validating answer
  - Example: `cellDoorLock` requires `cellDrawerUnlocked === true`
- [ ] Store correct answers securely (not in frontend)
- [ ] Implement rate limiting to prevent brute force

#### Step 4.4: Handle Lock Success
- [ ] Update puzzle flags in database
- [ ] Check for automatic state changes (e.g., unlocking cell door → transition to DESK)
- [ ] Return updated state to frontend
- [ ] Frontend updates UI accordingly

### Phase 5: Inventory & Item Usage (Week 3)

#### Step 5.1: Create InventoryPanel Component
- [ ] Display collected items (icons or text)
- [ ] Show items only if `inventory.hasX === true`
- [ ] Optional: Allow clicking items to use them (with confirmation)

#### Step 5.2: Implement Item Usage Logic (Backend)
- [ ] Create `use-item` endpoint
- [ ] Validate item exists in inventory
- [ ] Check if item can be used in current context
- [ ] Update state (e.g., using rod → retrieve key from outside bars)
- [ ] Return success message and updated state

#### Step 5.3: Integrate Item Usage in Frontend
- [ ] Add "Use Item" UI (button or click on inventory item)
- [ ] Call API on item usage
- [ ] Update state and re-render scene if needed

### Phase 6: Stage Transitions (Week 3-4)

#### Step 6.1: Implement Stage Transition Logic (Backend)
- [ ] Validate prerequisites for stage transition
  - CELL → DESK: Requires `cellDoorUnlocked === true`
  - DESK → ESCAPED: Requires `finalDoorUnlocked === true`
- [ ] Update `currentStage` in database
- [ ] Reset stage-specific inspection counts if needed
- [ ] Return updated state

#### Step 6.2: Implement StageTransition Component
- [ ] Detect stage change from state
- [ ] Show transition animation/message (optional, keep minimal)
- [ ] Update scene image automatically
- [ ] Clear inspection text
- [ ] Show new stage's locks

#### Step 6.3: Add Stage-Specific Content
- [ ] Create DESK stage scene images
- [ ] Add DESK stage inspection texts
- [ ] Implement DESK stage lock validations
- [ ] Test full progression: CELL → DESK → ESCAPED

### Phase 7: Polish & Testing (Week 4)

#### Step 7.1: Add Game Session Persistence
- [ ] Save game state periodically (on state changes)
- [ ] Implement "Resume Game" functionality
- [ ] Test session persistence across page refreshes

#### Step 7.2: Error Handling & Edge Cases
- [ ] Handle network errors gracefully
- [ ] Prevent duplicate submissions
- [ ] Handle concurrent state updates
- [ ] Validate all user inputs

#### Step 7.3: Content Creation
- [ ] Write all inspection texts for both stages
- [ ] Design lock answers and clue sequences
- [ ] Test full game flow for logical consistency
- [ ] Ensure clues are fair but challenging

#### Step 7.4: UI/UX Polish
- [ ] Ensure no visual indicators (cursor, hover) anywhere
- [ ] Style inspection panel appropriately
- [ ] Make locks visually distinct but not distracting
- [ ] Test responsiveness (mobile/tablet if applicable)

---

## 6. STATE-DRIVEN INSPECTION TEXT LOGIC

### Example: Cell Scene Inspection Logic

```javascript
// Backend pseudocode
function getInspectionText(session, stage, area) {
  if (stage === 'CELL') {
    const count = session.inspectionCounts.cellScene || 0;
    
    // First few clicks: General observations (flavor text)
    if (count < 3) {
      return getRandomFlavorText([
        "The cell is dimly lit. Stone walls surround you.",
        "You notice the bars are sturdy, made of iron.",
        "There's a small window, too high to reach.",
      ]);
    }
    
    // After 3 clicks: Start hinting at drawer (if not unlocked)
    if (!session.puzzles.cellDrawerUnlocked && count === 3) {
      return "There's a small drawer in the corner, but it's locked.";
    }
    
    // If drawer unlocked but rod not found: Hint at rod
    if (session.puzzles.cellDrawerUnlocked && !session.inventory.hasRod) {
      return "The drawer is open. Inside, you see a metal rod, about a foot long.";
    }
    
    // If rod found but not used: Hint at using it
    if (session.inventory.hasRod && count > 5) {
      return "Through the bars, you can see a key on the deputy's desk, just out of reach.";
    }
    
    // After using rod: Update state, return success message
    if (session.inventory.hasDeskKey) {
      return "You successfully retrieved the key using the rod. It might unlock something.";
    }
    
    // Default: Return varied flavor text
    return getRandomFlavorText([...]);
  }
}
```

**Key Principles:**
- Early clicks return flavor text (no useful information)
- Useful clues appear after prerequisite state changes
- Same click location can return different text based on state
- No visual distinction between flavor and clue text

---

## 7. COMMON PITFALLS TO AVOID

### ❌ Pitfall 1: Visual Indicators
**Problem**: Adding cursor changes, hover effects, or highlighted areas
**Solution**: 
- Always use `cursor: default` on clickable images
- Never add `:hover` styles that reveal clickability
- Test in browser DevTools to ensure no pointer cursor

### ❌ Pitfall 2: Frontend-Only Validation
**Problem**: Storing correct answers in frontend or validating only on client
**Solution**: 
- All validation must happen on backend
- Never send correct answers to frontend
- Use session-based validation (backend tracks state)

### ❌ Pitfall 3: Skipping Prerequisites
**Problem**: Allowing players to solve locks out of order
**Solution**: 
- Always check prerequisites in backend validation
- Example: `cellDoorLock` validation should fail if `cellDrawerUnlocked === false`
- Return appropriate error messages without revealing the prerequisite

### ❌ Pitfall 4: Predictable Inspection Text
**Problem**: Same click always returns same text, making it obvious what's important
**Solution**: 
- Use inspection count to vary responses
- Include multiple flavor text options
- Make clue text blend with flavor text

### ❌ Pitfall 5: State Inconsistency
**Problem**: Frontend and backend state get out of sync
**Solution**: 
- Always update state from backend response
- Never mutate state optimistically (only after API confirms)
- Implement periodic state sync if needed

### ❌ Pitfall 6: Over-Engineering
**Problem**: Adding animations, canvas, drag-and-drop, WebSockets
**Solution**: 
- Keep it simple: images, text, inputs, buttons
- Use REST API, not WebSockets
- Minimal animations (only if necessary for UX)

### ❌ Pitfall 7: Hidden Clues in Images
**Problem**: Requiring players to notice tiny details in images to solve puzzles
**Solution**: 
- All essential clues should be in inspection text
- Images are atmosphere, not puzzle components
- Locks are separate UI elements, never embedded in images

### ❌ Pitfall 8: No Rate Limiting
**Problem**: Players can brute-force locks or spam inspection
**Solution**: 
- Implement rate limiting on lock validation endpoints
- Consider cooldown between inspection clicks (optional, but recommended)
- Log suspicious activity

### ❌ Pitfall 9: Revealing Too Much in Error Messages
**Problem**: Error messages reveal puzzle structure
**Solution**: 
- Generic messages: "Incorrect. Try again." (not "This lock requires the drawer to be unlocked first")
- Don't reveal what locks exist until prerequisites are met
- Don't reveal answer format hints

### ❌ Pitfall 10: Not Testing State Transitions
**Problem**: Bugs in stage transitions or state updates
**Solution**: 
- Write unit tests for state transition logic
- Test all possible state combinations
- Test edge cases (rapid clicking, network errors, etc.)

---

## 8. EXPANDABILITY FOR FUTURE ROOMS

### Design for Multiple Rooms

1. **Stage Enum Extension**
   - Current: `'CELL' | 'DESK' | 'ESCAPED'`
   - Future: Add `'WAREHOUSE' | 'OFFICE' | 'BASEMENT' | ...`

2. **Modular Inspection System**
   - Store inspection texts in database with room/stage mapping
   - Backend service automatically selects based on current stage

3. **Configurable Locks**
   - Lock definitions stored in database or config
   - Frontend dynamically renders locks based on stage configuration

4. **Room Progression System**
   - Add `roomId` to GameSession
   - Track room completion separately
   - Allow multiple rooms in one game session

5. **Shared Inventory**
   - Items can carry across rooms (if design requires)
   - Or reset inventory per room (simpler)

---

## 9. TESTING STRATEGY

### Unit Tests (Backend)
- [ ] Test lock validation logic with all prerequisite combinations
- [ ] Test inspection text selection based on state
- [ ] Test state transition validation
- [ ] Test item usage logic

### Integration Tests (Backend)
- [ ] Test full game flow: Start → Inspect → Unlock → Transition
- [ ] Test concurrent state updates
- [ ] Test session persistence

### Frontend Tests
- [ ] Test component rendering based on state
- [ ] Test API integration (mock API responses)
- [ ] Test state updates from API responses

### Manual Testing Checklist
- [ ] Complete game flow: CELL → DESK → ESCAPED
- [ ] Verify no visual indicators on scene image
- [ ] Verify inspection text variety
- [ ] Verify prerequisite enforcement (try to skip steps)
- [ ] Test error handling (network errors, invalid inputs)
- [ ] Test session persistence (refresh page, resume game)
- [ ] Test on different browsers/devices

---

## 10. RECOMMENDED FILE STRUCTURE

### Frontend
```
src/
├── components/
│   ├── game/
│   │   ├── GamePage.jsx
│   │   ├── StageContainer.jsx
│   │   ├── SceneImage.jsx
│   │   ├── InspectionPanel.jsx
│   │   ├── LockPanel.jsx
│   │   ├── LockInput.jsx
│   │   ├── InventoryPanel.jsx
│   │   └── GameActions.jsx
│   └── ... (existing auth components)
├── contexts/
│   └── GameContext.jsx
├── services/
│   ├── api.js (update existing)
│   └── gameAPI.js (new)
├── constants/
│   ├── colors.js (existing)
│   ├── fonts.js (existing)
│   └── text.js (update with game text)
└── utils/
    └── gameStateHelpers.js (utility functions)
```

### Backend
```
src/main/java/com/escaperoom/backend/
├── controller/
│   ├── GameController.java (new)
│   └── ... (existing controllers)
├── service/
│   ├── GameSessionService.java (new)
│   ├── InspectionService.java (new)
│   ├── LockValidationService.java (new)
│   └── ... (existing services)
├── model/
│   ├── GameSession.java (new)
│   ├── InspectionText.java (new, optional)
│   └── ... (existing models)
├── dto/
│   ├── GameStateDTO.java (new)
│   ├── InspectionRequestDTO.java (new)
│   ├── LockValidationRequestDTO.java (new)
│   └── ... (existing DTOs)
└── repo/
    ├── GameSessionRepository.java (new)
    └── ... (existing repos)
```

---

## 11. NEXT STEPS

1. **Review this plan** and adjust based on your specific requirements
2. **Set up database schema** for GameSession entity
3. **Create backend entities and repositories** (Phase 1.1)
4. **Implement basic inspection system** to test the concept (Phase 3)
5. **Iterate and refine** based on playtesting

---

## Questions to Consider

- **Session Management**: Should games auto-save, or require explicit save?
- **Multiplayer**: Will there be multiplayer features? (affects state management)
- **Difficulty Levels**: How do they affect the game? (time limits, fewer clues, harder answers?)
- **Hints System**: Do you want a hint system, or pure exploration?
- **Analytics**: Track player actions for game design improvement?

---

**This plan is designed to be implemented incrementally. Start with Phase 1 (backend foundation) and work through each phase, testing as you go.**
