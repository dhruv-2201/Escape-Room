import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameProvider, useGame } from '../contexts/GameContext';
import { text } from '../constants/text';
import StageContainer from './game/StageContainer';
import './GamePage.css';

const GamePageContent = ({ onLogout, userId }) => {
  const { gameState, loading, error, startGame, loadLatestGame, clearError } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleStartNewGame = async () => {
    await startGame();
  };

  const handleResumeGame = async () => {
    await loadLatestGame();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/');
    }
  };

  // Initial state - show game initialization buttons
  if (!gameState && !loading) {
    return (
      <div className="game-container">
        <div className="game-initialization">
          <h2>Welcome to the Escape Room</h2>
          <div className="game-init-buttons">
            <button 
              onClick={handleStartNewGame} 
              className="init-button start-new-game-btn"
              disabled={loading}
            >
              {text.startNewGame}
            </button>
            <button 
              onClick={handleResumeGame} 
              className="init-button recall-progress-btn"
              disabled={loading}
            >
              {text.recallOldProgress}
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button onClick={handleLogout} className="logout-button">
            {text.logout}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !gameState) {
    return (
      <div className="game-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>{text.loading}</p>
        </div>
      </div>
    );
  }

  // Game playing state
  if (gameState) {
    // Check if escaped
    if (gameState.currentStage === 'ESCAPED') {
      return (
        <div className="game-container">
          <div className="victory-screen">
            <h1>{text.congratulations}</h1>
            <p>{text.escapedMessage}</p>
            <div className="victory-buttons">
              <button onClick={handleStartNewGame} className="victory-button">
                Play Again
              </button>
              <button onClick={handleLogout} className="victory-button">
                {text.logout}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Active game state
    return (
      <div className="game-container">
        <div className="game-header">
          <div className="game-stage-indicator">
            <h2>Stage: {gameState.currentStage}</h2>
          </div>
          <button onClick={handleLogout} className="logout-button">
            {text.logout}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
            <button onClick={clearError} className="error-dismiss">×</button>
          </div>
        )}
        
        <StageContainer />
      </div>
    );
  }

  return null;
};

const GamePage = ({ onLogout, userId, userEmail }) => {
  return (
    <GameProvider userId={userId}>
      <GamePageContent onLogout={onLogout} userId={userId} />
    </GameProvider>
  );
};

export default GamePage;
