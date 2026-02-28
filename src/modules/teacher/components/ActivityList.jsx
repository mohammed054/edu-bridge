import EmptyState from './EmptyState';
import { formatEnglishDateTime } from '../utils/format';

const badgeClassMap = {
  'واجب': 'bg-[var(--ht-amber-100)] text-[var(--ht-amber-600)]',
  'إعلان': 'bg-[var(--ht-primary-100)] text-[var(--ht-primary-700)]',
  'تقييم': 'bg-[var(--ht-success-100)] text-[var(--ht-success-600)]',
};

export default function ActivityList({ items = [], onViewAll }) {
  return (
    <section className="ht-surface p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[24px] font-semibold text-[var(--ht-neutral-900)]">أحدث النشاطات</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="ht-interactive text-[13px] font-medium text-[var(--ht-primary-700)] hover:text-[var(--ht-primary-800)] active:scale-[0.98] focus-visible:outline-none"
        >
          عرض الكل
        </button>
      </div>

      {!items.length ? (
        <EmptyState message="لا توجد بيانات حالياً" />
      ) : (
        <div className="divide-y divide-[var(--ht-border-subtle)]">
          {items.map((item) => (
            <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      badgeClassMap[item.type] || 'bg-[var(--ht-bg-muted)] text-[var(--ht-neutral-600)]'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-[12px] text-[var(--ht-neutral-500)]">{item.className}</span>
                </div>
                <h3 className="text-[15px] font-medium text-[var(--ht-neutral-800)]">{item.title}</h3>
              </div>
              <span className="whitespace-nowrap text-[12px] text-[var(--ht-neutral-400)]">
                {formatEnglishDateTime(item.date)}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
