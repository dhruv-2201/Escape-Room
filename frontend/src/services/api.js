const API_BASE_URL = 'http://localhost:8080/api';

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  createAccount: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/create-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.ok;
  },
};

// Questions API calls
export const questionsAPI = {
  getQuestions: async () => {
    const response = await fetch(`${API_BASE_URL}/questions`);
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to fetch questions');
  },

  checkAnswer: async (questionId, answer) => {
    const response = await fetch(`${API_BASE_URL}/questions/check-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answer }),
    });
    return response.json();
  },
};

// Game API calls (dummy implementations)
export const gameAPI = {
  getDifficultyLevels: async () => {
    // Dummy implementation - return difficulty levels
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'easy', name: 'Easy', timePerQuestion: 120 },
          { id: 'medium', name: 'Medium', timePerQuestion: 90 },
          { id: 'hard', name: 'Hard', timePerQuestion: 60 },
        ]);
      }, 500);
    });
  },

  startNewGame: async (difficulty) => {
    // Dummy implementation - return game session data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          gameId: `game_${Date.now()}`,
          difficulty: difficulty,
          questions: [], // Will be populated by questionsAPI
          startTime: new Date().toISOString(),
        });
      }, 500);
    });
  },

  recallProgress: async () => {
    // Dummy implementation - return saved game progress
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check localStorage for saved progress
        const savedProgress = localStorage.getItem('escapeRoomProgress');
        if (savedProgress) {
          resolve(JSON.parse(savedProgress));
        } else {
          reject(new Error('No saved progress found'));
        }
      }, 500);
    });
  },

  saveProgress: (gameState) => {
    // Save progress to localStorage
    localStorage.setItem('escapeRoomProgress', JSON.stringify(gameState));
  },
};
