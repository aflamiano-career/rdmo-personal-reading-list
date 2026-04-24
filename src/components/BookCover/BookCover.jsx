import { useState } from 'react';
import { getGenreColor } from '../../utils/helpers';

export default function BookCover({ book, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const coverUrl = book.coverUrl || (book.isbn
    ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`
    : null);

  const altText = `Cover of ${book.title} by ${book.author}`;

  if (coverUrl && !imgError) {
    return (
      <div className={`book-cover book-cover--${size} ${className}`}>
        <img
          src={coverUrl}
          alt={altText}
          className="book-cover__img"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  const bgColor = getGenreColor(book.genre);

  return (
    <div
      className={`book-cover book-cover--${size} book-cover--placeholder ${className}`}
      style={{ '--cover-bg': bgColor }}
      role="img"
      aria-label={altText}
    >
      <span className="book-cover__placeholder-title">{book.title}</span>
      <span className="book-cover__placeholder-author">{book.author}</span>
    </div>
  );
}
