import React from 'react';
import { getRankDetails } from '../services/valorantApi';

export default function ScoreScreen({
  isWin,
  playerTag,
  pointsGained,
  timeBonus,
  basePoints,
  correctCount,
  wrongCount,
  timeLeft,
  neededQuestions,
  playerTotalPoints,
  rankIcons,
  onRetry,
  onGoToLeaderboard,
}) {
  const rankDetails = getRankDetails(playerTotalPoints, rankIcons);
  const accuracy = (correctCount + wrongCount) > 0
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
    : 0;

  const titleColor = isWin ? 'var(--green)' : 'var(--red)';
  const boxGlowColor = isWin ? 'var(--green-glow)' : 'var(--red-glow)';

  // Stats cards configuration
  const stats = isWin
    ? [
        { val: correctCount, color: 'var(--green)', lbl: 'Correctas' },
        { val: wrongCount, color: 'var(--red)', lbl: 'Falladas' },
        { val: `${timeLeft}s`, color: 'var(--text)', lbl: 'Tiempo extra' },
      ]
    : [
        { val: correctCount, color: 'var(--green)', lbl: 'Correctas' },
        { val: neededQuestions - correctCount, color: 'var(--red)', lbl: 'Faltaron' },
        { val: `${accuracy}%`, color: 'var(--text)', lbl: 'Precisión' },
      ];

  return (
    <div className="screen" style={{ display: 'flex' }}>
      <div className="screen-icon">{isWin ? '✅' : '💥'}</div>
      <div className="screen-title" style={{ color: titleColor }}>
        {isWin ? 'Spike desactivada' : 'Spike detonada'}
      </div>
      <div className="screen-sub">
        {isWin
          ? `Desactivaste la spike con ${timeLeft}s restantes, ${playerTag}.`
          : `Tiempo agotado. Solo respondiste ${correctCount} de ${neededQuestions} preguntas, ${playerTag}.`}
      </div>

      {/* POINTS BANNER */}
      <div className="points-banner">
        <div>
          <div className="points-big">+{pointsGained.toLocaleString()}</div>
          <div className="points-label">
            {isWin ? 'puntos ganados' : 'puntos (50% por derrota)'}
          </div>
        </div>
        {isWin && (
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'right' }}>
            <div>{basePoints.toLocaleString()} base</div>
            <div>+{timeBonus.toLocaleString()} bonus tiempo</div>
          </div>
        )}
      </div>

      {/* RANK CARD */}
      <div className="rank-card">
        {rankDetails.icon ? (
          <img
            src={rankDetails.icon}
            alt={rankDetails.rank.name}
          />
        ) : (
          <span style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>🎖️</span>
        )}
        <div className="rank-name" style={{ color: rankDetails.rank.color }}>
          {rankDetails.rank.name}
        </div>
        <div className="rank-pts">
          {rankDetails.nextRank
            ? `${playerTotalPoints.toLocaleString()} / ${rankDetails.nextRank.min.toLocaleString()} pts para ${rankDetails.nextRank.name}`
            : '¡Rango máximo!'}
        </div>
        <div className="rank-progress-track">
          <div
            className="rank-progress-fill"
            style={{
              width: `${rankDetails.progress}%`,
              background: rankDetails.rank.color,
            }}
          />
        </div>
      </div>

      {/* STATS GRID */}
      <div className="stat-grid">
        {stats.map((s, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-val" style={{ color: s.color }}>
              {s.val}
            </div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <button
        type="button"
        className="btn-primary"
        style={
          isWin
            ? { background: 'var(--green)', boxShadow: `0 0 20px ${boxGlowColor}` }
            : {}
        }
        onClick={onRetry}
      >
        {isWin ? 'Nueva ronda' : 'Reintentar'}
      </button>

      <button
        type="button"
        className="btn-link"
        onClick={onGoToLeaderboard}
      >
        Ver ranking
      </button>
    </div>
  );
}
