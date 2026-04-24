import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import BookCard from '../../components/BookCard/BookCard';
import BookModal from '../../components/BookModal/BookModal';
import ShelfTabs from '../../components/ShelfTabs/ShelfTabs';
import EmptyState from '../../components/EmptyState/EmptyState';

const SORT_OPTIONS = [
  { value: 'dateAdded', label: 'Date Added' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'rating', label: 'Rating' },
  { value: 'pages', label: 'Pages' },
];

export default function Library() {
  const { state, dispatch } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeShelf, setActiveShelf] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [sort, setSort] = useState('dateAdded');
  const [sortDir, setSortDir] = useState('desc');
  const [genreFilter, setGenreFilter] = useState('all');
  const [search, setSearch] = useState('');

  const allBooks = Object.values(state.books);

  const genres = [...new Set(allBooks.map((b) => b.genre).filter(Boolean))].sort();

  const filtered = allBooks
    .filter((b) => {
      if (activeShelf !== 'all' && b.shelf !== activeShelf) return false;
      if (genreFilter !== 'all' && b.genre !== genreFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let av = a[sort] ?? '';
      let bv = b[sort] ?? '';
      if (sort === 'dateAdded') {
        av = av || '0';
        bv = bv || '0';
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const counts = {
    all: allBooks.length,
    'want-to-read': allBooks.filter((b) => b.shelf === 'want-to-read').length,
    'currently-reading': allBooks.filter((b) => b.shelf === 'currently-reading').length,
    read: allBooks.filter((b) => b.shelf === 'read').length,
  };

  function handleShelfChange(id, shelf) {
    dispatch({ type: 'MOVE_TO_SHELF', payload: { id, shelf } });
    const book = state.books[id];
    addToast(`"${book?.title}" moved`, 'success');
  }

  function handleRate(id, rating) {
    dispatch({ type: 'RATE_BOOK', payload: { id, rating } });
  }

  function toggleSort(field) {
    if (sort === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(field);
      setSortDir('desc');
    }
  }

  const isEmpty = filtered.length === 0;

  return (
    <div className="library">
      <div className="library__header">
        <div className="library__header-top">
          <div>
            <h1 className="library__title">My Library</h1>
            <p className="library__subtitle">
              {allBooks.length} {allBooks.length === 1 ? 'book' : 'books'} in your collection
            </p>
          </div>
          <button
            className="library__search-btn"
            onClick={() => navigate('/app/search')}
          >
            + Add Books
          </button>
        </div>

        <ShelfTabs active={activeShelf} counts={counts} onChange={setActiveShelf} />

        <div className="library__controls">
          <div className="library__search-wrap">
            <span className="library__search-icon">🔍</span>
            <input
              type="search"
              className="library__search"
              placeholder="Filter by title or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="library__genre-filter"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            <option value="all">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <div className="library__sort-group">
            <select
              className="library__sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              className="library__sort-dir"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div className="library__content">
        {isEmpty ? (
          <EmptyState
            icon={activeShelf === 'currently-reading' ? '📖' : activeShelf === 'want-to-read' ? '📋' : activeShelf === 'read' ? '✅' : '📚'}
            title={
              search
                ? 'No books match your search'
                : activeShelf === 'all'
                ? 'Your library is empty'
                : `No books on this shelf yet`
            }
            description={
              search
                ? 'Try a different search term or clear the filter.'
                : 'Search for books and add them to start building your library.'
            }
            action={
              !search && (
                <button
                  className="library__empty-cta"
                  onClick={() => navigate('/app/search')}
                >
                  Search for Books
                </button>
              )
            }
          />
        ) : (
          <div className="library__grid">
            {filtered.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onOpen={setSelectedBook}
                onShelfChange={handleShelfChange}
                onRate={handleRate}
              />
            ))}
          </div>
        )}
      </div>

      {selectedBook && (
        <BookModal
          book={state.books[selectedBook.id] || selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}
