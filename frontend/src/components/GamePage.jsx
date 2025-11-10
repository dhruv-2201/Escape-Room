import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { text } from '../constants/text';
import { questionsAPI, gameAPI } from '../services/api';
import './GamePage.css';

const GamePage = () => {
  // Game state management
  const [gameState, setGameState] = useState('initial'); // 'initial', 'selecting-difficulty', 'loading', 'playing', 'completed'
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [gameSession, setGameSession] = useState(null);
  
  // Question state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [unlockedLocks, setUnlockedLocks] = useState(new Set());
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(0);
  const timerIntervalRef = useRef(null);
  const questionsLengthRef = useRef(0);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // Update questions length ref
  useEffect(() => {
    questionsLengthRef.current = questions.length;
  }, [questions.length]);

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && timePerQuestion > 0 && questions.length > 0 && questions[currentQuestionIndex]) {
      // Reset timer when question changes
      setTimeRemaining(timePerQuestion);
      
      // Clear existing interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      // Start new timer
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - clear interval and handle timeout
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
            setError(text.questionTimeout);
            setTimeout(() => {
              setError('');
              setCurrentQuestionIndex((prevIndex) => {
                if (prevIndex < questionsLengthRef.current - 1) {
                  return prevIndex + 1;
                }
                return prevIndex;
              });
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [gameState, currentQuestionIndex, timePerQuestion, questions]);

  // Save progress when game state changes
  useEffect(() => {
    if (gameState === 'playing' && gameSession && questions.length > 0) {
      const progress = {
        gameSession,
        questions,
        currentQuestionIndex,
        userAnswers,
        unlockedLocks: Array.from(unlockedLocks),
        selectedDifficulty,
        timePerQuestion,
      };
      gameAPI.saveProgress(progress);
    }
  }, [gameState, currentQuestionIndex, userAnswers, unlockedLocks]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const allLocksUnlocked = unlockedLocks.size === totalQuestions;

  // Handle starting new game
  const handleStartNewGame = async () => {
    try {
      setIsLoading(true);
      setError('');
      const levels = await gameAPI.getDifficultyLevels();
      setDifficultyLevels(levels);
      setGameState('selecting-difficulty');
    } catch (err) {
      console.error('Error fetching difficulty levels:', err);
      setError(text.somethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle difficulty selection
  const handleDifficultySelect = async (difficulty) => {
    try {
      setIsLoading(true);
      setError('');
      setSelectedDifficulty(difficulty);
      
      // Start new game session
      const session = await gameAPI.startNewGame(difficulty);
      setGameSession(session);
      
      // Fetch questions
      const questionsData = await questionsAPI.getQuestions();
      setQuestions(questionsData);
      
      // Set time per question based on difficulty
      setTimePerQuestion(difficulty.timePerQuestion);
      setTimeRemaining(difficulty.timePerQuestion);
      
      // Initialize game state
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setUnlockedLocks(new Set());
      
      setGameState('playing');
    } catch (err) {
      console.error('Error starting game:', err);
      setError(text.somethingWentWrong);
      setGameState('initial');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle recalling progress
  const handleRecallProgress = async () => {
    try {
      setIsLoading(true);
      setError('');
      const progress = await gameAPI.recallProgress();
      
      // Restore game state
      setGameSession(progress.gameSession);
      setQuestions(progress.questions);
      setCurrentQuestionIndex(progress.currentQuestionIndex);
      setUserAnswers(progress.userAnswers);
      setUnlockedLocks(new Set(progress.unlockedLocks));
      setSelectedDifficulty(progress.selectedDifficulty);
      setTimePerQuestion(progress.timePerQuestion);
      setTimeRemaining(progress.timePerQuestion);
      
      setGameState('playing');
    } catch (err) {
      console.error('Error recalling progress:', err);
      setError(text.noProgressFound);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = async (answer) => {
    if (!currentQuestion) return;

    // Clear timer interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    try {
      const result = await questionsAPI.checkAnswer(currentQuestion.id, answer);
      
      if (result.correct) {
        setUnlockedLocks(prev => new Set([...prev, currentQuestionIndex]));
        setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          if (!isLastQuestion) {
            setCurrentQuestionIndex(prev => prev + 1);
          } else {
            setGameState('completed');
          }
        }, 1500);
      } else {
        setError(text.incorrectAnswer);
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error checking answer:', err);
      setError(text.somethingWentWrong);
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleLogout = () => {
    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    navigate('/');
  };

  const handleBackToInitial = () => {
    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setGameState('initial');
    setError('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setUnlockedLocks(new Set());
    setSelectedDifficulty(null);
    setGameSession(null);
    setTimeRemaining(0);
    setTimePerQuestion(0);
  };

  // Initial state - show game initialization buttons
  if (gameState === 'initial') {
    return (
      <div className="game-container">
        <div className="game-initialization">
          <h2>Welcome to the Escape Room</h2>
          <div className="game-init-buttons">
            <button 
              onClick={handleStartNewGame} 
              className="init-button start-new-game-btn"
              disabled={isLoading}
            >
              {text.startNewGame}
            </button>
            <button 
              onClick={handleRecallProgress} 
              className="init-button recall-progress-btn"
              disabled={isLoading}
            >
              {text.recallOldProgress}
            </button>
          </div>
          {isLoading && <p className="loading-text">{text.loading}</p>}
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    );
  }

  // Difficulty selection state
  if (gameState === 'selecting-difficulty') {
    return (
      <div className="game-container">
        <div className="difficulty-selection">
          <h2>{text.selectDifficulty}</h2>
          <div className="difficulty-levels">
            {difficultyLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => handleDifficultySelect(level)}
                className="difficulty-button"
                disabled={isLoading}
              >
                <div className="difficulty-name">{level.name}</div>
                <div className="difficulty-time">
                  {text.timePerQuestion}: {level.timePerQuestion} {text.seconds}
                </div>
              </button>
            ))}
          </div>
          {isLoading && <p className="loading-text">{text.startingGame}</p>}
          {error && <p className="error-text">{error}</p>}
          <button onClick={handleBackToInitial} className="back-button">
            Back
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && gameState === 'loading') {
    return (
      <div className="game-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>{text.loading}</p>
        </div>
      </div>
    );
  }

  // Error state (when no questions)
  if (error && !questions.length && gameState === 'playing') {
    return (
      <div className="game-container">
        <div className="error-screen">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackToInitial}>Back to Menu</button>
        </div>
      </div>
    );
  }

  // Victory/completed state
  if (allLocksUnlocked || gameState === 'completed') {
    return (
      <div className="game-container">
        <div className="victory-screen">
          <h1>{text.congratulations}</h1>
          <p>{text.youEscaped}</p>
          <p>{text.allLocksUnlocked}</p>
          <button onClick={handleBackToInitial} className="victory-button">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Playing state - show questions with timer
  return (
    <div className="game-container">
      {/* Timer Display */}
      <div className="timer-container">
        <div className="timer-label">{text.timeRemaining}</div>
        <div className={`timer-display ${timeRemaining <= 10 ? 'timer-warning' : ''}`}>
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
        {timeRemaining === 0 && <div className="time-up-message">{text.timeUp}</div>}
      </div>

      {/* Lock Display */}
      <div className="locks-container">
        <h2>Escape Room Locks</h2>
        <div className="locks-grid">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`lock ${unlockedLocks.has(index) ? 'unlocked' : 'locked'} ${
                index === currentQuestionIndex ? 'active' : ''
              }`}
            >
              <div className="lock-icon">
                {unlockedLocks.has(index) ? '🔓' : '🔒'}
              </div>
              <div className="lock-number">{index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Section */}
      <div className="question-container">
        <div className="question-header">
          <h3>
            {text.questionNumber} {currentQuestionIndex + 1} {text.of} {totalQuestions}
          </h3>
          <div className="question-navigation">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="nav-button"
            >
              {text.previousQuestion}
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={isLastQuestion}
              className="nav-button"
            >
              {text.nextQuestion}
            </button>
          </div>
        </div>

        {currentQuestion && (
          <div className="question-content">
            <h4>{currentQuestion.question}</h4>
            {currentQuestion.options && (
              <div className="options-container">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(option)}
                    className="option-button"
                    disabled={unlockedLocks.has(currentQuestionIndex) || timeRemaining === 0}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            {!currentQuestion.options && (
              <div className="text-answer-container">
                <input
                  type="text"
                  placeholder="Enter your answer..."
                  className="text-answer-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && timeRemaining > 0) {
                      handleAnswerSubmit(e.target.value);
                    }
                  }}
                  disabled={unlockedLocks.has(currentQuestionIndex) || timeRemaining === 0}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('.text-answer-input');
                    if (input && input.value.trim() && timeRemaining > 0) {
                      handleAnswerSubmit(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="submit-answer-button"
                  disabled={unlockedLocks.has(currentQuestionIndex) || timeRemaining === 0}
                >
                  {text.submitAnswer}
                </button>
              </div>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {showSuccess && <div className="success-message">{text.correctAnswer}</div>}
      </div>

      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-button">
        {text.logout}
      </button>
    </div>
  );
};

export default GamePage;
