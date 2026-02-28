import { NavLink } from 'react-router-dom';
import { ChevronIcon, MenuIcon } from '../components/AdminIcons';
import { adminNavItems } from './navConfig';

export default function AdminSidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-900/25 lg:hidden"
          aria-label="إغلاق القائمة"
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-40 h-screen border-l border-border bg-surface/95 backdrop-blur-md premium-transition ${
          collapsed ? 'w-[92px]' : 'w-[288px]'
        } ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-3 py-4">
            <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-card-gradient text-base font-bold text-primary">
                ح
              </span>
              {!collapsed ? (
                <div className="space-y-0">
                  <p className="text-sm font-semibold text-text-primary">Hikmah School</p>
                  <p className="text-xs text-text-secondary">منصة الإدارة</p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="focus-ring premium-transition hidden rounded-sm border border-border p-2 text-text-secondary hover:border-primary hover:text-primary lg:inline-flex"
              aria-label="طي القائمة"
            >
              {collapsed ? <MenuIcon className="h-4 w-4" /> : <ChevronIcon className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <ul className="space-y-1">
              {adminNavItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={item.key} className="animate-fadeUp" style={{ animationDelay: `${index * 22}ms` }}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/admin'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 overflow-hidden rounded-sm py-3 text-sm font-semibold premium-transition pressable ${
                          isActive
                            ? 'bg-sidebar-active text-primary shadow-sm'
                            : 'text-text-secondary hover:bg-background hover:text-primary'
                        } ${collapsed ? 'justify-center px-2' : 'px-3'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`premium-transition absolute right-0 top-2 h-[calc(100%-16px)] w-1 rounded-l-full bg-primary ${
                              isActive ? 'scale-y-100 opacity-100' : 'scale-y-75 opacity-0'
                            }`}
                          />
                          <Icon className="h-4 w-4 shrink-0" />
                          {!collapsed ? <span>{item.label}</span> : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
