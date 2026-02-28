export default function EmptyState({ message = 'لا توجد بيانات حالياً', action }) {
  return (
    <div className="ht-soft-surface flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 h-10 w-10 rounded-full border border-[var(--ht-border-default)] bg-[var(--ht-bg-base)]" />
      <p className="text-[16px] leading-[1.8] text-[var(--ht-neutral-700)]">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
