import { NavLink } from 'react-router-dom';
import { ChevronIcon, MenuIcon } from '../components/AdminIcons';
import { adminNavGroups } from './navConfig';

export default function AdminSidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="إغلاق القائمة"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-40 h-screen flex flex-col bg-white premium-transition
          ${collapsed ? 'w-[64px]' : 'w-[240px]'}
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0`}
        style={{ borderLeft: '1px solid #E5E7EB' }}
      >
        {/* Brand */}
        <div
          className={`flex h-[64px] shrink-0 items-center border-b border-gray-100 px-4
            ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white"
              >
                ح
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Hikmah School</p>
                <p className="text-[11px] text-gray-400 mt-px">لوحة الإدارة</p>
              </div>
            </div>
          )}

          {collapsed && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
              ح
            </span>
          )}

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 premium-transition"
              aria-label="طي القائمة"
            >
              <ChevronIcon className="h-3.5 w-3.5" />
            </button>
          )}

          {collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="absolute bottom-4 right-1/2 translate-x-1/2 hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 premium-transition"
              aria-label="توسيع القائمة"
            >
              <MenuIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5" style={{ scrollbarWidth: 'none' }}>
          {adminNavGroups.map((group, gi) => (
            <div key={group.key} className={gi > 0 ? 'mt-4' : ''}>
              {group.label && !collapsed && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {group.label}
                </p>
              )}
              {group.label && collapsed && (
                <div className="mx-auto mb-3 h-px w-6 bg-gray-200" />
              )}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/admin'}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-2.5 rounded-md py-2 text-[13px] font-medium premium-transition
                          ${collapsed ? 'justify-center px-2' : 'px-2.5'}
                          ${isActive
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && !collapsed && (
                              <span className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-l-full bg-gray-900" />
                            )}

                            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />

                            {!collapsed && <span>{item.label}</span>}

                            {collapsed && (
                              <span
                                className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm
                                  opacity-0 group-hover:opacity-100 premium-transition z-50"
                              >
                                {item.label}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
