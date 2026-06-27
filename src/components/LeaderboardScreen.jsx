import React from 'react';
import { getRank } from '../utils/ranks';

export default function LeaderboardScreen({
  leaderboard,
  currentPlayerTag,
  rankIcons,
  onClearLeaderboard,
}) {
  const posClass = ['gold', 'silver', 'bronze'];

  return (
    <div>
      <div className="lb-title">Top jugadores</div>
      
      <div className="leaderboard" id="lb-list">
        {leaderboard.length === 0 ? (
          <div className="lb-empty">
            Sin jugadores aún.<br />
            ¡Sé el primero!
          </div>
        ) : (
          leaderboard.slice(0, 15).map((entry, index) => {
            const rank = getRank(entry.pts);
            const rankIconUrl = rankIcons[rank.name];
            const isMe = currentPlayerTag && entry.tag.toLowerCase() === currentPlayerTag.toLowerCase();

            return (
              <div 
                key={index} 
                className={`lb-row ${isMe ? 'me' : ''}`}
              >
                <span className={`lb-pos ${posClass[index] || ''}`}>
                  {index + 1}
                </span>
                
                {rankIconUrl ? (
                  <img 
                    className="lb-rank-icon" 
                    src={rankIconUrl} 
                    alt={rank.name} 
                  />
                ) : (
                  <span style={{ fontSize: '1.1rem', marginRight: '4px' }}>🎖️</span>
                )}
                
                <span className="lb-name">{entry.tag}</span>
                
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginRight: '8px' }}>
                  {rank.name}
                </span>
                
                <span className="lb-pts">{entry.pts.toLocaleString()}</span>
              </div>
            );
          })
        )}
      </div>

      <button className="btn-link" onClick={onClearLeaderboard}>
        Borrar ranking
      </button>
    </div>
  );
}
