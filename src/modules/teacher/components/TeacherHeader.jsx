function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 3a4 4 0 0 0-4 4v2.2c0 .8-.2 1.6-.7 2.3L6 13.4v1.1h12v-1.1l-1.3-1.9a4.2 4.2 0 0 1-.7-2.3V7a4 4 0 0 0-4-4Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 17a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="m10.5 3 .4 1.8c.1.4.4.7.8.9.4.1.9.1 1.3 0 .4-.2.7-.5.8-.9L14.2 3m4.3 2.5-1.4 1.2c-.3.3-.5.7-.5 1.1s.2.8.5 1.1c.3.3.7.5 1.1.5h1.8m0 4.2h-1.8c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1s.2.8.5 1.1l1.4 1.2M14.2 21l-.4-1.8c-.1-.4-.4-.7-.8-.9a2 2 0 0 0-1.3 0c-.4.2-.7.5-.8.9L10.5 21m-4.3-2.5 1.4-1.2c.3-.3.5-.7.5-1.1s-.2-.8-.5-1.1c-.3-.3-.7-.5-1.1-.5H4.7m0-4.2h1.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1s-.2-.8-.5-1.1L6.2 5.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconButton({ label, children, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="ht-interactive inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-subtle)] bg-[var(--ht-bg-base)] text-[var(--ht-neutral-600)] hover:bg-[var(--ht-bg-subtle)] hover:text-[var(--ht-neutral-800)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
    >
      {children}
    </button>
  );
}

export default function TeacherHeader({
  teacherName,
  avatarUrl,
  subjectLabel,
  onOpenNotifications,
  onOpenSettings,
  onOpenSchedule,
  onLogout,
}) {
  return (
    <header className="ht-surface ht-fade-up mb-10 flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl}
          alt={`صورة ${teacherName}`}
          className="h-12 w-12 rounded-full border border-[var(--ht-border-default)] object-cover"
        />
        <div>
          <h1 className="ht-display text-[30px] font-semibold leading-[1.3] text-[var(--ht-neutral-900)]">
            مرحباً، أ. {teacherName}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--ht-neutral-500)]">{subjectLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSchedule}
          className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
        >
          الجدول الأسبوعي
        </button>
        <IconButton label="الإشعارات" onClick={onOpenNotifications}>
          <BellIcon />
        </IconButton>
        <IconButton label="الإعدادات" onClick={onOpenSettings}>
          <SettingsIcon />
        </IconButton>
        <button
          type="button"
          onClick={onLogout}
          className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
}
