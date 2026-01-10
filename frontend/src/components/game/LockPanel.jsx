import { useGame } from '../../contexts/GameContext';
import { text } from '../../constants/text';
import LockInput from './LockInput';
import './LockPanel.css';

const LockPanel = () => {
  const { gameState } = useGame();

  if (!gameState) {
    return null;
  }

  const currentStage = gameState.currentStage;

  // Determine which locks to show based on current stage and prerequisites
  const getVisibleLocks = () => {
    const locks = [];

    if (currentStage === 'CELL') {
      // Cell drawer lock - always visible in CELL stage
      locks.push({
        type: 'cell-drawer',
        label: text.cellDrawerLock,
        maxLength: 10,
      });

      // Cell door lock - only visible if drawer is unlocked
      if (gameState.cellDrawerUnlocked) {
        locks.push({
          type: 'cell-door',
          label: text.cellDoorLock,
          maxLength: 10,
        });
      }
    } else if (currentStage === 'DESK') {
      // Desk drawer lock - always visible in DESK stage
      locks.push({
        type: 'desk-drawer',
        label: text.deskDrawerLock,
        maxLength: 10,
      });

      // Final door lock - only visible if desk drawer is unlocked
      if (gameState.deskDrawerUnlocked) {
        locks.push({
          type: 'final-door',
          label: text.finalDoorLock,
          maxLength: 10,
        });
      }
    }

    return locks;
  };

  const visibleLocks = getVisibleLocks();

  if (visibleLocks.length === 0) {
    return null;
  }

  return (
    <div className="lock-panel">
      <h3 className="lock-panel-header">{text.lockLabel}s</h3>
      <div className="locks-list">
        {visibleLocks.map((lock) => (
          <LockInput
            key={lock.type}
            lockType={lock.type}
            lockLabel={lock.label}
            maxLength={lock.maxLength}
          />
        ))}
      </div>
    </div>
  );
};

export default LockPanel;
