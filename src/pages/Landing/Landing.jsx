import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const FEATURES = [
  {
    icon: '📚',
    title: 'Organize Your Library',
    desc: 'Sort books into shelves: Want to Read, Currently Reading, and Read.',
  },
  {
    icon: '📈',
    title: 'Track Your Progress',
    desc: 'Log pages read with a satisfying progress bar and slider.',
  },
  {
    icon: '🎯',
    title: 'Set Annual Goals',
    desc: 'Challenge yourself with a reading goal and stay on pace.',
  },
  {
    icon: '📊',
    title: 'Year in Review',
    desc: 'Visualize your reading habits with beautiful charts and insights.',
  },
  {
    icon: '⭐',
    title: 'Rate & Reflect',
    desc: 'Rate books and write personal notes to remember what moved you.',
  },
  {
    icon: '🔍',
    title: 'Discover Books',
    desc: 'Search millions of books via Open Library and add them instantly.',
  },
];

const STATS = [
  { value: '45+', label: 'Sample Books' },
  { value: '5', label: 'Genres' },
  { value: '∞', label: 'Possibilities' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { dispatch } = useApp();

  function handleGuest() {
    dispatch({ type: 'INIT_GUEST' });
    navigate('/app/library');
  }

  function handleSignUp() {
    const name = prompt('Welcome! What should we call you?');
    if (name?.trim()) {
      dispatch({
        type: 'INIT_ACCOUNT',
        payload: { name: name.trim(), email: '' },
      });
      navigate('/app/library');
    }
  }

  return (
    <div className="landing">
      {/* Hero */}
      <header className="landing__hero">
        <div className="landing__hero-content">
          <div className="landing__brand">
            <span className="landing__brand-icon">📖</span>
            <span className="landing__brand-name">Bookshelf</span>
          </div>

          <h1 className="landing__headline">
            Your reading life,
            <br />
            <em>beautifully organized.</em>
          </h1>

          <p className="landing__subheadline">
            Track every book you read, set ambitious goals, and rediscover the joy of
            making progress — one page at a time.
          </p>

          <div className="landing__cta-group">
            <button className="landing__cta landing__cta--primary" onClick={handleSignUp}>
              Create Free Account
            </button>
            <button className="landing__cta landing__cta--secondary" onClick={handleGuest}>
              Try as Guest →
            </button>
          </div>

          <p className="landing__disclaimer">
            Guest mode loads 45 sample books so you can explore immediately.
          </p>
        </div>

        <div className="landing__hero-visual" aria-hidden="true">
          <div className="landing__book-stack">
            {['📕', '📗', '📘', '📙', '📓'].map((e, i) => (
              <div key={i} className="landing__book-item" style={{ '--delay': `${i * 0.1}s` }}>
                {e}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="landing__stats">
        {STATS.map((s) => (
          <div key={s.label} className="landing__stat">
            <span className="landing__stat-value">{s.value}</span>
            <span className="landing__stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className="landing__features">
        <div className="landing__section-header">
          <h2 className="landing__section-title">Everything your reading habit needs</h2>
          <p className="landing__section-subtitle">
            From your first book to your hundredth — Bookshelf grows with you.
          </p>
        </div>
        <div className="landing__features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing__feature-card">
              <div className="landing__feature-icon">{f.icon}</div>
              <h3 className="landing__feature-title">{f.title}</h3>
              <p className="landing__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing__final-cta">
        <h2 className="landing__final-title">Ready to start your reading journey?</h2>
        <div className="landing__cta-group">
          <button className="landing__cta landing__cta--primary" onClick={handleSignUp}>
            Get Started Free
          </button>
          <button className="landing__cta landing__cta--secondary" onClick={handleGuest}>
            Explore with Sample Books
          </button>
        </div>
      </section>

      <footer className="landing__footer">
        <p>Built with ❤️ for readers everywhere.</p>
      </footer>
    </div>
  );
}
