import React, { useState, useEffect } from 'react';

export default function GameArea({
  question,
  correctCount,
  neededQuestions,
  score,
  timeLeft,
  totalTime,
  onAnswer,
  difficultyMult,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Reset local state when a new question arrives
  useEffect(() => {
    setSelectedOption(null);
    setAnswered(false);
    setFeedback({ text: '', type: '' });
  }, [question]);

  if (!question) return null;

  // Calculate timer percent and color
  const timerPct = (timeLeft / totalTime) * 100;
  let timerColor = 'var(--red)';
  if (timerPct <= 25) {
    timerColor = '#ff2200';
  } else if (timerPct <= 50) {
    timerColor = '#ff8c00';
  }

  const optionKeys = ['A', 'B', 'C', 'D'];

  const handleOptionClick = (opt) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(opt);

    const isCorrect = opt === question.ansVal;
    const ptsPerCorrect = 100;
    const ptsGained = Math.round(ptsPerCorrect * difficultyMult);

    if (isCorrect) {
      setFeedback({
        text: `¡Correcto! +${ptsGained} pts`,
        type: 'correct',
      });
      // Short delay for correct answer before moving forward
      setTimeout(() => {
        onAnswer(true, ptsGained);
      }, 900);
    } else {
      setFeedback({
        text: 'Incorrecto.',
        type: 'wrong',
      });
      // Slightly longer delay for wrong answers so they see the correct answer highlighted
      setTimeout(() => {
        onAnswer(false, 0);
      }, 1200);
    }
  };

  // Render progress dots
  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < neededQuestions; i++) {
      let className = 'dot';
      if (i < correctCount) {
        className += ' correct';
      } else if (i === correctCount) {
        className += ' current';
      }
      dots.push(<div key={i} className={className} />);
    }
    return dots;
  };

  return (
    <div id="game-area" style={{ display: 'block' }}>
      {/* SPIKE TIMER BAR */}
      <div className="spike-bar">
        <div className="spike-icon">💣</div>
        <div className="spike-meta">
          <div className="spike-label">Tiempo restante</div>
          <div className="timer-track">
            <div
              className="timer-fill"
              style={{
                width: `${Math.max(0, timerPct)}%`,
                background: timerColor,
              }}
            />
          </div>
        </div>
        <div className="timer-display" style={{ color: timerColor }}>
          {timeLeft}
        </div>
      </div>

      {/* PROGRESS */}
      <div className="progress-row">
        <div className="progress-label">Progreso</div>
        <div className="progress-dots">{renderDots()}</div>
      </div>

      {/* ROUND & SCORE META */}
      <div className="game-meta">
        <div className="round-badge">
          Pregunta {correctCount + 1} / {neededQuestions}
        </div>
        <div className="score-live">{score.toLocaleString()} pts</div>
      </div>

      {/* QUESTION CARD */}
      <div className="question-card">
        {question.portrait && (
          <img
            className="agent-portrait visible"
            src={question.portrait}
            alt=""
          />
        )}
        <div className="question-body">
          <div className="question-category">{question.cat}</div>
          <div className="question-text">{question.q}</div>
        </div>
      </div>

      {/* OPTIONS */}
      <div className="options">
        {question.opts.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isAnsCorrect = opt === question.ansVal;

          let btnClass = 'option-btn';
          if (answered) {
            if (isAnsCorrect) {
              btnClass += ' correct';
            } else if (isSelected) {
              btnClass += ' wrong';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              className={btnClass}
              onClick={() => handleOptionClick(opt)}
              disabled={answered}
            >
              <span className="option-key">{optionKeys[idx]}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* FEEDBACK */}
      <div className={`feedback ${feedback.type}`}>{feedback.text}</div>
    </div>
  );
}
