import EmptyState from './EmptyState';
import { formatDate } from '../utils/format';

const TYPE_STYLE = {
  'موعد نهائي': { bg: '#FEF2F2', color: '#D32F2F', dot: '#D32F2F' },
  إعلان:        { bg: '#EFF6FF', color: '#2C7BE5', dot: '#2C7BE5' },
  ملف:          { bg: '#F8FAFC', color: '#475569', dot: '#94A3B8' },
  نموذج:        { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B' },
};

const getStyle = (type) => TYPE_STYLE[type] || { bg: '#F8FAFC', color: '#475569', dot: '#94A3B8' };

export default function AnnouncementsList({ items = [], featured }) {
  return (
    <aside className="space-y-3">
      <p className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide px-1">الإعلانات</p>

      {featured && (
        <div className="rounded-md border-r-4 bg-red-50 border border-red-100 p-4" style={{ borderRightColor: '#D32F2F' }}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold text-danger uppercase tracking-wide">{featured.type}</span>
            <span className="text-[11px] text-text-secondary">{formatDate(featured.date)}</span>
          </div>
          <p className="text-[13px] font-semibold text-text-primary mb-1">{featured.title}</p>
          <p className="text-[12px] text-text-secondary leading-relaxed clamp-3">{featured.description}</p>
        </div>
      )}

      {!items.length ? (
        <EmptyState title="لا توجد إعلانات" description="ستظهر إعلانات المدرسة هنا." compact />
      ) : (
        items.map((item) => {
          const s = getStyle(item.type);
          return (
            <div key={item.id} className="panel-card-hover flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: s.dot }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: s.color }}>{item.type}</span>
                  <span className="text-[11px] text-text-secondary">{formatDate(item.date)}</span>
                </div>
                <p className="text-[13px] font-semibold text-text-primary leading-snug mb-1">{item.title}</p>
                <p className="clamp-2 text-[12px] text-text-secondary leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })
      )}
    </aside>
  );
}
