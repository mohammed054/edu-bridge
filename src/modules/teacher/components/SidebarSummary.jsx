import EmptyState from './EmptyState';
import { formatEnglishDateTime, formatEnglishNumber } from '../utils/format';

function SummaryMetric({ label, value }) {
  return (
    <div className="ht-soft-surface px-4 py-3">
      <p className="text-[12px] text-[var(--ht-neutral-500)]">{label}</p>
      <p className="mt-1 text-[20px] font-semibold text-[var(--ht-neutral-900)]">{value}</p>
    </div>
  );
}

const submissionStatusLabel = {
  pending: 'قيد الانتظار',
  submitted: 'مسلّم',
  graded: 'مكتمل',
};

export default function SidebarSummary({ summary, recentSubmissions = [] }) {
  return (
    <aside className="space-y-4">
      <section className="ht-surface p-4">
        <h3 className="mb-4 text-[18px] font-semibold text-[var(--ht-neutral-900)]">ملخص الفصل</h3>
        <div className="space-y-3">
          <SummaryMetric label="عدد الطلاب" value={formatEnglishNumber(summary.studentCount)} />
          <SummaryMetric label="عدد الواجبات" value={formatEnglishNumber(summary.homeworkCount)} />
          <SummaryMetric label="متوسط الدرجات" value={`${formatEnglishNumber(summary.averageGrade, 1)}%`} />
          <SummaryMetric label="عدد الإعلانات" value={formatEnglishNumber(summary.announcementCount)} />
        </div>
      </section>

      <section className="ht-surface p-4">
        <h3 className="mb-4 text-[18px] font-semibold text-[var(--ht-neutral-900)]">آخر التسليمات</h3>
        {!recentSubmissions.length ? (
          <EmptyState message="لا توجد بيانات حالياً" />
        ) : (
          <div className="space-y-3">
            {recentSubmissions.map((item) => (
              <article key={item.id} className="rounded-[4px] border border-[var(--ht-border-subtle)] p-3">
                <p className="text-[13px] font-medium text-[var(--ht-neutral-800)]">{item.studentName}</p>
                <p className="mt-1 text-[12px] text-[var(--ht-neutral-600)]">{item.homeworkTitle}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--ht-bg-subtle)] px-2 py-1 text-[11px] text-[var(--ht-neutral-600)]">
                    {submissionStatusLabel[item.status] || item.status}
                  </span>
                  <span className="text-[11px] text-[var(--ht-neutral-400)]">{formatEnglishDateTime(item.updatedAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
