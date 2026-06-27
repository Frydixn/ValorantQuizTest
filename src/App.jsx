import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import NavTabs from './components/NavTabs';
import StartScreen from './components/StartScreen';
import GameArea from './components/GameArea';
import ScoreScreen from './components/ScoreScreen';
import Leaderboard from './components/Leaderboard';
import { getSupabaseLeaderboard, saveSupabaseScore } from './services/supabaseClient';
import { loadValorantData, shuffle, getRankDetails } from './services/valorantApi';

const DIFF_SETTINGS = {
  easy: { time: 90, needed: 5, mult: 1.0 },
  medium: { time: 60, needed: 8, mult: 1.5 },
  hard: { time: 45, needed: 10, mult: 2.5 },
};

const PTS_PER_SEC = 5;

export default function App() {
  // Navigation and High-level View States
  const [activeTab, setActiveTab] = useState('play');
  const [gameState, setGameState] = useState('start'); // start | loading_data | playing | win | lose

  // Player and API details
  const [playerTag, setPlayerTag] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [apiStatus, setApiStatus] = useState('loading'); // loading | ok | error
  const [questionPool, setQuestionPool] = useState([]);
  const [rankIcons, setRankIcons] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Game Arena States
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [liveScore, setLiveScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  // Overlay effects (Victory / Defeat animations)
  const [explosionActive, setExplosionActive] = useState(false);
  const [defuseActive, setDefuseActive] = useState(false);

  // Score stats for score screen display
  const [gameStats, setGameStats] = useState({
    pointsGained: 0,
    timeBonus: 0,
    basePoints: 0,
    playerTotalPoints: 0,
    savedTimeLeft: 0,
  });

  const timerRef = useRef(null);

  // 1. Initial Data Fetch on Mount
  useEffect(() => {
    async function initData() {
      setIsLoadingData(true);
      const data = await loadValorantData();
      setApiStatus(data.status);
      setQuestionPool(data.questionPool);
      setRankIcons(data.rankIcons);
      setIsLoadingData(false);
    }
    initData();
    loadLeaderboardData();
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. Local Storage Leaderboard Helpers
  const loadLocalLeaderboard = () => {
    try {
      return JSON.parse(localStorage.getItem('valoquiz_lb') || '[]');
    } catch (e) {
      return [];
    }
  };

  const saveLocalLeaderboard = (lb) => {
    localStorage.setItem('valoquiz_lb', JSON.stringify(lb));
  };

  const getPlayerLocalPts = (tag) => {
    const lb = loadLocalLeaderboard();
    const entry = lb.find(e => e.tag.toLowerCase() === tag.toLowerCase());
    return entry ? entry.pts : 0;
  };

  // Loads Leaderboard from Supabase with fallback to localStorage
  const loadLeaderboardData = async () => {
    setIsLoadingLeaderboard(true);
    const dbLb = await getSupabaseLeaderboard();
    if (dbLb !== null) {
      // Successfully fetched from Supabase, update both local state and localStorage
      setLeaderboard(dbLb);
      saveLocalLeaderboard(dbLb);
    } else {
      // Failed to load from database, use localStorage
      const localLb = loadLocalLeaderboard();
      setLeaderboard(localLb);
    }
    setIsLoadingLeaderboard(false);
  };

  // Adds a score locally and returns the updated points for that player
  const saveLocalScore = (tag, pts) => {
    const lb = loadLocalLeaderboard();
    const existing = lb.find(e => e.tag.toLowerCase() === tag.toLowerCase());
    
    if (existing) {
      existing.pts += pts;
      existing.games = (existing.games || 1) + 1;
    } else {
      lb.push({ tag, pts, games: 1 });
    }
    
    lb.sort((a, b) => b.pts - a.pts);
    const truncatedLb = lb.slice(0, 50);
    saveLocalLeaderboard(truncatedLb);
    
    // Find the player's updated score to return
    const updated = truncatedLb.find(e => e.tag.toLowerCase() === tag.toLowerCase());
    return updated ? updated.pts : pts;
  };

  // 3. Game Actions
  const startGame = () => {
    const cfg = DIFF_SETTINGS[difficulty];
    const needed = cfg.needed;
    
    // Shuffle and pick a slice of questions (adding buffer)
    const shuffled = shuffle(questionPool).slice(
      0,
      Math.min(needed + 10, questionPool.length)
    );

    setGameQuestions(shuffled);
    setCurrentIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLiveScore(0);
    setTimeLeft(cfg.time);
    setGameState('playing');

    // Start timer interval
    if (timerRef.current) clearInterval(timerRef.current);
    
    let timerVal = cfg.time;
    timerRef.current = setInterval(() => {
      timerVal -= 1;
      setTimeLeft(timerVal);
      if (timerVal <= 0) {
        clearInterval(timerRef.current);
        triggerLoseGame(0, 0, needed);
      }
    }, 1000);
  };

  const handleAnswerSubmit = (isCorrect, ptsGained) => {
    const cfg = DIFF_SETTINGS[difficulty];
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    const newWrong = !isCorrect ? wrongCount + 1 : wrongCount;
    const newScore = liveScore + ptsGained;

    if (isCorrect) {
      setCorrectCount(newCorrect);
      setLiveScore(newScore);

      // Check win condition
      if (newCorrect >= cfg.needed) {
        clearInterval(timerRef.current);
        triggerWinGame(newScore, timeLeft, cfg.mult);
        return;
      }
    } else {
      setWrongCount(newWrong);
    }

    // Move to next question
    setCurrentIdx(prev => prev + 1);
  };

  const triggerWinGame = async (baseScore, finalTimeLeft, multiplier) => {
    // Flash green overlay
    setDefuseActive(true);
    setTimeout(() => setDefuseActive(false), 1000);

    const timeBonus = Math.round(finalTimeLeft * PTS_PER_SEC * multiplier);
    const totalGained = baseScore + timeBonus;

    // Save score locally
    const playerNewTotalLocal = saveLocalScore(playerTag, totalGained);

    // Update screen stats state immediately
    setGameStats({
      pointsGained: totalGained,
      timeBonus,
      basePoints: baseScore,
      playerTotalPoints: playerNewTotalLocal,
      savedTimeLeft: finalTimeLeft,
    });

    setGameState('win');

    // Save score asynchronously to Supabase
    const dbSuccess = await saveSupabaseScore(playerTag, totalGained);
    if (dbSuccess) {
      // Reload classification list from Supabase
      loadLeaderboardData();
      
      // Update overall points in case Supabase total differs or updates successfully
      const dbLb = await getSupabaseLeaderboard();
      if (dbLb) {
        const dbPlayer = dbLb.find(e => e.tag.toLowerCase() === playerTag.toLowerCase());
        if (dbPlayer) {
          setGameStats(prev => ({
            ...prev,
            playerTotalPoints: dbPlayer.pts,
          }));
        }
      }
    } else {
      // If DB fails, reload local leaderboard representation
      setLeaderboard(loadLocalLeaderboard());
    }
  };

  const triggerLoseGame = async (currentScore, finalTimeLeft, needed) => {
    // Flash red overlay
    setExplosionActive(true);
    setTimeout(() => setExplosionActive(false), 1000);

    const totalGained = Math.round(currentScore * 0.5);

    // Save score locally
    let playerNewTotalLocal = getPlayerLocalPts(playerTag);
    if (totalGained > 0) {
      playerNewTotalLocal = saveLocalScore(playerTag, totalGained);
    }

    setGameStats({
      pointsGained: totalGained,
      timeBonus: 0,
      basePoints: currentScore,
      playerTotalPoints: playerNewTotalLocal,
      savedTimeLeft: 0,
    });

    setGameState('lose');

    if (totalGained > 0) {
      // Save score asynchronously to Supabase
      const dbSuccess = await saveSupabaseScore(playerTag, totalGained);
      if (dbSuccess) {
        loadLeaderboardData();
        const dbLb = await getSupabaseLeaderboard();
        if (dbLb) {
          const dbPlayer = dbLb.find(e => e.tag.toLowerCase() === playerTag.toLowerCase());
          if (dbPlayer) {
            setGameStats(prev => ({
              ...prev,
              playerTotalPoints: dbPlayer.pts,
            }));
          }
        }
      } else {
        setLeaderboard(loadLocalLeaderboard());
      }
    }
  };

  const clearLeaderboardScores = () => {
    localStorage.removeItem('valoquiz_lb');
    setLeaderboard([]);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'leaderboard') {
      loadLeaderboardData();
    }
  };

  const handleRetry = () => {
    setGameState('start');
    setActiveTab('play');
  };

  const handleGoToLeaderboard = () => {
    setGameState('start');
    handleTabChange('leaderboard');
  };

  // Determine which screen component to render in the main play tab
  const renderPlayScreen = () => {
    switch (gameState) {
      case 'playing':
        return (
          <GameArea
            question={gameQuestions[currentIdx]}
            correctCount={correctCount}
            neededQuestions={DIFF_SETTINGS[difficulty].needed}
            score={liveScore}
            timeLeft={timeLeft}
            totalTime={DIFF_SETTINGS[difficulty].time}
            onAnswer={handleAnswerSubmit}
            difficultyMult={DIFF_SETTINGS[difficulty].mult}
          />
        );
      case 'win':
        return (
          <ScoreScreen
            isWin={true}
            playerTag={playerTag}
            pointsGained={gameStats.pointsGained}
            timeBonus={gameStats.timeBonus}
            basePoints={gameStats.basePoints}
            correctCount={correctCount}
            wrongCount={wrongCount}
            timeLeft={gameStats.savedTimeLeft}
            neededQuestions={DIFF_SETTINGS[difficulty].needed}
            playerTotalPoints={gameStats.playerTotalPoints}
            rankIcons={rankIcons}
            onRetry={handleRetry}
            onGoToLeaderboard={handleGoToLeaderboard}
          />
        );
      case 'lose':
        return (
          <ScoreScreen
            isWin={false}
            playerTag={playerTag}
            pointsGained={gameStats.pointsGained}
            timeBonus={0}
            basePoints={gameStats.basePoints}
            correctCount={correctCount}
            wrongCount={wrongCount}
            timeLeft={0}
            neededQuestions={DIFF_SETTINGS[difficulty].needed}
            playerTotalPoints={gameStats.playerTotalPoints}
            rankIcons={rankIcons}
            onRetry={handleRetry}
            onGoToLeaderboard={handleGoToLeaderboard}
          />
        );
      case 'start':
      default:
        return (
          <StartScreen
            playerTag={playerTag}
            setPlayerTag={setPlayerTag}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            apiStatus={apiStatus}
            questionCount={questionPool.length}
            onStartGame={startGame}
            isLoadingData={isLoadingData}
          />
        );
    }
  };

  return (
    <>
      {/* Background scanline simulation */}
      <div className="scanlines" />

      {/* Dynamic Screen Overlays for Damage/Defusal events */}
      <div className={`explosion-overlay ${explosionActive ? 'active' : ''}`} />
      <div className={`defuse-overlay ${defuseActive ? 'active' : ''}`} />

      {/* Main app panel */}
      <div id="app">
        <Header />

        {/* Render Navigation tabs ONLY when not actively playing a quiz */}
        {gameState !== 'playing' && (
          <NavTabs activeTab={activeTab} onTabChange={handleTabChange} />
        )}

        {/* Tab contents */}
        {activeTab === 'play' ? (
          renderPlayScreen()
        ) : (
          <Leaderboard
            leaderboard={leaderboard}
            rankIcons={rankIcons}
            currentTag={playerTag}
            onClearLeaderboard={clearLeaderboardScores}
            isLoading={isLoadingLeaderboard}
          />
        )}
      </div>
    </>
  );
}
