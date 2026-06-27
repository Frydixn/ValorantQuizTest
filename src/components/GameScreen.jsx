import React from 'react';

export default function GameScreen({
  timeLeft,
  totalTime,
  needed,
  correctCount,
  wrongCount,
  score,
  currentQuestion,
  onAnswer,
  answered,
  selectedOption,
  feedback,
  dotStates = [],
  currentQuestionIndex,
}) {
  if (!currentQuestion) return null;

  const pct = (timeLeft / totalTime) * 100;
  const timerColor = pct > 50 ? 'var(--red)' : pct > 25 ? '#ff8c00' : '#ff2200';

  const keys = ['A', 'B', 'C', 'D'];

  // Render dots progress (sliding window of the last 10 attempts)
  const visibleDotStates = dotStates.slice(-10);
  const dots = visibleDotStates.map((status, i) => (
    <div key={i} className={`dot ${status}`}></div>
  ));

  return (
    <div id="game-area" className="active">
      {/* Spike timer bar */}
      <div className="spike-bar">
        <div className="spike-icon">💣</div>
        <div className="spike-meta">
          <div className="spike-label">Tiempo restante</div>
          <div className="timer-track">
            <div
              className="timer-fill"
              style={{
                width: `${pct}%`,
                background: timerColor,
              }}
            ></div>
          </div>
        </div>
        <div
          className="timer-display"
          style={{ color: timerColor }}
        >
          {timeLeft}
        </div>
      </div>

      {/* Progress dots */}
      <div className="progress-row">
        <div className="progress-label">Progreso</div>
        <div className="progress-dots" id="dots">
          {dots}
        </div>
      </div>

      {/* Live round & score */}
      <div className="game-meta">
        <div className="round-badge">
          Pregunta {currentQuestionIndex + 1}
        </div>
        <div className="score-live">{score.toLocaleString()} pts</div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        {currentQuestion.portrait && (
          <img
            className="agent-portrait visible"
            src={currentQuestion.portrait}
            alt="Agent"
          />
        )}
        <div className="question-body">
          <div className="question-category">{currentQuestion.cat}</div>
          <div className="question-text">{currentQuestion.q}</div>
        </div>
      </div>

      {/* Options grid */}
      <div className="options">
        {currentQuestion.opts.map((opt, idx) => {
          const isCorrect = opt === currentQuestion.ansVal;
          const isSelected = selectedOption === opt;
          let btnClass = 'option-btn';

          if (answered) {
            if (isCorrect) {
              btnClass += ' correct';
            } else if (isSelected && !isCorrect) {
              btnClass += ' wrong';
            }
          }

          return (
            <button
              key={idx}
              className={btnClass}
              disabled={answered}
              onClick={() => onAnswer(opt)}
            >
              <span className="option-key">{keys[idx]}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback Message */}
      <div className={`feedback ${feedback.type}`}>
        {feedback.text}
      </div>
    </div>
  );
}
