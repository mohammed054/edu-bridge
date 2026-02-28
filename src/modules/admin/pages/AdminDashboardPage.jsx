import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchAdminIntelligence,
  fetchAdminOverview,
  fetchAdminReports,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';
import QuickActionCard from '../components/QuickActionCard';
import StatCard from '../components/StatCard';

const quickActions = [
  { id: 'students', label: 'إدارة الطلاب', description: 'إضافة وتعديل الحسابات', to: '/admin/students' },
  { id: 'teachers', label: 'إدارة المعلمين', description: 'ضبط الإسناد الأكاديمي', to: '/admin/teachers' },
  { id: 'classes', label: 'إدارة الصفوف', description: 'متابعة الصفوف الرسمية', to: '/admin/classes' },
  { id: 'schedule', label: 'الجدول الأكاديمي', description: 'عرض الجدول الأسبوعي', to: '/admin/schedule' },
  { id: 'surveys', label: 'الاستبيانات', description: 'متابعة قنوات التقييم', to: '/admin/surveys' },
  { id: 'reports', label: 'التقارير', description: 'مراجعة المؤشرات التشغيلية', to: '/admin/reports' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState(null);
  const [intelligence, setIntelligence] = useState(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [overviewPayload, reportsPayload, intelligencePayload] = await Promise.all([
          fetchAdminOverview(token),
          fetchAdminReports(token),
          fetchAdminIntelligence(token),
        ]);

        if (!active) {
          return;
        }

        setOverview(overviewPayload);
        setReports(reportsPayload);
        setIntelligence(intelligencePayload);
      } catch (loadError) {
        if (active) {
          setError(loadError?.message || 'تعذر تحميل بيانات لوحة التحكم.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [token]);

  const stats = useMemo(() => {
    if (!reports?.totals) {
      return [];
    }

    return [
      { id: 'students', label: 'إجمالي الطلاب', value: reports.totals.students || 0, trend: '', trendDirection: 'up' },
      { id: 'teachers', label: 'إجمالي المعلمين', value: reports.totals.teachers || 0, trend: '', trendDirection: 'up' },
      { id: 'classes', label: 'الصفوف', value: reports.totals.classes || 0, trend: '', trendDirection: 'up' },
      { id: 'subjects', label: 'المواد', value: reports.totals.subjects || 0, trend: '', trendDirection: 'up' },
      { id: 'feedbacks', label: 'التغذية الراجعة', value: reports.totals.feedbacks || 0, trend: '', trendDirection: 'up' },
      { id: 'homeworks', label: 'الواجبات', value: reports.totals.homeworks || 0, trend: '', trendDirection: 'up' },
    ];
  }, [reports]);

  return (
    <div className="page-enter space-y-6 p-1">
      <PageHeading
        title="لوحة التحكم"
        subtitle="متابعة تشغيلية مباشرة للمؤشرات الأكاديمية والانضباطية."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <>
            <div className="skeleton h-[132px]" />
            <div className="skeleton h-[132px]" />
            <div className="skeleton h-[132px]" />
            <div className="skeleton h-[132px]" />
            <div className="skeleton h-[132px]" />
            <div className="skeleton h-[132px]" />
          </>
        ) : (
          stats.map((item) => <StatCard key={item.id} item={item} />)
        )}
      </section>

      <section className="panel-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="h3-premium">إجراءات سريعة</h2>
          <p className="caption-premium">مسارات الإدارة المعتمدة</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action, index) => (
            <div key={action.id} className="animate-fadeUp" style={{ animationDelay: `${index * 28}ms` }}>
              <QuickActionCard
                label={action.label}
                description={action.description}
                onClick={() => navigate(action.to)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="h3-premium">محرك المتابعة</h2>
          <p className="caption-premium">آخر تحديث: {intelligence?.generatedAt ? new Date(intelligence.generatedAt).toLocaleString('en-US') : '-'}</p>
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <article className="panel-card-hover">
              <p className="caption-premium">Risk Index</p>
              <p className="mt-2 text-sm text-text-primary">
                Low: {Number(intelligence?.riskIndex?.Low || 0).toLocaleString('en-US')} | Medium:{' '}
                {Number(intelligence?.riskIndex?.Medium || 0).toLocaleString('en-US')} | High:{' '}
                {Number(intelligence?.riskIndex?.High || 0).toLocaleString('en-US')}
              </p>
            </article>

            <article className="panel-card-hover">
              <p className="caption-premium">Pending responses</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">
                {Number(intelligence?.pendingResponses || 0).toLocaleString('en-US')}
              </p>
            </article>

            <article className="panel-card-hover">
              <p className="caption-premium">Flagged parents / repeated incidents</p>
              <p className="mt-2 text-sm text-text-primary">
                {Number(intelligence?.flaggedParents || 0).toLocaleString('en-US')} /{' '}
                {Number(intelligence?.repeatedIncidents || 0).toLocaleString('en-US')}
              </p>
            </article>

            <article className="panel-card-hover">
              <p className="caption-premium">Smart class alerts</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">
                {Number(intelligence?.classAnalysis?.length || 0).toLocaleString('en-US')}
              </p>
            </article>
          </div>
        )}
      </section>

      <section className="panel-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="h3-premium">Weekly AI Summary</h2>
          <p className="caption-premium">مبني على بيانات النظام الفعلية فقط</p>
        </div>

        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
        ) : (intelligence?.weeklySnapshots || []).length ? (
          <div className="space-y-2">
            {(intelligence?.weeklySnapshots || []).slice(0, 8).map((item) => (
              <article key={`${item.studentId}-${item.className}`} className="rounded-sm border border-border bg-background px-3 py-2">
                <p className="text-sm text-text-primary">
                  {item.studentName}: {item.academicDirection} / {item.riskStatus} risk
                </p>
                <p className="mt-1 text-xs text-text-secondary">{item.attendancePattern}</p>
              </article>
            ))}
          </div>
        ) : (intelligence?.weeklySummary || []).length ? (
          <div className="space-y-2">
            {(intelligence?.weeklySummary || []).slice(0, 8).map((line, index) => (
              <article key={`${line}-${index}`} className="rounded-sm border border-border bg-background px-3 py-2">
                <p className="text-sm text-text-primary">{line}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">لا توجد بيانات كافية لتوليد الملخص الأسبوعي.</p>
        )}
      </section>

      <section className="panel-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="h3-premium">Smart Class Analysis</h2>
          <p className="caption-premium">Suggestions only - no automatic actions</p>
        </div>
        {(intelligence?.classAnalysis || []).length ? (
          <div className="space-y-2">
            {(intelligence?.classAnalysis || []).slice(0, 8).map((item, index) => (
              <article key={`${item.type}-${item.className}-${index}`} className="rounded-sm border border-border bg-background px-3 py-2">
                <p className="text-sm text-text-primary">{item.message}</p>
                <p className="mt-1 text-xs text-text-secondary">{item.suggestion}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No significant class-level alerts this week.</p>
        )}
      </section>

      <section className="panel-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="h3-premium">الملخص العام</h2>
          <p className="caption-premium">
            صفوف: {Number(overview?.classes?.length || 0).toLocaleString('en-US')} | معلمون:{' '}
            {Number(overview?.teachers?.length || 0).toLocaleString('en-US')} | طلاب:{' '}
            {Number(overview?.students?.length || 0).toLocaleString('en-US')}
          </p>
        </div>
      </section>
    </div>
  );
}
