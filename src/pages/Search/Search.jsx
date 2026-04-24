import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { searchBooks, searchByISBN } from '../../utils/api';
import { generateId, getShelfLabel } from '../../utils/helpers';
import BookCover from '../../components/BookCover/BookCover';
import EmptyState from '../../components/EmptyState/EmptyState';

const SHELVES = ['want-to-read', 'currently-reading', 'read'];

function ResultCard({ result, isInLibrary, libraryShelf, onAdd }) {
  const [selectedShelf, setSelectedShelf] = useState('want-to-read');

  return (
    <div className={`search-result ${isInLibrary ? 'search-result--in-library' : ''}`}>
      <BookCover book={result} size="md" className="search-result__cover" />
      <div className="search-result__info">
        <h3 className="search-result__title">{result.title}</h3>
        <p className="search-result__author">{result.author}</p>
        <div className="search-result__meta">
          {result.genre && <span className="search-result__tag">{result.genre}</span>}
          {result.publishedYear && (
            <span className="search-result__tag">{result.publishedYear}</span>
          )}
          {result.pages && (
            <span className="search-result__tag">{result.pages} pages</span>
          )}
        </div>
      </div>
      <div className="search-result__action">
        {isInLibrary ? (
          <span className="search-result__in-library-badge">
            ✓ {getShelfLabel(libraryShelf)}
          </span>
        ) : (
          <div className="search-result__add-group">
            <select
              className="search-result__shelf-select"
              value={selectedShelf}
              onChange={(e) => setSelectedShelf(e.target.value)}
            >
              {SHELVES.map((s) => (
                <option key={s} value={s}>{getShelfLabel(s)}</option>
              ))}
            </select>
            <button
              className="search-result__add-btn"
              onClick={() => onAdd(result, selectedShelf)}
            >
              + Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Search() {
  const { state, dispatch } = useApp();
  const { addToast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef(null);

  const isISBN = /^\d[\d-]{8,}$/.test(query.trim());

  async function handleSearch(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = isISBN
        ? await searchByISBN(query.trim())
        : await searchBooks(query.trim());
      setResults(res);
    } catch {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    setQuery(e.target.value);
    clearTimeout(timerRef.current);
    if (e.target.value.trim().length >= 3) {
      timerRef.current = setTimeout(() => handleSearch(), 600);
    }
  }

  function handleAdd(result, shelf) {
    const book = {
      ...result,
      id: generateId(),
      shelf,
      currentPage: 0,
      rating: 0,
      notes: '',
      dateAdded: new Date().toISOString(),
      dateStarted: shelf === 'currently-reading' ? new Date().toISOString() : null,
      dateFinished: shelf === 'read' ? new Date().toISOString() : null,
    };
    dispatch({ type: 'ADD_BOOK', payload: book });
    addToast(`"${result.title}" added to ${getShelfLabel(shelf)}`, 'success');
  }

  const existingISBNs = new Map(
    Object.values(state.books)
      .filter((b) => b.isbn)
      .map((b) => [b.isbn, b.shelf]),
  );
  const existingTitles = new Map(
    Object.values(state.books).map((b) => [b.title.toLowerCase(), b.shelf]),
  );

  function isInLibrary(result) {
    if (result.isbn && existingISBNs.has(result.isbn)) return existingISBNs.get(result.isbn);
    return existingTitles.get(result.title.toLowerCase()) ?? null;
  }

  const SUGGESTIONS = [
    'Dune Frank Herbert',
    'Atomic Habits',
    'The Midnight Library',
    'Project Hail Mary',
    'Lessons in Chemistry',
  ];

  return (
    <div className="search-page">
      <div className="search-page__header">
        <h1 className="search-page__title">Discover Books</h1>
        <p className="search-page__subtitle">
          Search millions of books by title, author, or ISBN and add them to your library.
        </p>

        <form className="search-page__form" onSubmit={handleSearch}>
          <div className="search-page__input-wrap">
            <span className="search-page__input-icon">🔍</span>
            <input
              type="search"
              className="search-page__input"
              placeholder="Title, author, or ISBN…"
              value={query}
              onChange={handleInputChange}
              autoFocus
            />
            {loading && <span className="search-page__spinner" />}
          </div>
          <button type="submit" className="search-page__submit" disabled={loading || !query.trim()}>
            Search
          </button>
        </form>

        {!searched && (
          <div className="search-page__suggestions">
            <span className="search-page__suggestions-label">Try:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="search-page__suggestion"
                onClick={() => { setQuery(s); setTimeout(handleSearch, 0); }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="search-page__results">
        {error && (
          <div className="search-page__error">
            <span>⚠️</span> {error}
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <EmptyState
            icon="🔍"
            title="No results found"
            description={`We couldn't find any books for "${query}". Try a different search.`}
          />
        )}

        {results.length > 0 && (
          <>
            <p className="search-page__count">
              {results.length} results for <em>"{query}"</em>
            </p>
            <div className="search-page__list">
              {results.map((r, i) => {
                const shelf = isInLibrary(r);
                return (
                  <ResultCard
                    key={r.olKey || r.isbn || i}
                    result={r}
                    isInLibrary={!!shelf}
                    libraryShelf={shelf}
                    onAdd={handleAdd}
                  />
                );
              })}
            </div>
          </>
        )}

        {!searched && !loading && (
          <EmptyState
            icon="📚"
            title="Find your next great read"
            description="Search by title, author name, or ISBN. We'll look it up and let you add it to any shelf."
          />
        )}
      </div>
    </div>
  );
}
