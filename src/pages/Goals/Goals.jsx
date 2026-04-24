import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import CircularProgress from '../../components/CircularProgress/CircularProgress';
import {
  getBooksReadThisYear,
  getDaysLeftInYear,
  getDayOfYear,
  getReadingPaceProjection,
  getMonthlyReadingData,
  pluralize,
} from '../../utils/helpers';

const CURRENT_YEAR = new Date().getFullYear();

export default function Goals() {
  const { state, dispatch } = useApp();
  const { addToast } = useToast();

  const goal = state.goals[CURRENT_YEAR] || 12;
  const [goalInput, setGoalInput] = useState(String(goal));

  const booksRead = getBooksReadThisYear(state.books);
  const readCount = booksRead.length;
  const percent = goal > 0 ? Math.min(100, Math.round((readCount / goal) * 100)) : 0;

  const daysLeft = getDaysLeftInYear();
  const dayOfYear = getDayOfYear();
  const daysTotal = 365;
  const dayPercent = Math.round((dayOfYear / daysTotal) * 100);
  const projected = getReadingPaceProjection(readCount);

  const booksLeft = Math.max(0, goal - readCount);
  const weeksLeft = Math.ceil(daysLeft / 7);
  const booksPerWeekNeeded = weeksLeft > 0 ? (booksLeft / weeksLeft).toFixed(1) : 0;

  const isOnTrack = projected >= goal;
  const isAhead = readCount > Math.floor((dayPercent / 100) * goal);

  const monthlyData = getMonthlyReadingData(state.books, CURRENT_YEAR);
  const currentMonth = new Date().getMonth();

  function handleGoalSave() {
    const n = parseInt(goalInput, 10);
    if (!n || n < 1 || n > 999) {
      addToast('Please enter a valid goal between 1 and 999', 'error');
      return;
    }
    dispatch({ type: 'SET_GOAL', payload: { year: CURRENT_YEAR, target: n } });
    addToast(`Goal updated to ${n} books for ${CURRENT_YEAR}`, 'success');
  }

  function handleIncrement(delta) {
    const next = Math.max(1, Math.min(999, (parseInt(goalInput, 10) || 0) + delta));
    setGoalInput(String(next));
  }

  return (
    <div className="goals">
      <div className="goals__header">
        <h1 className="goals__title">Reading Goals</h1>
        <p className="goals__subtitle">{CURRENT_YEAR} — Stay on pace, one book at a time.</p>
      </div>

      {/* Main progress */}
      <div className="goals__progress-section">
        <div className="goals__circle-wrap">
          <CircularProgress
            percent={percent}
            size={220}
            strokeWidth={14}
            color="var(--color-primary)"
            label={`${readCount} / ${goal}`}
            sublabel="books read"
          />
        </div>

        <div className="goals__stats-panel">
          <div className={`goals__status-badge goals__status-badge--${isAhead ? 'ahead' : 'behind'}`}>
            {isAhead ? '🎉 Ahead of pace!' : '📖 Keep reading!'}
          </div>

          <div className="goals__stat-grid">
            <div className="goals__stat">
              <span className="goals__stat-value">{readCount}</span>
              <span className="goals__stat-label">Books read</span>
            </div>
            <div className="goals__stat">
              <span className="goals__stat-value">{booksLeft}</span>
              <span className="goals__stat-label">Books to go</span>
            </div>
            <div className="goals__stat">
              <span className="goals__stat-value">{daysLeft}</span>
              <span className="goals__stat-label">Days left</span>
            </div>
            <div className="goals__stat">
              <span className="goals__stat-value">{projected}</span>
              <span className="goals__stat-label">Projected total</span>
            </div>
          </div>

          <div className="goals__pace-info">
            {booksLeft > 0 ? (
              <p>
                At your current pace you'll finish{' '}
                <strong>{projected} {projected === 1 ? 'book' : 'books'}</strong> this year.
                {booksLeft > 0 && (
                  <> You need <strong>{booksPerWeekNeeded} books/week</strong> to hit your goal.</>
                )}
              </p>
            ) : (
              <p>
                🏆 You've hit your goal of <strong>{goal} books</strong>!
                Consider raising the bar for next time.
              </p>
            )}
          </div>

          {/* Goal editor */}
          <div className="goals__editor">
            <span className="goals__editor-label">My {CURRENT_YEAR} goal</span>
            <div className="goals__editor-controls">
              <button
                className="goals__editor-btn"
                onClick={() => handleIncrement(-1)}
              >
                −
              </button>
              <input
                type="number"
                className="goals__editor-input"
                value={goalInput}
                min={1}
                max={999}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoalSave()}
              />
              <button
                className="goals__editor-btn"
                onClick={() => handleIncrement(1)}
              >
                +
              </button>
              <button className="goals__editor-save" onClick={handleGoalSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly calendar */}
      <section className="goals__monthly">
        <h2 className="goals__section-title">Monthly Breakdown — {CURRENT_YEAR}</h2>
        <div className="goals__month-grid">
          {monthlyData.map((m, i) => {
            const isPast = i < currentMonth;
            const isCurrent = i === currentMonth;
            return (
              <div
                key={m.month}
                className={`goals__month-cell ${m.books > 0 ? 'goals__month-cell--has-books' : ''} ${isCurrent ? 'goals__month-cell--current' : ''} ${isPast && m.books === 0 ? 'goals__month-cell--missed' : ''}`}
              >
                <span className="goals__month-name">{m.month}</span>
                <span className="goals__month-count">
                  {m.books > 0 ? pluralize(m.books, 'book') : isCurrent ? '…' : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recently read */}
      {booksRead.length > 0 && (
        <section className="goals__recent">
          <h2 className="goals__section-title">Books Read in {CURRENT_YEAR}</h2>
          <div className="goals__recent-list">
            {booksRead
              .sort((a, b) => new Date(b.dateFinished) - new Date(a.dateFinished))
              .map((book) => (
                <div key={book.id} className="goals__recent-item">
                  <span className="goals__recent-num">
                    #{booksRead.indexOf(book) + 1}
                  </span>
                  <div className="goals__recent-info">
                    <span className="goals__recent-title">{book.title}</span>
                    <span className="goals__recent-author">{book.author}</span>
                  </div>
                  <div className="goals__recent-right">
                    {book.rating > 0 && (
                      <span className="goals__recent-rating">
                        {'★'.repeat(book.rating)}
                      </span>
                    )}
                    <span className="goals__recent-genre">{book.genre}</span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
