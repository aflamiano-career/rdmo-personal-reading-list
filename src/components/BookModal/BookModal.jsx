import { useState, useEffect, useRef } from 'react';
import BookCover from '../BookCover/BookCover';
import StarRating from '../StarRating/StarRating';
import ProgressBar from '../ProgressBar/ProgressBar';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { getProgressPercent, getShelfLabel, formatDate } from '../../utils/helpers';

const SHELVES = ['want-to-read', 'currently-reading', 'read'];

export default function BookModal({ book, onClose }) {
  const { dispatch } = useApp();
  const { addToast } = useToast();
  const [notes, setNotes] = useState(book.notes || '');
  const [pageInput, setPageInput] = useState(String(book.currentPage || 0));
  const notesTimerRef = useRef(null);
  const overlayRef = useRef(null);

  const progress = getProgressPercent(book);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleShelfChange(shelf) {
    dispatch({ type: 'MOVE_TO_SHELF', payload: { id: book.id, shelf } });
    addToast(`Moved to "${getShelfLabel(shelf)}"`, 'success');
  }

  function handleRating(rating) {
    dispatch({ type: 'RATE_BOOK', payload: { id: book.id, rating } });
  }

  function handleNotesChange(e) {
    const val = e.target.value;
    setNotes(val);
    clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => {
      dispatch({ type: 'UPDATE_NOTES', payload: { id: book.id, notes: val } });
    }, 800);
  }

  function handlePageSave() {
    const page = Math.min(book.pages || Infinity, Math.max(0, Number(pageInput) || 0));
    dispatch({ type: 'UPDATE_PROGRESS', payload: { id: book.id, currentPage: page } });
    if (book.pages && page >= book.pages) {
      addToast('Congratulations! Book marked as read 🎉', 'success');
      onClose();
    } else {
      addToast('Progress saved', 'success');
    }
  }

  function handleRemove() {
    dispatch({ type: 'REMOVE_BOOK', payload: book.id });
    addToast(`"${book.title}" removed from library`, 'info');
    onClose();
  }

  const pageNum = Number(pageInput) || 0;
  const progressFromInput = book.pages ? Math.min(100, Math.round((pageNum / book.pages) * 100)) : 0;

  return (
    <div
      className="book-modal__overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
    >
      <div className="book-modal">
        <button className="book-modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="book-modal__header">
          <BookCover book={book} size="lg" className="book-modal__cover" />
          <div className="book-modal__meta">
            <h2 className="book-modal__title">{book.title}</h2>
            <p className="book-modal__author">by {book.author}</p>

            <div className="book-modal__info-row">
              {book.genre && <span className="book-modal__tag">{book.genre}</span>}
              {book.publishedYear && (
                <span className="book-modal__tag">{book.publishedYear}</span>
              )}
              {book.pages && (
                <span className="book-modal__tag">{book.pages} pages</span>
              )}
            </div>

            {/* Shelf selector */}
            <div className="book-modal__shelf-select">
              {SHELVES.map((s) => (
                <button
                  key={s}
                  className={`book-modal__shelf-btn book-modal__shelf-btn--${s} ${book.shelf === s ? 'book-modal__shelf-btn--active' : ''}`}
                  onClick={() => handleShelfChange(s)}
                >
                  {getShelfLabel(s)}
                </button>
              ))}
            </div>

            {/* Date metadata */}
            <div className="book-modal__dates">
              {book.dateAdded && (
                <span className="book-modal__date">Added {formatDate(book.dateAdded)}</span>
              )}
              {book.dateStarted && (
                <span className="book-modal__date">Started {formatDate(book.dateStarted)}</span>
              )}
              {book.dateFinished && (
                <span className="book-modal__date">Finished {formatDate(book.dateFinished)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="book-modal__body">
          {/* Progress tracker (only for currently reading) */}
          {book.shelf === 'currently-reading' && book.pages && (
            <section className="book-modal__section">
              <h3 className="book-modal__section-title">Reading Progress</h3>
              <div className="book-modal__progress-area">
                <ProgressBar percent={progressFromInput} size="md" showLabel />
                <div className="book-modal__progress-input-row">
                  <label className="book-modal__label">Current page</label>
                  <div className="book-modal__page-input-wrap">
                    <input
                      type="number"
                      className="book-modal__page-input"
                      value={pageInput}
                      min={0}
                      max={book.pages}
                      onChange={(e) => setPageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePageSave()}
                    />
                    <span className="book-modal__page-total">/ {book.pages}</span>
                    <button className="book-modal__save-btn" onClick={handlePageSave}>
                      Save
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  className="book-modal__slider"
                  min={0}
                  max={book.pages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                />
              </div>
            </section>
          )}

          {/* Rating */}
          {book.shelf === 'read' && (
            <section className="book-modal__section">
              <h3 className="book-modal__section-title">Your Rating</h3>
              <StarRating value={book.rating} onChange={handleRating} size="lg" />
              {book.rating === 0 && (
                <p className="book-modal__hint">Tap a star to rate this book</p>
              )}
            </section>
          )}

          {/* Description */}
          {book.description && (
            <section className="book-modal__section">
              <h3 className="book-modal__section-title">About this Book</h3>
              <p className="book-modal__description">{book.description}</p>
            </section>
          )}

          {/* Notes */}
          <section className="book-modal__section">
            <h3 className="book-modal__section-title">My Notes</h3>
            <textarea
              className="book-modal__notes"
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add your thoughts, quotes, or reflections…"
              rows={4}
            />
          </section>

          {/* Danger zone */}
          <div className="book-modal__danger">
            <button className="book-modal__remove-btn" onClick={handleRemove}>
              Remove from Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
