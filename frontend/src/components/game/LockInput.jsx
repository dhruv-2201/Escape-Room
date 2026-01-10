import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { text } from '../../constants/text';
import './LockInput.css';

const LockInput = ({ lockType, lockLabel, maxLength = 10 }) => {
  const { gameState, validateLock } = useGame();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const isUnlocked = () => {
    if (!gameState) return false;
    
    switch (lockType) {
      case 'cell-drawer':
        return gameState.cellDrawerUnlocked === true;
      case 'cell-door':
        return gameState.cellDoorUnlocked === true;
      case 'desk-drawer':
        return gameState.deskDrawerUnlocked === true;
      case 'final-door':
        return gameState.finalDoorUnlocked === true;
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answer.trim() || isUnlocked() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setShowMessage(false);

    try {
      const result = await validateLock(lockType, answer.trim());
      
      setMessage(result.message || (result.correct ? text.lockCorrect : text.lockIncorrect));
      setShowMessage(true);
      
      if (result.correct) {
        setAnswer('');
        setTimeout(() => {
          setShowMessage(false);
        }, 2000);
      } else {
        setTimeout(() => {
          setShowMessage(false);
        }, 3000);
      }
    } catch (error) {
      setMessage(text.lockValidationError);
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUnlocked()) {
    return (
      <div className="lock-input-container lock-unlocked">
        <div className="lock-label">{lockLabel}</div>
        <div className="lock-status">🔓 Unlocked</div>
      </div>
    );
  }

  return (
    <div className="lock-input-container">
      <div className="lock-label">{lockLabel}</div>
      <form onSubmit={handleSubmit} className="lock-form">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.slice(0, maxLength))}
          placeholder="Enter code..."
          className="lock-input"
          maxLength={maxLength}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="lock-submit-button"
          disabled={!answer.trim() || isSubmitting}
        >
          {text.submitLock}
        </button>
      </form>
      {showMessage && (
        <div className={`lock-message ${message.includes('Correct') ? 'lock-message-success' : 'lock-message-error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LockInput;
