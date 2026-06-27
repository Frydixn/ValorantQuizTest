import React from 'react';

export default function NavTabs({ activeTab, onTabChange }) {
  return (
    <div className="nav-tabs" id="main-nav">
      <button
        className={`nav-tab ${activeTab === 'play' ? 'active' : ''}`}
        onClick={() => onTabChange('play')}
      >
        Jugar
      </button>
      <button
        className={`nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
        onClick={() => onTabChange('leaderboard')}
      >
        Ranking
      </button>
    </div>
  );
}
