import { createContext, useContext, useReducer, useEffect } from 'react';
import sampleBooks from '../data/sampleBooks';
import { saveState, loadState } from '../utils/storage';
import { generateId } from '../utils/helpers';

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_STATE = {
  books: {},
  goals: { [CURRENT_YEAR]: 24 },
  isGuest: false,
  user: null,
  initialized: false,
};

function booksArrayToMap(arr) {
  return arr.reduce((map, book) => {
    map[book.id] = book;
    return map;
  }, {});
}

function reducer(state, action) {
  switch (action.type) {
    case 'INIT_GUEST': {
      return {
        ...state,
        books: booksArrayToMap(sampleBooks),
        goals: { [CURRENT_YEAR]: 24 },
        isGuest: true,
        user: null,
        initialized: true,
      };
    }
    case 'INIT_ACCOUNT': {
      return {
        ...state,
        books: {},
        goals: { [CURRENT_YEAR]: 12 },
        isGuest: false,
        user: action.payload,
        initialized: true,
      };
    }
    case 'LOAD_SAVED': {
      return { ...action.payload, initialized: true };
    }
    case 'LOGOUT': {
      return { ...DEFAULT_STATE };
    }
    case 'ADD_BOOK': {
      const book = {
        ...action.payload,
        id: action.payload.id || generateId(),
        shelf: action.payload.shelf || 'want-to-read',
        currentPage: 0,
        rating: 0,
        notes: '',
        dateAdded: new Date().toISOString(),
        dateStarted: null,
        dateFinished: null,
      };
      return { ...state, books: { ...state.books, [book.id]: book } };
    }
    case 'REMOVE_BOOK': {
      const { [action.payload]: _, ...rest } = state.books;
      return { ...state, books: rest };
    }
    case 'MOVE_TO_SHELF': {
      const { id, shelf } = action.payload;
      const book = state.books[id];
      if (!book) return state;
      const updates = { shelf };
      if (shelf === 'currently-reading' && !book.dateStarted) {
        updates.dateStarted = new Date().toISOString();
        updates.dateFinished = null;
      }
      if (shelf === 'read') {
        updates.dateFinished = new Date().toISOString();
        if (!book.dateStarted) updates.dateStarted = new Date().toISOString();
        updates.currentPage = book.pages || book.currentPage;
      }
      if (shelf === 'want-to-read') {
        updates.dateStarted = null;
        updates.dateFinished = null;
        updates.currentPage = 0;
      }
      return {
        ...state,
        books: { ...state.books, [id]: { ...book, ...updates } },
      };
    }
    case 'UPDATE_PROGRESS': {
      const { id, currentPage } = action.payload;
      const book = state.books[id];
      if (!book) return state;
      const isFinished = book.pages && currentPage >= book.pages;
      const updates = { currentPage };
      if (isFinished) {
        updates.shelf = 'read';
        updates.dateFinished = new Date().toISOString();
      }
      return {
        ...state,
        books: { ...state.books, [id]: { ...book, ...updates } },
      };
    }
    case 'RATE_BOOK': {
      const { id, rating } = action.payload;
      const book = state.books[id];
      if (!book) return state;
      return {
        ...state,
        books: { ...state.books, [id]: { ...book, rating } },
      };
    }
    case 'UPDATE_NOTES': {
      const { id, notes } = action.payload;
      const book = state.books[id];
      if (!book) return state;
      return {
        ...state,
        books: { ...state.books, [id]: { ...book, notes } },
      };
    }
    case 'SET_GOAL': {
      const { year, target } = action.payload;
      return { ...state, goals: { ...state.goals, [year]: target } };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: 'LOAD_SAVED', payload: saved });
    }
  }, []);

  // Persist on every state change (skip initial uninitialized state)
  useEffect(() => {
    if (state.initialized) {
      saveState(state);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
