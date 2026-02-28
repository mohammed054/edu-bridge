import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchAdminIntelligence } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const { token } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    if (!token) { setNotificationsCount(0); return undefined; }
    let active = true;

    const load = async () => {
      try {
        const insights = await fetchAdminIntelligence(token);
        if (!active) return;
        let count = 0;
        if (Number(insights?.pendingResponses || 0) > 0) count++;
        if (Number(insights?.flaggedParents    || 0) > 0) count++;
        if (Number(insights?.riskIndex?.High   || 0) > 0) count++;
        setNotificationsCount(count);
      } catch {
        if (active) setNotificationsCount(0);
      }
    };

    load();
    return () => { active = false; };
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((p) => !p)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`premium-transition ${collapsed ? 'lg:pr-[64px]' : 'lg:pr-[240px]'}`}>
        <AdminHeader
          collapsed={collapsed}
          onOpenMobileMenu={() => setMobileOpen(true)}
          notificationsCount={notificationsCount}
        />

        <main className="px-4 pb-10 pt-[80px] md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
