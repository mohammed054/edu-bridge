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
    if (!token) {
      setNotificationsCount(0);
      return undefined;
    }

    let active = true;

    const loadHeaderNotifications = async () => {
      try {
        const insights = await fetchAdminIntelligence(token);
        if (!active) {
          return;
        }

        let count = 0;
        if (Number(insights?.pendingResponses || 0) > 0) {
          count += 1;
        }
        if (Number(insights?.flaggedParents || 0) > 0) {
          count += 1;
        }
        if (Number(insights?.riskIndex?.High || 0) > 0) {
          count += 1;
        }

        setNotificationsCount(count);
      } catch {
        if (active) {
          setNotificationsCount(0);
        }
      }
    };

    loadHeaderNotifications();

    return () => {
      active = false;
    };
  }, [token]);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`premium-transition ${collapsed ? 'lg:pr-[92px]' : 'lg:pr-[288px]'}`}>
        <AdminHeader
          collapsed={collapsed}
          onOpenMobileMenu={() => setMobileOpen(true)}
          notificationsCount={notificationsCount}
        />

        <main className="px-4 pb-6 pt-[94px] md:px-6">
          <div className="h-[calc(100vh-112px)] overflow-y-auto rounded-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
