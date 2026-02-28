import { BellIcon, LogoutIcon, MenuIcon } from '../components/AdminIcons';
import { useAuth } from '../../../core/auth/useAuth';
import { useLocation } from 'react-router-dom';

const initials = (name = '') =>
  String(name).trim().split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('');

const PAGE_TITLES = {
  '/admin':               'لوحة التحكم',
  '/admin/students':      'الطلاب',
  '/admin/teachers':      'المعلمون',
  '/admin/classes':       'الصفوف',
  '/admin/subjects':      'المواد',
  '/admin/schedule':      'الجدول الأكاديمي',
  '/admin/feedback':      'التغذية الراجعة',
  '/admin/surveys':       'الاستبيانات',
  '/admin/notifications': 'الإشعارات',
  '/admin/import-users':  'استيراد المستخدمين',
  '/admin/reports':       'التقارير',
  '/admin/settings':      'الإعدادات',
};

export default function AdminHeader({ collapsed, onOpenMobileMenu, notificationsCount = 0 }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const userName = user?.name || 'مدير النظام';
  const pageTitle = PAGE_TITLES[pathname] || 'لوحة التحكم';

  return (
    <header
      className={`fixed left-0 top-0 z-20 flex h-[64px] items-center justify-between border-b border-gray-100 bg-white px-5 premium-transition
        ${collapsed ? 'lg:right-[64px]' : 'lg:right-[240px]'}
        right-0`}
    >
      {/* Left: mobile toggle + page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 premium-transition lg:hidden"
          aria-label="فتح القائمة"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
        <h1 className="text-[15px] font-semibold text-gray-900">{pageTitle}</h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 premium-transition"
          aria-label="الإشعارات"
        >
          <BellIcon className="h-4 w-4" />
          {notificationsCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>

        <div className="mx-1 h-4 w-px bg-gray-200" />

        {/* User */}
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="hidden text-right sm:block">
            <p className="text-[13px] font-semibold text-gray-800 leading-tight">{userName}</p>
            <p className="text-[11px] text-gray-400">مدير النظام</p>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
            {initials(userName) || 'م'}
          </span>
        </div>

        <div className="mx-1 h-4 w-px bg-gray-200" />

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 premium-transition"
        >
          <LogoutIcon className="h-3.5 w-3.5" />
          <span className="hidden md:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
