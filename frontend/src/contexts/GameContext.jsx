import { createContext, useContext, useState, useCallback } from 'react';
import { escapeRoomGameAPI } from '../services/api';

const GameContext = createContext(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children, userId }) => {
  const [gameState, setGameState] = useState(null);
  const [currentInspectionText, setCurrentInspectionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize game session
  const startGame = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const initialState = await escapeRoomGameAPI.startGameSession(userId);
      setGameState(initialState);
      setCurrentInspectionText('');
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load existing game session
  const loadGame = useCallback(async (sessionId) => {
    if (!userId || !sessionId) {
      setError('User ID and session ID are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const state = await escapeRoomGameAPI.getGameSession(sessionId, userId);
      if (state) {
        setGameState(state);
        setCurrentInspectionText('');
      } else {
        setError('Game session not found');
      }
    } catch (err) {
      console.error('Error loading game:', err);
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load latest game session
  const loadLatestGame = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const state = await escapeRoomGameAPI.getLatestGameSession(userId);
      if (state) {
        setGameState(state);
        setCurrentInspectionText('');
      } else {
        setError('No saved game found');
      }
    } catch (err) {
      console.error('Error loading latest game:', err);
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Inspect scene
  const inspectScene = useCallback(async (stage, inspectionArea = null) => {
    if (!gameState?.gameSessionId) {
      setError('Game session not initialized');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await escapeRoomGameAPI.inspectScene(
        gameState.gameSessionId,
        stage,
        inspectionArea
      );
      
      setCurrentInspectionText(response.inspectionText || '');
      
      if (response.updatedState) {
        setGameState(response.updatedState);
      }
    } catch (err) {
      console.error('Error inspecting scene:', err);
      setError('Failed to inspect scene');
    } finally {
      setLoading(false);
    }
  }, [gameState]);

  // Validate lock
  const validateLock = useCallback(async (lockType, answer) => {
    if (!gameState?.gameSessionId) {
      setError('Game session not initialized');
      return { correct: false, message: 'Game session not initialized' };
    }

    try {
      setLoading(true);
      setError('');
      const response = await escapeRoomGameAPI.validateLock(
        lockType,
        gameState.gameSessionId,
        answer
      );
      
      if (response.updatedState) {
        setGameState(response.updatedState);
      }
      
      return {
        correct: response.correct || false,
        message: response.message || (response.correct ? 'Correct!' : 'Incorrect. Try again.'),
      };
    } catch (err) {
      console.error('Error validating lock:', err);
      setError('Failed to validate lock');
      return { correct: false, message: 'Failed to validate lock' };
    } finally {
      setLoading(false);
    }
  }, [gameState]);

  // Use item
  const useItem = useCallback(async (item, target = null) => {
    if (!gameState?.gameSessionId) {
      setError('Game session not initialized');
      return false;
    }

    try {
      setLoading(true);
      setError('');
      const response = await escapeRoomGameAPI.useItem(
        gameState.gameSessionId,
        item,
        target
      );
      
      setCurrentInspectionText(response.inspectionText || '');
      
      if (response.updatedState) {
        setGameState(response.updatedState);
      }
      
      return true;
    } catch (err) {
      console.error('Error using item:', err);
      setError('Failed to use item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [gameState]);

  // Clear error
  const clearError = useCallback(() => {
    setError('');
  }, []);

  const value = {
    gameState,
    currentInspectionText,
    loading,
    error,
    startGame,
    loadGame,
    loadLatestGame,
    inspectScene,
    validateLock,
    useItem,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
