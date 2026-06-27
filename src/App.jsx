import React, { useState, useEffect } from 'react';
import './index.css';
import './App.css';

// Components
import Header from './components/Header';
import NavTabs from './components/NavTabs';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import LeaderboardScreen from './components/LeaderboardScreen';

// Services & Utils
import { loadLB, addScore, getPlayerPts, clearLB } from './services/leaderboard';
import { fetchValorantQuizData, shuffle } from './services/valorantApi';

const DIFF = {
  easy: { time: 90, needed: 5, mult: 1.0 },
  medium: { time: 60, needed: 8, mult: 1.5 },
  hard: { time: 30, needed: 10, mult: 2.5 },
};

const PTS_PER_CORRECT = 100;
const PTS_PER_SEC = 5;

export default function App() {
  // Navigation & UI Status
  const [activeTab, setActiveTab] = useState('start');
  const [apiStatus, setApiStatus] = useState('loading');
  const [apiLabel, setApiLabel] = useState('Conectando a valorant-api.com...');
  const [isApiError, setIsApiError] = useState(false);
  const [flashOverlay, setFlashOverlay] = useState(null);

  // Config Pool
  const [questionPool, setQuestionPool] = useState([]);
  const [rankIcons, setRankIcons] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  // Game States
  const [playerTag, setPlayerTag] = useState('');
  const [playerTagError, setPlayerTagError] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverStatus, setGameOverStatus] = useState(null); // 'win' | 'lose'

  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [dotStates, setDotStates] = useState([]);

  // Interactive controls
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Game End metrics
  const [gameResults, setGameResults] = useState({
    basePoints: 0,
    difficultyMultiplier: 1.0,
    totalGained: 0,
    newTotal: 0,
  });

  // Load Initial API Data & Leaderboard
  useEffect(() => {
    async function loadInitialLB() {
      const lb = await loadLB();
      setLeaderboard(lb);
    }
    loadInitialLB();

    async function loadData() {
      const data = await fetchValorantQuizData();
      setQuestionPool(data.questionPool);
      setRankIcons(data.rankIcons);
      setIsApiError(data.isApiError);

      if (data.isApiError) {
        setApiStatus('error');
        setApiLabel(`Sin conexión — ${data.questionPool.length} preguntas de respaldo`);
      } else {
        setApiStatus('ok');
        setApiLabel(`${data.questionPool.length} preguntas cargadas`);
      }
    }
    loadData();
  }, []);

  // Refresh Leaderboard on Tab Change
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      async function refreshLB() {
        const lb = await loadLB();
        setLeaderboard(lb);
      }
      refreshLB();
    }
  }, [activeTab]);

  // Timer Effect
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    if (timeLeft === 0) {
      handleLoseGame();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [isPlaying, isGameOver, timeLeft]);

  // Flash triggers
  const triggerFlash = (type) => {
    setFlashOverlay(type);
    setTimeout(() => {
      setFlashOverlay(null);
    }, 1000);
  };

  // Actions
  const handleStartGame = () => {
    const tag = playerTag.trim();
    if (!tag) {
      setPlayerTagError(true);
      return;
    }
    setPlayerTagError(false);

    const cfg = DIFF[difficulty];
    setIsPlaying(true);
    setIsGameOver(false);
    setGameOverStatus(null);
    setTimeLeft(cfg.time);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentQuestionIndex(0);
    setAnswered(false);
    setSelectedOption(null);
    setFeedback({ text: '', type: '' });

    setDotStates(['current']);

    const shuffled = shuffle(questionPool);
    setGameQuestions(shuffled);
  };

  const handleAnswer = (opt) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(opt);

    const q = gameQuestions[currentQuestionIndex];
    const isCorrect = opt === q.ansVal;
    const cfg = DIFF[difficulty];

    let newScore = score;
    let newCorrect = correctCount;
    let newWrong = wrongCount;

    const nextDotStates = [...dotStates];

    if (isCorrect) {
      newScore = score + PTS_PER_CORRECT;
      setScore(newScore);

      newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);

      nextDotStates[currentQuestionIndex] = 'correct';

      const ptsGained = Math.round(PTS_PER_CORRECT * cfg.mult);
      setFeedback({
        text: `¡Correcto! +${ptsGained} pts`,
        type: 'correct',
      });
    } else {
      newWrong = wrongCount + 1;
      setWrongCount(newWrong);

      nextDotStates[currentQuestionIndex] = 'wrong';

      // Deduct 2 seconds
      setTimeLeft((t) => Math.max(0, t - 2));

      setFeedback({
        text: 'Incorrecto. -2s',
        type: 'wrong',
      });
    }

    nextDotStates[currentQuestionIndex + 1] = 'current';
    setDotStates(nextDotStates);

    // Move to next question after delay (indefinitely until timer runs out)
    setTimeout(() => {
      let nextIndex = currentQuestionIndex + 1;
      if (nextIndex >= gameQuestions.length) {
        const extra = shuffle(questionPool).slice(0, 10);
        setGameQuestions((prev) => [...prev, ...extra]);
      }
      setCurrentQuestionIndex(nextIndex);
      setAnswered(false);
      setSelectedOption(null);
      setFeedback({ text: '', type: '' });
    }, 1100);
  };

  const handleWinGame = async (finalCorrect, finalScore) => {
    const cfg = DIFF[difficulty];
    const timeBonusVal = Math.round(timeLeft * PTS_PER_SEC * cfg.mult);
    const totalGainedVal = finalScore + timeBonusVal;

    const prevPts = await getPlayerPts(playerTag);
    const updatedLB = await addScore(playerTag, totalGainedVal);
    setLeaderboard(updatedLB);

    const newTotalVal = prevPts + totalGainedVal;

    setGameResults({
      basePoints: finalScore,
      timeBonus: timeBonusVal,
      totalGained: totalGainedVal,
      newTotal: newTotalVal,
    });

    triggerFlash('defuse');
    setIsGameOver(true);
    setGameOverStatus('win');
  };

  const handleLoseGame = async () => {
    const cfg = DIFF[difficulty];
    const basePointsVal = score;
    const totalGainedVal = Math.round(basePointsVal * cfg.mult);
    const prevPts = await getPlayerPts(playerTag);

    let updatedLB = leaderboard;
    if (totalGainedVal > 0) {
      updatedLB = await addScore(playerTag, totalGainedVal);
      setLeaderboard(updatedLB);
    }
    const newTotalVal = prevPts + totalGainedVal;

    setGameResults({
      basePoints: basePointsVal,
      difficultyMultiplier: cfg.mult,
      totalGained: totalGainedVal,
      newTotal: newTotalVal,
    });

    triggerFlash('explosion');
    setIsGameOver(true);
    setGameOverStatus('lose');
  };

  const handleClearLeaderboard = async () => {
    if (window.confirm('¿Borrar todo el ranking?')) {
      const updated = await clearLB();
      setLeaderboard(updated);
    }
  };

  const goHome = () => {
    setIsPlaying(false);
    setIsGameOver(false);
    setGameOverStatus(null);
    setActiveTab('start');
  };

  const viewLeaderboardFromResults = () => {
    setIsPlaying(false);
    setIsGameOver(false);
    setGameOverStatus(null);
    setActiveTab('leaderboard');
  };

  // Render Logic
  const cfg = DIFF[difficulty];
  const currentQuestion = gameQuestions[currentQuestionIndex];

  return (
    <>
      <div className="scanlines"></div>
      <div className={`explosion-overlay ${flashOverlay === 'explosion' ? 'active' : ''}`} id="explosion"></div>
      <div className={`defuse-overlay ${flashOverlay === 'defuse' ? 'active' : ''}`} id="defuse"></div>

      <div id="app">
        <Header />

        {!isPlaying && (
          <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* LOADING SCREEN ON API INITIAL FETCH */}
        {apiStatus === 'loading' && !isPlaying && (
          <div className="loading-screen" id="screen-loading">
            <div className="loader"></div>
            <div className="loading-text">Cargando datos de Valorant...</div>
            <div className="loading-sub">valorant-api.com</div>
          </div>
        )}

        {/* ERROR BANNER */}
        {isApiError && !isPlaying && (
          <div className="error-banner" id="error-banner">
            Sin conexión a la API — usando preguntas de respaldo.
          </div>
        )}

        {/* START TAB */}
        {activeTab === 'start' && apiStatus !== 'loading' && !isPlaying && !isGameOver && (
          <StartScreen
            playerTag={playerTag}
            setPlayerTag={setPlayerTag}
            apiStatus={apiStatus}
            apiLabel={apiLabel}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onStartGame={handleStartGame}
            questionsCount={questionPool.length}
          />
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && !isPlaying && !isGameOver && (
          <LeaderboardScreen
            leaderboard={leaderboard}
            currentPlayerTag={playerTag}
            rankIcons={rankIcons}
            onClearLeaderboard={handleClearLeaderboard}
          />
        )}

        {/* PLAYING STATE */}
        {isPlaying && !isGameOver && (
          <GameScreen
            timeLeft={timeLeft}
            totalTime={cfg.time}
            needed={cfg.needed}
            correctCount={correctCount}
            wrongCount={wrongCount}
            score={Math.round(score * cfg.mult)}
            currentQuestion={currentQuestion}
            onAnswer={handleAnswer}
            answered={answered}
            selectedOption={selectedOption}
            feedback={feedback}
            dotStates={dotStates}
            currentQuestionIndex={currentQuestionIndex}
          />
        )}

        {/* GAME OVER STATES */}
        {isGameOver && (
          <ResultScreen
            status={gameOverStatus}
            playerTag={playerTag}
            score={score}
            timeLeft={timeLeft}
            correctCount={correctCount}
            wrongCount={wrongCount}
            needed={cfg.needed}
            difficulty={difficulty}
            basePoints={gameResults.basePoints}
            difficultyMultiplier={gameResults.difficultyMultiplier}
            totalGained={gameResults.totalGained}
            newTotal={gameResults.newTotal}
            rankIcons={rankIcons}
            onRetry={handleStartGame}
            onViewLeaderboard={viewLeaderboardFromResults}
          />
        )}
      </div>
    </>
  );
}
