import { formatDateTime } from '../utils/format.js';

export default function NotificationsPanel({ items = [] }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <h3 className="mb-3 text-base font-bold text-slate-900">آخر الإشعارات</h3>

      <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {!items.length ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-600">
            لا توجد إشعارات حالياً.
          </p>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-school-blue hover:bg-school-panel"
            >
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-1 max-h-10 overflow-hidden text-xs text-slate-600">{item.message}</p>
              <p className="mt-2 text-[11px] text-slate-500">{formatDateTime(item.createdAt)}</p>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}
