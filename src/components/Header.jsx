import { resolveAvatar } from '../utils/format.js';

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 4a5 5 0 0 0-5 5v3.4c0 .8-.2 1.6-.7 2.3L5 17h14l-1.3-2.3a4.8 4.8 0 0 1-.7-2.3V9a5 5 0 0 0-5-5Z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export default function Header({ user, notificationsCount, onLogout, onOpenProfile, onOpenSettings }) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={resolveAvatar(user)}
            alt={`الصورة الشخصية لـ ${user?.name || 'المستخدم'}`}
            className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
          />
          <div>
            <p className="text-xs text-slate-500">الحساب الشخصي</p>
            <h2 className="text-lg font-bold text-slate-900">مرحبا {user?.name || 'الطالب'}</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenProfile}
            className="focus-ring rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-school-blue hover:text-school-blue"
          >
            مشاهدة الملف
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="focus-ring rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-school-blue hover:text-school-blue"
          >
            الإعدادات
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="focus-ring rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          >
            تسجيل الخروج
          </button>
          <button
            type="button"
            className="focus-ring relative inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            aria-label="الإشعارات"
          >
            <BellIcon />
            <span>الإشعارات</span>
            {notificationsCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-school-blue px-1 text-xs text-white">
                {notificationsCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
