import { formatNumber } from '../../utils/format.js';

const clamp = (value) => Math.max(0, Math.min(100, value));

export default function RadialProgressChart({ title, value = 0, max = 100, caption = '' }) {
  const numericValue = Number(value || 0);
  const numericMax = Math.max(Number(max || 100), 1);
  const percent = clamp((numericValue / numericMax) * 100);

  return (
    <article className="metric-card chart-card stack center-content">
      <h4 className="section-subtitle">{title}</h4>
      <div className="radial-chart" style={{ '--progress': `${percent}%` }}>
        <div className="radial-chart-inner">
          <strong>{`${formatNumber(percent)}%`}</strong>
          <span className="hint-text compact">{`${formatNumber(numericValue)} / ${formatNumber(numericMax)}`}</span>
        </div>
      </div>
      {caption ? <p className="hint-text compact centered-text">{caption}</p> : null}
    </article>
  );
}
