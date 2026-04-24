
export default function ProgressBar({ percent = 0, showLabel = false, size = 'md', color }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={`progress-bar progress-bar--${size}`}>
      <div
        className="progress-bar__track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Reading progress: ${clamped}% complete`}
      >
        <div
          className="progress-bar__fill"
          style={{ width: `${clamped}%`, '--progress-color': color }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar__label">{clamped}%</span>
      )}
    </div>
  );
}
