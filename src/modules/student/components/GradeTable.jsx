import EmptyState from './EmptyState';
import { formatDate, formatNumber } from '../utils/format';

const calcAvg = (rows) => {
  if (!rows.length) return 0;
  const s = rows.reduce((a, r) => a + Number(r.score || 0), 0);
  const o = rows.reduce((a, r) => a + Number(r.outOf || 0), 0);
  return o ? (s / o) * 100 : 0;
};

const barColor = (pct) => {
  if (pct >= 75) return '#00C853';
  if (pct >= 50) return '#FFB300';
  return '#D32F2F';
};

const gradeLabel = (pct) => {
  if (pct >= 90) return { label: 'ممتاز', color: '#00C853' };
  if (pct >= 75) return { label: 'جيد جداً', color: '#2C7BE5' };
  if (pct >= 60) return { label: 'جيد', color: '#FFB300' };
  if (pct >= 50) return { label: 'مقبول', color: '#F97316' };
  return { label: 'ضعيف', color: '#D32F2F' };
};

export default function GradeTable({ rows = [] }) {
  const avg = calcAvg(rows);
  const { label: avgLabel, color: avgColor } = gradeLabel(avg);

  return (
    <div className="space-y-4">
      {/* Average card */}
      <div className="panel-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold text-text-secondary">المتوسط العام</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: avgColor + '18', color: avgColor }}>
              {avgLabel}
            </span>
            <span className="text-[22px] font-bold text-text-primary">{formatNumber(avg, 1)}٪</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-border overflow-hidden">
          <div
            className="grade-fill h-full rounded-full"
            style={{ width: `${Math.max(2, Math.min(100, avg))}%`, background: barColor(avg) }}
          />
        </div>
      </div>

      {!rows.length ? (
        <EmptyState title="لا توجد درجات بعد" description="ستظهر الدرجات هنا بعد إضافتها." compact />
      ) : (
        <div className="surface-card overflow-hidden">
          <table className="w-full min-w-[480px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">التقييم</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">الدرجة</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">النسبة</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const pct = row.outOf ? (Number(row.score) / Number(row.outOf)) * 100 : 0;
                const { label, color } = gradeLabel(pct);
                return (
                  <tr key={row.id} className={`border-b border-border last:border-0 premium-transition hover:bg-slate-50 ${i % 2 === 0 ? '' : ''}`}>
                    <td className="px-4 py-3 text-[14px] text-text-primary">{row.assessment}</td>
                    <td className="px-4 py-3 text-[14px] font-bold text-text-primary">
                      {formatNumber(row.score)} / {formatNumber(row.outOf)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: color + '18', color }}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{formatDate(row.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
