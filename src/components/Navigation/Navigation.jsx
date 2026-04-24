import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { clearState } from '../../utils/storage';

const NAV_ITEMS = [
  { to: '/app/library', icon: '📚', label: 'Library' },
  { to: '/app/search', icon: '🔍', label: 'Search' },
  { to: '/app/goals', icon: '🎯', label: 'Goals' },
  { to: '/app/stats', icon: '📊', label: 'Stats' },
];

export default function Navigation() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    clearState();
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  }

  const bookCount = Object.keys(state.books).length;
  const userName = state.user?.name || (state.isGuest ? 'Guest Reader' : 'Reader');
  const userInitial = userName[0].toUpperCase();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="navigation" aria-label="Main navigation">
        <div className="navigation__header">
          <div className="navigation__brand">
            <span className="navigation__brand-icon" aria-hidden="true">📖</span>
            <span className="navigation__brand-name">Bookshelf</span>
          </div>
        </div>

        <div className="navigation__links">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `navigation__link ${isActive ? 'navigation__link--active' : ''}`
              }
            >
              <span className="navigation__link-icon" aria-hidden="true">{item.icon}</span>
              <span className="navigation__link-label">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="navigation__footer">
          <div className="navigation__user">
            <div className="navigation__avatar" aria-hidden="true">{userInitial}</div>
            <div className="navigation__user-info">
              <span className="navigation__user-name">{userName}</span>
              <span className="navigation__user-meta">
                {bookCount} {bookCount === 1 ? 'book' : 'books'}
                {state.isGuest && ' · Guest'}
              </span>
            </div>
          </div>
          <button
            className="navigation__logout"
            onClick={handleLogout}
            aria-label="Exit and return to home"
            title="Exit"
          >
            ↩
          </button>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="navigation-mobile" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `navigation-mobile__item ${isActive ? 'navigation-mobile__item--active' : ''}`
            }
          >
            <span className="navigation-mobile__icon" aria-hidden="true">{item.icon}</span>
            <span className="navigation-mobile__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
