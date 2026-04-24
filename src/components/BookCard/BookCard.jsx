import { useState } from 'react';
import BookCover from '../BookCover/BookCover';
import StarRating from '../StarRating/StarRating';
import ProgressBar from '../ProgressBar/ProgressBar';
import { getProgressPercent, getShelfLabel } from '../../utils/helpers';

export default function BookCard({ book, onOpen, onShelfChange, onRate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const progress = getProgressPercent(book);

  function handleShelf(shelf) {
    onShelfChange?.(book.id, shelf);
    setMenuOpen(false);
  }

  return (
    <article className={`book-card book-card--${book.shelf || 'none'}`}>
      <button className="book-card__cover-btn" onClick={() => onOpen?.(book)}>
        <BookCover book={book} size="md" className="book-card__cover" />
      </button>

      <div className="book-card__body">
        <button className="book-card__title-btn" onClick={() => onOpen?.(book)}>
          <h3 className="book-card__title">{book.title}</h3>
        </button>
        <p className="book-card__author">{book.author}</p>

        {book.genre && (
          <span className="book-card__genre">{book.genre}</span>
        )}

        {book.shelf === 'currently-reading' && book.pages && (
          <div className="book-card__progress">
            <ProgressBar percent={progress} size="sm" showLabel />
            <span className="book-card__progress-pages">
              p.{book.currentPage} / {book.pages}
            </span>
          </div>
        )}

        {book.shelf === 'read' && book.rating > 0 && (
          <StarRating
            value={book.rating}
            onChange={(r) => onRate?.(book.id, r)}
            size="sm"
          />
        )}

        {book.shelf === 'read' && book.rating === 0 && (
          <StarRating
            value={0}
            onChange={(r) => onRate?.(book.id, r)}
            size="sm"
          />
        )}

        <div className="book-card__footer">
          {book.shelf && (
            <span className={`book-card__shelf-badge book-card__shelf-badge--${book.shelf}`}>
              {getShelfLabel(book.shelf)}
            </span>
          )}

          <div className="book-card__actions">
            <div className="book-card__menu-wrap">
              <button
                className="book-card__menu-btn"
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                aria-label="Move to shelf"
              >
                ⋯
              </button>
              {menuOpen && (
                <>
                  <div
                    className="book-card__overlay"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="book-card__menu">
                    <p className="book-card__menu-label">Move to shelf</p>
                    {book.shelf !== 'want-to-read' && (
                      <button className="book-card__menu-item" onClick={() => handleShelf('want-to-read')}>
                        📋 Want to Read
                      </button>
                    )}
                    {book.shelf !== 'currently-reading' && (
                      <button className="book-card__menu-item" onClick={() => handleShelf('currently-reading')}>
                        📖 Currently Reading
                      </button>
                    )}
                    {book.shelf !== 'read' && (
                      <button className="book-card__menu-item" onClick={() => handleShelf('read')}>
                        ✅ Read
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
