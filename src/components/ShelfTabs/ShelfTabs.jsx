
const TABS = [
  { id: 'all', label: 'All Books' },
  { id: 'currently-reading', label: 'Reading' },
  { id: 'want-to-read', label: 'Want to Read' },
  { id: 'read', label: 'Read' },
];

export default function ShelfTabs({ active, counts = {}, onChange }) {
  return (
    <div className="shelf-tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`shelf-tabs__tab shelf-tabs__tab--${tab.id} ${active === tab.id ? 'shelf-tabs__tab--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {counts[tab.id] > 0 && (
            <span className="shelf-tabs__count">{counts[tab.id]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
