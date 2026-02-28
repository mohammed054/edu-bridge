import EmptyState from './EmptyState';
import { formatEnglishDateTime, formatEnglishNumber } from '../utils/format';

export default function GradeTable({ rows = [], onAdd, onImport, onEdit }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[20px] font-semibold text-[var(--ht-neutral-900)]">الدرجات</h3>
        <div className="flex flex-wrap items-center gap-2">
          {onImport ? (
            <button
              type="button"
              onClick={onImport}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
            >
              + استيراد بالذكاء الاصطناعي
            </button>
          ) : null}
          <button
            type="button"
            onClick={onAdd}
            className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
          >
            + إدخال درجات
          </button>
        </div>
      </div>

      {!rows.length ? (
        <EmptyState message="لا توجد بيانات حالياً" />
      ) : (
        <div className="ht-surface ht-scroll overflow-x-auto">
          <table className="min-w-full border-collapse text-right">
            <thead className="bg-[var(--ht-bg-subtle)]">
              <tr>
                {['اسم الطالب', 'التقييم', 'الدرجة', 'من', 'التاريخ', 'تعديل'].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--ht-neutral-500)]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.studentId} className="border-t border-[var(--ht-border-subtle)]">
                  <td className="whitespace-nowrap px-4 py-3 text-[14px] text-[var(--ht-neutral-800)]">{row.studentName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[14px] text-[var(--ht-neutral-700)]">{row.examTitle || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[14px] text-[var(--ht-neutral-700)]">
                    {row.score === null || row.score === undefined ? '-' : formatEnglishNumber(row.score, 2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[14px] text-[var(--ht-neutral-700)]">
                    {row.maxMarks === null || row.maxMarks === undefined ? '-' : formatEnglishNumber(row.maxMarks, 2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13px] text-[var(--ht-neutral-500)]">
                    {formatEnglishDateTime(row.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="ht-interactive rounded-[4px] border border-[var(--ht-border-default)] px-3 py-1.5 text-[12px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none"
                    >
                      تعديل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
