import React from 'react';

export default function NavTabs({ activeTab, setActiveTab }) {
  return (
    <div className="nav-tabs" id="main-nav">
      <button
        className={`nav-tab ${activeTab === 'start' ? 'active' : ''}`}
        onClick={() => setActiveTab('start')}
      >
        Jugar
      </button>
      <button
        className={`nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('leaderboard')}
      >
        Ranking
      </button>
    </div>
  );
}
