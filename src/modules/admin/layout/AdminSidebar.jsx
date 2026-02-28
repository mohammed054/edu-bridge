import { NavLink } from 'react-router-dom';
import { ChevronIcon, MenuIcon } from '../components/AdminIcons';
import { useAdminEnterprise } from '../context/AdminEnterpriseContext';
import { adminNavGroups } from './navConfig';

export default function AdminSidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) {
  const {
    loading,
    error,
    hierarchy,
    availableYears,
    availableGrades,
    availableClasses,
    selectedYear,
    selectedGrade,
    selectedClassId,
    setSelectedYear,
    setSelectedGrade,
    setSelectedClassId,
  } = useAdminEnterprise();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          aria-label="Close menu"
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-40 flex h-screen flex-col bg-white premium-transition ${
          collapsed ? 'w-[64px]' : 'w-[240px]'
        } ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
        style={{ borderLeft: '1px solid #E5E7EB' }}
      >
        <div className={`flex h-[64px] shrink-0 items-center border-b border-gray-100 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{hierarchy?.institution?.name || 'Institution'}</p>
              <p className="mt-px truncate text-[11px] text-gray-400">Enterprise Admin</p>
            </div>
          ) : null}

          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
            E
          </span>

          {!collapsed ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 premium-transition lg:flex"
              aria-label="Collapse"
            >
              <ChevronIcon className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="absolute bottom-4 right-1/2 hidden h-7 w-7 translate-x-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 premium-transition lg:flex"
              aria-label="Expand"
            >
              <MenuIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {!collapsed ? (
          <div className="border-b border-gray-100 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Hierarchy Context</p>
            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-8" />
                <div className="skeleton h-8" />
                <div className="skeleton h-8" />
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={selectedYear}
                  onChange={(event) => {
                    const nextYear = event.target.value;
                    setSelectedYear(nextYear);
                    const nextGrade = Object.keys((hierarchy?.hierarchy || {})[nextYear] || {})[0] || '';
                    setSelectedGrade(nextGrade);
                    const nextClass = ((hierarchy?.hierarchy || {})[nextYear] || {})[nextGrade]?.[0];
                    setSelectedClassId(nextClass?.id || '');
                  }}
                  className="focus-ring w-full rounded-sm border border-border bg-white px-2 py-2 text-xs"
                >
                  {availableYears.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <select
                  value={selectedGrade}
                  onChange={(event) => {
                    const nextGrade = event.target.value;
                    setSelectedGrade(nextGrade);
                    const nextClass = (((hierarchy?.hierarchy || {})[selectedYear] || {})[nextGrade] || [])[0];
                    setSelectedClassId(nextClass?.id || '');
                  }}
                  className="focus-ring w-full rounded-sm border border-border bg-white px-2 py-2 text-xs"
                >
                  {availableGrades.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>

                <select
                  value={selectedClassId}
                  onChange={(event) => setSelectedClassId(event.target.value)}
                  className="focus-ring w-full rounded-sm border border-border bg-white px-2 py-2 text-xs"
                >
                  {availableClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>

                {error ? <p className="text-[10px] text-danger">{error}</p> : null}
              </div>
            )}
          </div>
        ) : null}

        <nav className="flex-1 overflow-y-auto px-2.5 py-3" style={{ scrollbarWidth: 'none' }}>
          {adminNavGroups.map((group, index) => (
            <div key={group.key} className={index > 0 ? 'mt-4' : ''}>
              {group.label && !collapsed ? (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{group.label}</p>
              ) : null}
              {group.label && collapsed ? <div className="mx-auto mb-3 h-px w-6 bg-gray-200" /> : null}

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
                          `group relative flex items-center gap-2.5 rounded-md py-2 text-[13px] font-medium premium-transition ${
                            collapsed ? 'justify-center px-2' : 'px-2.5'
                          } ${
                            isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && !collapsed ? <span className="absolute right-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-l-full bg-gray-900" /> : null}
                            <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            {!collapsed ? <span>{item.label}</span> : null}
                            {collapsed ? (
                              <span className="pointer-events-none absolute right-full z-50 mr-2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 opacity-0 shadow-sm premium-transition group-hover:opacity-100">
                                {item.label}
                              </span>
                            ) : null}
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
