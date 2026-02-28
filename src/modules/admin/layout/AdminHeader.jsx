import { BellIcon, LogoutIcon, MenuIcon } from '../components/AdminIcons';
import { useAuth } from '../../../core/auth/useAuth';

const initials = (name = '') =>
  String(name)
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

export default function AdminHeader({ collapsed, onOpenMobileMenu, notificationsCount = 0 }) {
  const { user, logout } = useAuth();
  const userName = user?.name || 'مدير النظام';

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-20 border-b border-border bg-surface/92 backdrop-blur-md premium-transition ${
        collapsed ? 'lg:right-[92px]' : 'lg:right-[288px]'
      }`}
    >
      <div className="flex h-[80px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="focus-ring premium-transition inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-secondary hover:border-primary hover:text-primary lg:hidden"
            aria-label="فتح القائمة"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-card-gradient text-lg font-bold text-primary">
              ح
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">Hikmah School</p>
              <p className="text-xs text-text-secondary">لوحة الإدارة</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="focus-ring premium-transition relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-secondary hover:-translate-y-px hover:border-primary hover:text-primary hover:shadow-[0_0_0_3px_rgba(44,123,229,0.12)]"
            aria-label="الإشعارات"
          >
            <BellIcon className="h-[22px] w-[22px]" />
            {notificationsCount > 0 && (
              <span className="absolute -left-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1 text-xs font-bold text-white">
                {notificationsCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1 shadow-sm">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/12 text-sm font-bold text-primary">
              {initials(userName) || 'م'}
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-text-primary">{userName}</p>
              <p className="text-xs text-text-secondary">الإدارة</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="action-btn"
          >
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden md:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}
