function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" aria-hidden="true">
      <path d="M12 3a4 4 0 0 0-4 4v2.2c0 .8-.2 1.6-.7 2.3L6 13.4v1.1h12v-1.1l-1.3-1.9a4.2 4.2 0 0 1-.7-2.3V7a4 4 0 0 0-4-4Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 17a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]" aria-hidden="true">
      <path d="m10.5 3 .4 1.8c.1.4.4.7.8.9.4.1.9.1 1.3 0 .4-.2.7-.5.8-.9L14.2 3m4.3 2.5-1.4 1.2c-.3.3-.5.7-.5 1.1s.2.8.5 1.1c.3.3.7.5 1.1.5h1.8m0 4.2h-1.8c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1s.2.8.5 1.1l1.4 1.2M14.2 21l-.4-1.8c-.1-.4-.4-.7-.8-.9a2 2 0 0 0-1.3 0c-.4.2-.7.5-.8.9L10.5 21m-4.3-2.5 1.4-1.2c.3-.3.5-.7.5-1.1s-.2-.8-.5-1.1c-.3-.3-.7-.5-1.1-.5H4.7m0-4.2h1.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1s-.2-.8-.5-1.1L6.2 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function Header({ studentName, className, avatarUrl, notificationsCount = 0, onOpenNotifications, onOpenSettings, onLogout }) {
  return (
    <header className="surface-card px-6 py-4 mb-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={studentName} className="w-11 h-11 rounded-full border border-border object-cover" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-slate-50 border border-border flex items-center justify-center text-[20px]">
            <span className="text-text-secondary text-[16px] font-bold">{studentName?.[0] || 'ط'}</span>
          </div>
        )}
        <div>
          <p className="text-[15px] font-semibold text-text-primary">مرحباً، {studentName}</p>
          {className && <p className="text-[13px] text-text-secondary">الصف {className}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" aria-label="الإشعارات" onClick={onOpenNotifications} className="relative action-btn w-10 h-10 px-0 focus-ring">
          <BellIcon />
          {notificationsCount > 0 && (
            <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {notificationsCount > 9 ? '9+' : notificationsCount}
            </span>
          )}
        </button>
        <button type="button" aria-label="الإعدادات" onClick={onOpenSettings} className="action-btn w-10 h-10 px-0 focus-ring">
          <SettingsIcon />
        </button>
        <button type="button" onClick={onLogout} className="action-btn focus-ring pressable">
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}
