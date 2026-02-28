import { formatEnglishNumber } from '../utils/format';

export default function ClassCard({ className, studentCount, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ht-surface ht-interactive ht-lift-hover flex min-h-[168px] w-full flex-col justify-center rounded-[6px] border border-[var(--ht-border-subtle)] px-5 py-6 text-right active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
    >
      <span className="mb-3 h-[2px] w-10 bg-[var(--ht-primary-500)]/50" />
      <h3 className="text-center text-[20px] font-semibold text-[var(--ht-neutral-900)]">{className}</h3>
      <p className="mt-3 text-center text-[13px] text-[var(--ht-neutral-500)]">
        عدد الطلاب: {formatEnglishNumber(studentCount)}
      </p>
      <div className="mt-4 border-t border-[var(--ht-border-subtle)]" />
    </button>
  );
}
