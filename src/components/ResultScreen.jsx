import React from 'react';
import { getRank, getNextRank, rankProgress } from '../utils/ranks';

export default function ResultScreen({
  status,
  playerTag,
  score,
  timeLeft,
  correctCount,
  wrongCount,
  needed,
  basePoints,
  timeBonus,
  totalGained,
  newTotal,
  rankIcons,
  onRetry,
  onViewLeaderboard,
}) {
  const isWin = status === 'win';
  const rank = getRank(newTotal);
  const next = getNextRank(newTotal);
  const progressPct = rankProgress(newTotal);
  const rankIconUrl = rankIcons[rank.name];

  const accuracy = (correctCount + wrongCount) > 0 
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
    : 0;

  return (
    <div className="screen">
      <div className="screen-icon">{isWin ? '✅' : '💥'}</div>
      
      <div 
        className="screen-title" 
        style={{ color: isWin ? 'var(--green)' : 'var(--red)' }}
      >
        {isWin ? 'Spike desactivada' : 'Spike detonada'}
      </div>

      <div className="screen-sub">
        {isWin 
          ? `Desactivaste la spike con ${timeLeft}s restantes, ${playerTag}.`
          : `Tiempo agotado. Solo ${correctCount} de ${needed} preguntas, ${playerTag}.`
        }
      </div>

      {/* Points Banner */}
      <div className="points-banner">
        {isWin ? (
          <>
            <div>
              <div className="points-big">+{totalGained.toLocaleString()}</div>
              <div className="points-label">puntos ganados</div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'right' }}>
              <div>{basePoints.toLocaleString()} base</div>
              <div>+{timeBonus.toLocaleString()} bonus tiempo</div>
            </div>
          </>
        ) : (
          totalGained > 0 ? (
            <div>
              <div className="points-big">+{totalGained.toLocaleString()}</div>
              <div className="points-label">puntos (50% por derrota)</div>
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Sin puntos — responde al menos una correcta
            </div>
          )
        )}
      </div>

      {/* Rank Card */}
      <div className="rank-card">
        {rankIconUrl ? (
          <img 
            src={rankIconUrl} 
            alt={rank.name} 
            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
          />
        ) : (
          <span style={{ fontSize: '1.5rem' }}>🎖️</span>
        )}
        <div className="rank-name" style={{ color: rank.color }}>
          {rank.name}
        </div>
        <div className="rank-pts">
          {next 
            ? `${newTotal.toLocaleString()} / ${next.min.toLocaleString()} pts para ${next.name}`
            : '¡Rango máximo!'
          }
        </div>
        <div className="rank-progress-track" style={{ width: '100%', marginTop: '4px' }}>
          <div 
            className="rank-progress-fill" 
            style={{ width: `${progressPct}%`, background: rank.color }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--green)' }}>
            {correctCount}
          </div>
          <div className="stat-lbl">Correctas</div>
        </div>

        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--red)' }}>
            {isWin ? wrongCount : needed - correctCount}
          </div>
          <div className="stat-lbl">{isWin ? 'Falladas' : 'Faltaron'}</div>
        </div>

        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--text)' }}>
            {isWin ? `${timeLeft}s` : `${accuracy}%`}
          </div>
          <div className="stat-lbl">{isWin ? 'Tiempo extra' : 'Precisión'}</div>
        </div>
      </div>

      <button 
        className="btn-primary" 
        style={isWin ? { background: 'var(--green)', boxShadow: '0 0 20px var(--green-glow)' } : {}}
        onClick={onRetry}
      >
        {isWin ? 'Nueva ronda' : 'Reintentar'}
      </button>

      <button className="btn-link" onClick={onViewLeaderboard}>
        Ver ranking
      </button>
    </div>
  );
}
