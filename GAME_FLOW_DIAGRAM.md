# Escape Room Game Flow Diagram

## Visual Game Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         GAME PAGE                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    STAGE CONTAINER                         │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              SCENE IMAGE (Clickable)                 │  │  │
│  │  │  • cursor: default (NO pointer)                      │  │  │
│  │  │  • NO hover effects                                  │  │  │
│  │  │  • Click → POST /api/game/inspect                    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │          INSPECTION PANEL (Text Display)             │  │  │
│  │  │  • Shows currentInspectionText from state            │  │  │
│  │  │  • Scrollable text area                              │  │  │
│  │  │  • No formatting, just text                          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    LOCK PANEL                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │ Lock: Drawer │  │ Lock: Door   │  │ Lock: Final  │    │  │
│  │  │ [____] [OK]  │  │ [____] [OK]  │  │ [____] [OK]  │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │  • Only show locks for current stage                      │  │
│  │  • Only show if prerequisites met                         │  │
│  │  • Submit → POST /api/game/validate/{lock-name}           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 INVENTORY PANEL                            │  │
│  │  Items: [Rod] [Key]                                        │  │
│  │  • Show only if inventory.hasX === true                    │  │
│  │  • Optional: Click to use item                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## State-Driven Progression Example

### Stage 1: CELL

**Initial State:**
```javascript
{
  currentStage: 'CELL',
  inventory: { hasRod: false, hasDeskKey: false },
  puzzles: { 
    cellDrawerUnlocked: false,
    cellDoorUnlocked: false,
    ...
  }
}
```

**Player Actions Flow:**

1. **Click Scene (First Time)**
   - Backend: Returns flavor text (e.g., "The cell is dimly lit...")
   - State: `inspectionCount.cellScene++`
   - UI: Shows text in InspectionPanel

2. **Click Scene (3rd Time)**
   - Backend: Detects count === 3, returns hint about drawer
   - UI: Shows "There's a small drawer in the corner, but it's locked."

3. **Player Solves Drawer Lock**
   - Frontend: POST `/api/game/validate/cell-drawer` with answer
   - Backend: Validates answer → Updates `cellDrawerUnlocked = true`
   - State: Drawer unlocked, scene image changes to show open drawer
   - UI: Drawer lock shows as solved, new locks may appear

4. **Player Clicks Scene Again (After Drawer Unlocked)**
   - Backend: Detects `cellDrawerUnlocked === true` and `hasRod === false`
   - Backend: Returns "The drawer is open. Inside, you see a metal rod."
   - State: `inventory.hasRod = true` (or requires separate "use" action)
   - UI: InventoryPanel shows "Rod" item

5. **Player Uses Rod**
   - Frontend: POST `/api/game/use-item` with item="rod"
   - Backend: Validates rod can be used (in CELL stage, outside bars visible)
   - Backend: Updates `inventory.hasDeskKey = true`
   - State: Key acquired
   - UI: InventoryPanel shows "Key" item

6. **Player Solves Cell Door Lock**
   - Frontend: POST `/api/game/validate/cell-door` with answer
   - Backend: Validates answer AND checks `cellDrawerUnlocked === true`
   - Backend: Updates `cellDoorUnlocked = true`, checks for stage transition
   - Backend: Detects all CELL prerequisites met → Transitions to DESK
   - State: `currentStage = 'DESK'`
   - UI: StageContainer switches to DESK scene, new locks appear

### Stage 2: DESK

**New State:**
```javascript
{
  currentStage: 'DESK',
  inventory: { hasRod: true, hasDeskKey: true },
  puzzles: { 
    cellDrawerUnlocked: true,
    cellDoorUnlocked: true,
    deskDrawerUnlocked: false,
    finalDoorUnlocked: false
  }
}
```

**Player Actions Continue...**
- Similar flow but with DESK-specific content
- Final door unlock → Stage transitions to 'ESCAPED'

## API Request/Response Flow

### Inspection Click
```
Frontend                    Backend                      Database
   │                           │                             │
   │── POST /inspect ──────────>│                             │
   │   {sessionId, stage}      │── Get GameSession ──────────>│
   │                           │<── GameSession ──────────────│
   │                           │                             │
   │                           │── Determine Text ────────────│
   │                           │   (based on state)           │
   │                           │                             │
   │                           │── Update Inspection Count ──>│
   │<── {text, updatedState} ──│                             │
   │                           │                             │
   │── Update UI               │                             │
```

### Lock Validation
```
Frontend                    Backend                      Database
   │                           │                             │
   │── POST /validate/lock ────>│                             │
   │   {sessionId, answer}     │── Get GameSession ──────────>│
   │                           │<── GameSession ──────────────│
   │                           │                             │
   │                           │── Check Prerequisites        │
   │                           │── Validate Answer            │
   │                           │                             │
   │                           │── Update State ─────────────>│
   │                           │── Check Stage Transition     │
   │<── {correct, updatedState}│                             │
   │                           │                             │
   │── Update UI               │                             │
```

## Key Design Points

1. **No Visual Feedback on Scene Click**
   - Scene image looks static
   - No cursor change
   - No hover effect
   - Only feedback is text appearing in InspectionPanel

2. **State Determines Everything**
   - Which image to show (drawer open/closed)
   - Which locks are visible
   - What inspection text to return
   - Whether stage can transition

3. **Backend is Source of Truth**
   - Frontend state is derived from backend responses
   - All validation happens on backend
   - Frontend never decides game logic

4. **Sequencing is Enforced**
   - Can't unlock door without drawer
   - Can't use rod until drawer unlocked
   - Can't transition stage without completing prerequisites
