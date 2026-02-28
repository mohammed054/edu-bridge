import { useLocation } from 'react-router-dom';
import { BellIcon, LogoutIcon, MenuIcon } from '../components/AdminIcons';
import { useAdminEnterprise } from '../context/AdminEnterpriseContext';
import { useAuth } from '../../../core/auth/useAuth';

const initials = (name = '') =>
  String(name)
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

const PAGE_TITLES = {
  '/admin': 'Enterprise Dashboard',
  '/admin/students': 'Student Management',
  '/admin/teachers': 'Teacher Management',
  '/admin/classes': 'Class Management',
  '/admin/subjects': 'Subject Management',
  '/admin/schedule': 'Scheduling Engine',
  '/admin/feedback': 'Ticket Workflow',
  '/admin/surveys': 'Survey Lifecycle',
  '/admin/notifications': 'Notification Workflow',
  '/admin/import-users': 'Bulk Import Users',
  '/admin/reports': 'Analytics and Reports',
  '/admin/settings': 'System Settings',
};

export default function AdminHeader({ collapsed, onOpenMobileMenu, notificationsCount = 0 }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { breadcrumbs } = useAdminEnterprise();

  const pageTitle = PAGE_TITLES[pathname] || 'Admin';
  const userName = user?.name || 'Admin User';

  return (
    <header
      className={`fixed left-0 top-0 z-20 flex h-[64px] items-center justify-between border-b border-gray-100 bg-white px-5 premium-transition ${
        collapsed ? 'lg:right-[64px]' : 'lg:right-[240px]'
      } right-0`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 premium-transition lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold text-gray-900">{pageTitle}</h1>
          <p className="truncate text-[11px] text-gray-400">{breadcrumbs.join(' > ')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 premium-transition"
          aria-label="Notifications"
        >
          <BellIcon className="h-4 w-4" />
          {notificationsCount > 0 ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" /> : null}
        </button>

        <div className="mx-1 h-4 w-px bg-gray-200" />

        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="hidden text-right sm:block">
            <p className="text-[13px] font-semibold leading-tight text-gray-800">{userName}</p>
            <p className="text-[11px] text-gray-400">{user?.adminProfile || 'admin'}</p>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
            {initials(userName) || 'A'}
          </span>
        </div>

        <div className="mx-1 h-4 w-px bg-gray-200" />

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 premium-transition"
        >
          <LogoutIcon className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
