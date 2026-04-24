export function formatDate(isoString) {
  if (!isoString) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(isoString));
}

export function formatDateShort(isoString) {
  if (!isoString) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(isoString));
}

export function getProgressPercent(book) {
  if (!book.pages || book.pages === 0) return 0;
  return Math.min(100, Math.round((book.currentPage / book.pages) * 100));
}

export function getShelfLabel(shelf) {
  const labels = {
    'want-to-read': 'Want to Read',
    'currently-reading': 'Currently Reading',
    read: 'Read',
  };
  return labels[shelf] || shelf;
}

export function getShelfColor(shelf) {
  const map = {
    'want-to-read': 'var(--color-shelf-want)',
    'currently-reading': 'var(--color-shelf-reading)',
    read: 'var(--color-shelf-read)',
  };
  return map[shelf] || 'var(--color-text-tertiary)';
}

export function getGenreColor(genre) {
  const map = {
    Fiction: '#7C5C3A',
    'Non-Fiction': '#3D7C4F',
    'Sci-Fi & Fantasy': '#4A72B0',
    'Self-Improvement': '#8B612B',
    'Tech & Programming': '#5A4A8A',
    'Science Fiction': '#4A72B0',
    Fantasy: '#6B4FA0',
    History: '#7A5230',
    Biography: '#5C7A3A',
    Romance: '#B06080',
    Mystery: '#8A4A4A',
    Other: '#6B5E52',
  };
  return map[genre] || '#6B5E52';
}

export function generateId() {
  return `book-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getDaysLeftInYear() {
  const now = new Date();
  const end = new Date(now.getFullYear(), 11, 31);
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

export function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
}

export function getReadingPaceProjection(booksRead) {
  const dayOfYear = getDayOfYear();
  return Math.round((booksRead / dayOfYear) * 365);
}

export function getBooksReadThisYear(books, year = new Date().getFullYear()) {
  return Object.values(books).filter((book) => {
    if (book.shelf !== 'read' || !book.dateFinished) return false;
    return new Date(book.dateFinished).getFullYear() === year;
  });
}

export function getMonthlyReadingData(books, year = new Date().getFullYear()) {
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
    books: 0,
    pages: 0,
  }));
  Object.values(books).forEach((book) => {
    if (book.shelf !== 'read' || !book.dateFinished) return;
    const d = new Date(book.dateFinished);
    if (d.getFullYear() !== year) return;
    const m = d.getMonth();
    months[m].books++;
    months[m].pages += book.pages || 0;
  });
  return months;
}

export function getGenreBreakdown(books, year = new Date().getFullYear()) {
  const counts = {};
  Object.values(books).forEach((book) => {
    if (book.shelf !== 'read' || !book.dateFinished) return;
    if (new Date(book.dateFinished).getFullYear() !== year) return;
    const genre = book.genre || 'Other';
    counts[genre] = (counts[genre] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value, color: getGenreColor(name) }))
    .sort((a, b) => b.value - a.value);
}

export function getTotalPagesRead(books, year = new Date().getFullYear()) {
  return Object.values(books)
    .filter((b) => b.shelf === 'read' && b.dateFinished && new Date(b.dateFinished).getFullYear() === year)
    .reduce((sum, b) => sum + (b.pages || 0), 0);
}

export function getAverageRating(books, year = new Date().getFullYear()) {
  const rated = Object.values(books).filter(
    (b) =>
      b.shelf === 'read' &&
      b.rating > 0 &&
      b.dateFinished &&
      new Date(b.dateFinished).getFullYear() === year,
  );
  if (rated.length === 0) return 0;
  return (rated.reduce((sum, b) => sum + b.rating, 0) / rated.length).toFixed(1);
}

export function getCoverUrl(isbn) {
  if (!isbn) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural ?? singular + 's'}`;
}
