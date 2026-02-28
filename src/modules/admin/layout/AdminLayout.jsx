import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchEnterpriseDashboard } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import { AdminEnterpriseProvider } from '../context/AdminEnterpriseContext';
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
        const insights = await fetchEnterpriseDashboard(token);
        if (!active) return;
        const actionableCount = [
          Number(insights?.pendingFeedbackTickets || 0) > 0,
          Number((insights?.scheduleConflicts || []).length) > 0,
          Number((insights?.highRiskStudents || []).length) > 0,
          Number(insights?.notificationQueue?.unread || 0) > 0,
        ].filter(Boolean).length;
        setNotificationsCount(actionableCount);
      } catch {
        if (active) setNotificationsCount(0);
      }
    };

    load();
    return () => { active = false; };
  }, [token]);

  return (
    <AdminEnterpriseProvider>
      <div className="min-h-screen bg-gray-50" dir="ltr">
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
    </AdminEnterpriseProvider>
  );
}
