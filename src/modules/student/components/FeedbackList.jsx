import EmptyState from './EmptyState';
import { formatDate } from '../utils/format';

const CATEGORY_STYLE = {
  أكاديمي: { bg: '#EFF6FF', color: '#2C7BE5' },
  سلوك:    { bg: '#FFFBEB', color: '#D97706' },
  واجبات:  { bg: '#F0FDF4', color: '#00C853' },
  أخرى:    { bg: '#F8FAFC', color: '#475569' },
};

export default function FeedbackList({ items = [] }) {
  return (
    <div className="space-y-2">
      {!items.length ? (
        <EmptyState title="لا توجد ملاحظات حالياً" description="ستظهر ملاحظات المعلمين هنا." compact />
      ) : (
        items.slice(0, 6).map((item) => {
          const s = CATEGORY_STYLE[item.category] || CATEGORY_STYLE['أخرى'];
          return (
            <div key={item.id} className="panel-card-hover">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-[14px] font-semibold text-text-primary leading-snug">{item.subjectName}</p>
                <span
                  className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: s.bg, color: s.color }}
                >
                  {item.category}
                </span>
              </div>
              <p className="clamp-2 text-[13px] text-text-secondary leading-[1.7]">{item.preview}</p>
              <p className="mt-2 text-[11px] text-text-secondary">{formatDate(item.date)}</p>
            </div>
          );
        })
      )}
    </div>
  );
}
