import { formatNumber } from '../../utils/format.js';

const WIDTH = 320;
const HEIGHT = 140;
const PADDING = 18;

const toPoints = (values) => {
  if (!values.length) {
    return '';
  }

  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = Math.max(maxValue - minValue, 1);

  return values
    .map((value, index) => {
      const x = PADDING + (index * (WIDTH - PADDING * 2)) / Math.max(values.length - 1, 1);
      const normalized = (value - minValue) / range;
      const y = HEIGHT - PADDING - normalized * (HEIGHT - PADDING * 2);
      return `${x},${y}`;
    })
    .join(' ');
};

export default function LineTrendChart({ title, labels = [], values = [] }) {
  if (!values.length) {
    return (
      <article className="metric-card chart-card">
        <h4 className="section-subtitle">{title}</h4>
        <p className="hint-text">لا توجد بيانات كافية للرسم.</p>
      </article>
    );
  }

  const points = toPoints(values);

  return (
    <article className="metric-card chart-card stack">
      <h4 className="section-subtitle">{title}</h4>
      <svg className="line-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title}>
        <defs>
          <linearGradient id="lineFillGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-soft)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--brand-soft)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={points} className="line-chart-stroke" fill="none" />
        {values.map((value, index) => {
          const [x, y] = points.split(' ')[index].split(',');
          return (
            <g key={`${title}-${index}`}>
              <circle cx={x} cy={y} r="3.5" className="line-chart-dot" />
              <title>{`${labels[index] || `نقطة ${index + 1}`}: ${formatNumber(value)}`}</title>
            </g>
          );
        })}
      </svg>
      <div className="line-chart-labels">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`} className="hint-text compact">
            {label}
          </span>
        ))}
      </div>
    </article>
  );
}
