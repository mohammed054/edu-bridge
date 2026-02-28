import EmptyState from './EmptyState';
import { formatDate, formatNumber } from '../utils/format';

const CATEGORY_STYLE = {
  أكاديمي: { bg: '#EFF6FF', color: '#2C7BE5' },
  سلوك:    { bg: '#FFFBEB', color: '#D97706' },
  واجبات:  { bg: '#F0FDF4', color: '#00C853' },
  أخرى:    { bg: '#F8FAFC', color: '#475569' },
};

export default function Sidebar({ summary, recentFeedback = [] }) {
  const metrics = [
    { label: 'الواجبات',     value: summary?.homeworkCount ?? 0,                        accent: '#2C7BE5' },
    { label: 'المتوسط',     value: `${formatNumber(summary?.averageGrade ?? 0, 1)}٪`,   accent: '#00C853' },
    { label: 'الملاحظات',   value: summary?.feedbackCount ?? 0,                         accent: '#FFB300' },
  ];

  return (
    <aside className="space-y-4">
      {/* Quick stats */}
      <div className="panel-card">
        <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide mb-3">ملخص المادة</p>
        <div className="space-y-2">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-[13px] text-text-secondary">{m.label}</span>
              <strong className="text-[16px] font-bold" style={{ color: m.accent }}>{m.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="panel-card">
        <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wide mb-3">ملاحظات المادة</p>
        {!recentFeedback.length ? (
          <EmptyState title="لا توجد ملاحظات" compact />
        ) : (
          <div className="space-y-3">
            {recentFeedback.slice(0, 4).map((item) => {
              const s = CATEGORY_STYLE[item.category] || CATEGORY_STYLE['أخرى'];
              return (
                <div key={item.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                      {item.category}
                    </span>
                    <span className="text-[11px] text-text-secondary">{formatDate(item.date)}</span>
                  </div>
                  <p className="clamp-2 text-[12px] text-text-secondary leading-relaxed">{item.preview}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
