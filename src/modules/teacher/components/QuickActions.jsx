export default function QuickActions({
  onPost,
  onHomework,
  onGrade,
  onGradeImport,
  disabled = false,
}) {
  const actionClass =
    'ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2';

  return (
    <section className="ht-surface p-5 sm:p-6">
      <h2 className="mb-5 text-[24px] font-semibold text-[var(--ht-neutral-900)]">إجراءات سريعة</h2>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onPost} disabled={disabled} className={actionClass}>
          نشر إعلان
        </button>
        <button type="button" onClick={onHomework} disabled={disabled} className={actionClass}>
          إضافة واجب
        </button>
        <button type="button" onClick={onGrade} disabled={disabled} className={actionClass}>
          إدخال درجات
        </button>
        <button type="button" onClick={onGradeImport} disabled={disabled} className={actionClass}>
          استيراد درجات بالذكاء الاصطناعي
        </button>
      </div>
    </section>
  );
}
