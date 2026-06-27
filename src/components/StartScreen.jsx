import React from 'react';

export default function StartScreen({
  playerTag,
  setPlayerTag,
  apiStatus,
  apiLabel,
  difficulty,
  setDifficulty,
  onStartGame,
  questionsCount,
}) {
  const handleStartClick = () => {
    onStartGame();
  };

  return (
    <div className="screen">
      {/* PLAYER TAG */}
      <div className="player-input-row">
        <div className="input-label">Tu tag de Valorant</div>
        <input
          className="tag-input"
          id="player-tag"
          type="text"
          placeholder="Jugador#TAG"
          maxLength="32"
          autoComplete="off"
          spellCheck="false"
          value={playerTag}
          onChange={(e) => setPlayerTag(e.target.value)}
        />
      </div>

      <div className="api-badge">
        <span className={`api-dot ${apiStatus}`} id="api-dot"></span>
        <span id="api-label">{apiLabel}</span>
      </div>

      <div style={{ width: '100%', marginBottom: '0.5rem' }}>
        <div className="section-label">Dificultad</div>
        <div className="diff-grid">
          <button
            className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
            onClick={() => setDifficulty('easy')}
          >
            <span className="diff-icon">🟢</span>
            <span className="diff-name">Fácil</span>
            <span className="diff-desc">90s · 5 preguntas · x1</span>
          </button>
          <button
            className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
            onClick={() => setDifficulty('medium')}
          >
            <span className="diff-icon">🔴</span>
            <span className="diff-name">Normal</span>
            <span className="diff-desc">60s · 8 preguntas · x1.5</span>
          </button>
          <button
            className={`diff-btn ${difficulty === 'hard' ? 'active' : ''}`}
            onClick={() => setDifficulty('hard')}
          >
            <span className="diff-icon">💀</span>
            <span className="diff-name">Ace</span>
            <span className="diff-desc">45s · 10 preguntas · x2.5</span>
          </button>
        </div>
      </div>

      <button
        className="btn-primary"
        id="btn-start"
        onClick={handleStartClick}
        disabled={apiStatus === 'loading'}
      >
        {apiStatus === 'loading' ? 'Cargando...' : 'Plantar Spike'}
      </button>

      {questionsCount > 0 && (
        <div className="questions-count" id="questions-count">
          {questionsCount} preguntas disponibles
        </div>
      )}
    </div>
  );
}
