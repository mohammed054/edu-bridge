import { formatNumber } from '../../utils/format.js';

const clampPercent = (value) => Math.max(0, Math.min(100, value));

export default function BarProgressChart({ title, items = [] }) {
  if (!items.length) {
    return (
      <article className="metric-card chart-card">
        <h4 className="section-subtitle">{title}</h4>
        <p className="hint-text">لا توجد بيانات حالياً.</p>
      </article>
    );
  }

  return (
    <article className="metric-card chart-card stack">
      <h4 className="section-subtitle">{title}</h4>
      <div className="bar-chart-list stack">
        {items.map((item) => {
          const max = Number(item.max || 100);
          const value = Number(item.value || 0);
          const percent = clampPercent((value / Math.max(max, 1)) * 100);

          return (
            <div key={item.label} className="bar-chart-item stack tight">
              <div className="row between wrap-gap">
                <strong>{item.label}</strong>
                <span className="hint-text">{`${formatNumber(value)} / ${formatNumber(max)}`}</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
