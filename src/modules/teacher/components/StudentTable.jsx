import EmptyState from './EmptyState';

export default function StudentTable({ rows = [], onViewProfile }) {
  return (
    <section className="space-y-4">
      <h3 className="text-[20px] font-semibold text-[var(--ht-neutral-900)]">الطلاب</h3>

      {!rows.length ? (
        <EmptyState message="لا توجد بيانات حالياً" />
      ) : (
        <div className="ht-surface ht-scroll overflow-x-auto">
          <table className="min-w-full border-collapse text-right">
            <thead className="bg-[var(--ht-bg-subtle)]">
              <tr>
                {['الصورة', 'الاسم الكامل', 'البريد الإلكتروني', 'الحالة', 'عرض الملف'].map((header) => (
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
              {rows.map((student) => (
                <tr key={student.id} className="border-t border-[var(--ht-border-subtle)]">
                  <td className="px-4 py-3">
                    <img
                      src={student.avatarUrl}
                      alt={`صورة ${student.name}`}
                      className="h-9 w-9 rounded-full border border-[var(--ht-border-default)] object-cover"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[14px] text-[var(--ht-neutral-800)]">{student.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[14px] text-[var(--ht-neutral-600)]">{student.email || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="rounded-full border border-[var(--ht-border-subtle)] bg-[var(--ht-bg-subtle)] px-2 py-1 text-[11px] text-[var(--ht-neutral-600)]">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onViewProfile(student)}
                      className="ht-interactive rounded-[4px] border border-[var(--ht-border-default)] px-3 py-1.5 text-[12px] text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none"
                    >
                      عرض الملف
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
