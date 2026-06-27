import React from 'react';

export default function StartScreen({
  playerTag,
  setPlayerTag,
  difficulty,
  setDifficulty,
  apiStatus,
  questionCount,
  onStartGame,
  isLoadingData,
}) {
  const getApiLabel = () => {
    switch (apiStatus) {
      case 'loading':
        return 'Conectando a valorant-api.com...';
      case 'ok':
        return 'valorant-api.com conectada';
      case 'error':
        return 'Sin conexión a la API — modo respaldo';
      default:
        return 'Desconectado';
    }
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (!playerTag.trim()) {
      const input = document.getElementById('player-tag');
      if (input) {
        input.focus();
        input.style.borderColor = 'var(--red)';
      }
      return;
    }
    onStartGame();
  };

  const handleInputChange = (e) => {
    setPlayerTag(e.target.value);
    e.target.style.borderColor = '';
  };

  return (
    <form className="screen" onSubmit={handleStart}>
      {/* PLAYER TAG */}
      <div className="player-input-row">
        <label className="input-label" htmlFor="player-tag">Tu tag de Valorant</label>
        <input
          className="tag-input"
          id="player-tag"
          type="text"
          placeholder="Jugador#TAG"
          maxLength={32}
          autoComplete="off"
          spellCheck="false"
          value={playerTag}
          onChange={handleInputChange}
        />
      </div>

      <div className="api-badge">
        <span className={`api-dot ${apiStatus}`} />
        <span>{getApiLabel()}</span>
      </div>

      <div style={{ width: '100%', marginBottom: '0.5rem' }}>
        <div className="section-label">Dificultad</div>
        <div className="diff-grid">
          <button
            type="button"
            className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
            onClick={() => setDifficulty('easy')}
          >
            <span className="diff-icon">🟢</span>
            <span className="diff-name">Fácil</span>
            <span className="diff-desc">90s · 5 preguntas · x1</span>
          </button>
          <button
            type="button"
            className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
            onClick={() => setDifficulty('medium')}
          >
            <span className="diff-icon">🔴</span>
            <span className="diff-name">Normal</span>
            <span className="diff-desc">60s · 8 preguntas · x1.5</span>
          </button>
          <button
            type="button"
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
        type="submit"
        className="btn-primary"
        disabled={isLoadingData}
      >
        {isLoadingData ? 'Cargando...' : 'Plantar Spike'}
      </button>

      <div className="questions-count">
        {questionCount > 0
          ? `${questionCount} preguntas ${apiStatus === 'error' ? 'de respaldo' : ''} disponibles`
          : ''}
      </div>
    </form>
  );
}
