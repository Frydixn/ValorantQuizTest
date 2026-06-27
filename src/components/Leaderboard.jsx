import React from 'react';
import { getRankDetails } from '../services/valorantApi';

export default function Leaderboard({
  leaderboard,
  rankIcons,
  currentTag,
  onClearLeaderboard,
  isLoading,
}) {
  const posClass = ['gold', 'silver', 'bronze'];

  const handleClear = () => {
    if (window.confirm('¿Borrar todo el ranking?')) {
      onClearLeaderboard();
    }
  };

  const getRankName = (pts) => {
    const details = getRankDetails(pts, rankIcons);
    return details.rank.name;
  };

  const getRankIcon = (pts) => {
    const details = getRankDetails(pts, rankIcons);
    if (details.icon) {
      return (
        <img
          className="lb-rank-icon"
          src={details.icon}
          alt={details.rank.name}
        />
      );
    }
    return <span style={{ fontSize: '1.1rem', marginRight: '4px' }}>🎖️</span>;
  };

  return (
    <div id="tab-leaderboard" style={{ display: 'block' }}>
      <div className="lb-title">Top jugadores</div>

      {isLoading ? (
        <div className="lb-empty">Cargando clasificación...</div>
      ) : !leaderboard || leaderboard.length === 0 ? (
        <div className="lb-empty">
          Sin jugadores aún.
          <br />
          ¡Sé el primero!
        </div>
      ) : (
        <div className="leaderboard">
          {leaderboard.slice(0, 15).map((entry, idx) => {
            const isMe = currentTag && entry.tag.toLowerCase() === currentTag.toLowerCase();
            return (
              <div
                key={idx}
                className={`lb-row ${isMe ? 'me' : ''}`}
              >
                <span className={`lb-pos ${posClass[idx] || ''}`}>{idx + 1}</span>
                {getRankIcon(entry.pts)}
                <span className="lb-name">{entry.tag}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginRight: '4px' }}>
                  {getRankName(entry.pts)}
                </span>
                <span className="lb-pts">{entry.pts.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="btn-link"
        onClick={handleClear}
      >
        Borrar ranking
      </button>
    </div>
  );
}
