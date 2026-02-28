import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import Header from './Header.jsx';

const ROLE_TEXT = {
  admin: {
    title: 'لوحة الإدارة',
    subtitle: 'يمكنك إدارة المستخدمين والتقارير من لوحة الإدارة الرئيسية.',
  },
  teacher: {
    title: 'لوحة المعلم',
    subtitle: 'يمكنك متابعة الصفوف المخصصة لك وإرسال التغذية الراجعة.',
  },
};

export default function RoleDashboard() {
  const { session, logout } = useAuth();
  const role = session?.user?.role || 'teacher';

  const roleContent = useMemo(() => ROLE_TEXT[role] || ROLE_TEXT.teacher, [role]);

  return (
    <main className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Header
          user={session?.user}
          notificationsCount={0}
          onLogout={logout}
          onOpenProfile={() => {}}
          onOpenSettings={() => {}}
        />

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h1 className="text-xl font-extrabold text-slate-900">{roleContent.title}</h1>
            <p className="mt-3 text-sm text-slate-600">{roleContent.subtitle}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-soft">
            <p className="text-sm font-semibold text-slate-700">الحساب الحالي</p>
            <p className="mt-2 text-sm text-slate-600">{session?.user?.name || '-'}</p>
            <p className="mt-1 text-xs text-slate-500">{session?.user?.email || session?.user?.username || '-'}</p>
          </article>
        </section>
      </div>
    </main>
  );
}
