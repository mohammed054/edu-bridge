import EmptyState from './EmptyState';
import { formatEnglishDateTime, formatEnglishNumber } from '../utils/format';

const statusLabelMap = {
  pending: 'قيد الانتظار',
  submitted: 'مسلّم',
  graded: 'مكتمل',
};

export default function HomeworkList({ items = [], onCreate, onEdit, onDelete, onOpenDetail }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[20px] font-semibold text-[var(--ht-neutral-900)]">الواجبات</h3>
        <button
          type="button"
          onClick={onCreate}
          className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
        >
          + إضافة واجب
        </button>
      </div>

      {!items.length ? (
        <EmptyState message="لا توجد بيانات حالياً" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const pendingCount = item.assignments.filter((assignment) => assignment.status === 'pending').length;
            const submittedCount = item.assignments.filter((assignment) => assignment.status === 'submitted').length;
            const gradedCount = item.assignments.filter((assignment) => assignment.status === 'graded').length;
            const totalCount = item.assignments.length;

            return (
              <article key={item.id} className="ht-surface p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-[16px] font-semibold text-[var(--ht-neutral-900)]">{item.title}</h4>
                  <span className="text-[12px] text-[var(--ht-neutral-400)]">
                    التسليم: {formatEnglishDateTime(item.dueDate)}
                  </span>
                </div>

                <p className="text-[14px] leading-[1.9] text-[var(--ht-neutral-700)]">{item.description || '-'}</p>
                {item.attachmentName ? (
                  <p className="mt-3 text-[13px] text-[var(--ht-neutral-500)]">المرفق: {item.attachmentName}</p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[var(--ht-neutral-500)]">
                  <span>عدد التسليمات: {formatEnglishNumber(totalCount)}</span>
                  <span>مسلّم: {formatEnglishNumber(submittedCount)}</span>
                  <span>مكتمل: {formatEnglishNumber(gradedCount)}</span>
                  <span>معلّق: {formatEnglishNumber(pendingCount)}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(item)}
                    className="ht-interactive rounded-[4px] border border-[var(--ht-border-default)] px-3 py-1.5 text-[12px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none"
                  >
                    فتح التفاصيل
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="ht-interactive rounded-[4px] border border-[var(--ht-border-default)] px-3 py-1.5 text-[12px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="ht-interactive rounded-[4px] border border-[var(--ht-border-default)] px-3 py-1.5 text-[12px] text-[var(--ht-danger-600)] hover:bg-[var(--ht-danger-100)] active:scale-[0.98] focus-visible:outline-none"
                  >
                    حذف
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.keys(statusLabelMap).map((statusKey) => {
                    const statusCount = item.assignments.filter((assignment) => assignment.status === statusKey).length;
                    return (
                      <span
                        key={statusKey}
                        className="rounded-full border border-[var(--ht-border-subtle)] bg-[var(--ht-bg-subtle)] px-2 py-1 text-[11px] text-[var(--ht-neutral-600)]"
                      >
                        {statusLabelMap[statusKey]}: {formatEnglishNumber(statusCount)}
                      </span>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
