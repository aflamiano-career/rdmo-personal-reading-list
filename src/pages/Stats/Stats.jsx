import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import {
  getBooksReadThisYear,
  getMonthlyReadingData,
  getGenreBreakdown,
  getTotalPagesRead,
  getAverageRating,
  getGenreColor,
  formatDate,
} from '../../utils/helpers';
import EmptyState from '../../components/EmptyState/EmptyState';
import StarRating from '../../components/StarRating/StarRating';

const CURRENT_YEAR = new Date().getFullYear();

function StatCard({ icon, value, label, sub, color }) {
  return (
    <div className="stat-card" style={{ '--card-accent': color }}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
        {sub && <span className="stat-card__sub">{sub}</span>}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="chart-tooltip__value" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function Stats() {
  const { state } = useApp();

  const booksThisYear = getBooksReadThisYear(state.books, CURRENT_YEAR);
  const monthlyData = getMonthlyReadingData(state.books, CURRENT_YEAR);
  const genreData = getGenreBreakdown(state.books, CURRENT_YEAR);
  const totalPages = getTotalPagesRead(state.books, CURRENT_YEAR);
  const avgRating = getAverageRating(state.books, CURRENT_YEAR);

  const cumulativeData = monthlyData.reduce((acc, m, i) => {
    const prev = i > 0 ? acc[i - 1].total : 0;
    acc.push({ ...m, total: prev + m.books });
    return acc;
  }, []);

  const topRated = booksThisYear
    .filter((b) => b.rating >= 4)
    .sort((a, b) => b.rating - a.rating || (b.pages || 0) - (a.pages || 0))
    .slice(0, 5);

  const longestBook = booksThisYear.reduce(
    (max, b) => (b.pages || 0) > (max?.pages || 0) ? b : max,
    null,
  );

  const mostReadGenre = genreData[0];
  const bestMonth = [...monthlyData].sort((a, b) => b.books - a.books)[0];

  if (booksThisYear.length === 0) {
    return (
      <div className="stats">
        <div className="stats__header">
          <h1 className="stats__title">{CURRENT_YEAR} Reading Stats</h1>
        </div>
        <EmptyState
          icon="📊"
          title="No stats yet"
          description={`Mark books as "Read" with a ${CURRENT_YEAR} finish date to see your year in review.`}
        />
      </div>
    );
  }

  return (
    <div className="stats">
      <div className="stats__header">
        <h1 className="stats__title">Year in Review</h1>
        <p className="stats__subtitle">
          {CURRENT_YEAR} — Your reading story so far
        </p>
      </div>

      {/* Hero wrap */}
      <div className="stats__hero-banner">
        <div className="stats__hero-text">
          <p className="stats__hero-label">This year you've read</p>
          <h2 className="stats__hero-count">{booksThisYear.length}</h2>
          <p className="stats__hero-unit">
            {booksThisYear.length === 1 ? 'book' : 'books'}
          </p>
        </div>
        <div className="stats__hero-emoji">📚</div>
      </div>

      {/* Stat cards */}
      <div className="stats__card-row">
        <StatCard
          icon="📄"
          value={totalPages.toLocaleString()}
          label="Pages Read"
          sub="across all books"
          color="#4F46E5"
        />
        <StatCard
          icon="⭐"
          value={avgRating}
          label="Avg Rating"
          sub="out of 5 stars"
          color="#F59E0B"
        />
        <StatCard
          icon="🏆"
          value={mostReadGenre?.name || '—'}
          label="Top Genre"
          sub={mostReadGenre ? `${mostReadGenre.value} books` : ''}
          color={mostReadGenre ? getGenreColor(mostReadGenre.name) : undefined}
        />
        <StatCard
          icon="🗓️"
          value={bestMonth?.books > 0 ? bestMonth.month : '—'}
          label="Best Month"
          sub={bestMonth?.books > 0 ? `${bestMonth.books} books` : ''}
          color="#0891B2"
        />
      </div>

      {/* Charts grid */}
      <div className="stats__charts-grid">
        {/* Monthly bar chart */}
        <div className="stats__chart-card stats__chart-card--wide">
          <h3 className="stats__chart-title">Books Finished by Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="books" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Books" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Genre pie */}
        <div className="stats__chart-card">
          <h3 className="stats__chart-title">Genre Breakdown</h3>
          {genreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genreData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="var(--color-surface)"
                >
                  {genreData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} books`, n]} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="stats__no-data">Not enough data yet.</p>
          )}
        </div>

        {/* Cumulative area chart */}
        <div className="stats__chart-card stats__chart-card--wide">
          <h3 className="stats__chart-title">Cumulative Books Read</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={cumulativeData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#grad)"
                name="Total"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top rated */}
      {topRated.length > 0 && (
        <section className="stats__section">
          <h3 className="stats__section-title">⭐ Top Rated Books</h3>
          <div className="stats__top-list">
            {topRated.map((book) => (
              <div key={book.id} className="stats__top-item">
                <div className="stats__top-rank">#{topRated.indexOf(book) + 1}</div>
                <div className="stats__top-info">
                  <span className="stats__top-title">{book.title}</span>
                  <span className="stats__top-author">{book.author}</span>
                </div>
                <div className="stats__top-right">
                  <StarRating value={book.rating} readonly size="sm" />
                  {book.dateFinished && (
                    <span className="stats__top-date">Finished {formatDate(book.dateFinished)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fun facts */}
      <section className="stats__section stats__fun-facts">
        <h3 className="stats__section-title">📌 Fun Facts</h3>
        <div className="stats__facts-grid">
          {longestBook && (
            <div className="stats__fact">
              <span className="stats__fact-icon">📖</span>
              <div>
                <p className="stats__fact-title">Longest Book</p>
                <p className="stats__fact-value">{longestBook.title}</p>
                <p className="stats__fact-sub">{longestBook.pages?.toLocaleString()} pages</p>
              </div>
            </div>
          )}
          {mostReadGenre && (
            <div className="stats__fact">
              <span className="stats__fact-icon">🎭</span>
              <div>
                <p className="stats__fact-title">Favorite Genre</p>
                <p className="stats__fact-value">{mostReadGenre.name}</p>
                <p className="stats__fact-sub">{mostReadGenre.value} out of {booksThisYear.length} books</p>
              </div>
            </div>
          )}
          <div className="stats__fact">
            <span className="stats__fact-icon">📏</span>
            <div>
              <p className="stats__fact-title">Avg Book Length</p>
              <p className="stats__fact-value">
                {booksThisYear.length > 0
                  ? Math.round(totalPages / booksThisYear.length).toLocaleString()
                  : '—'} pages
              </p>
              <p className="stats__fact-sub">per book</p>
            </div>
          </div>
          <div className="stats__fact">
            <span className="stats__fact-icon">📅</span>
            <div>
              <p className="stats__fact-title">Reading Pace</p>
              <p className="stats__fact-value">
                {(booksThisYear.length / Math.max(1, new Date().getMonth() + 1)).toFixed(1)} / month
              </p>
              <p className="stats__fact-sub">average so far</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
