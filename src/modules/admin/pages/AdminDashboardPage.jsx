import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchAdminIntelligence,
  fetchAdminOverview,
  fetchAdminReports,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import QuickActionCard from '../components/QuickActionCard';
import StatCard from '../components/StatCard';

const quickActions = [
  { id: 'students', label: 'إدارة الطلاب',     description: 'إضافة وتعديل الحسابات',     to: '/admin/students' },
  { id: 'teachers', label: 'إدارة المعلمين',   description: 'ضبط الإسناد الأكاديمي',     to: '/admin/teachers' },
  { id: 'classes',  label: 'إدارة الصفوف',     description: 'متابعة الصفوف الرسمية',     to: '/admin/classes'  },
  { id: 'schedule', label: 'الجدول الأكاديمي', description: 'عرض الجدول الأسبوعي',       to: '/admin/schedule' },
  { id: 'surveys',  label: 'الاستبيانات',      description: 'متابعة قنوات التقييم',      to: '/admin/surveys'  },
  { id: 'reports',  label: 'التقارير',          description: 'مراجعة المؤشرات التشغيلية', to: '/admin/reports'  },
];

const RISK_LEVEL = {
  Low:    { label: 'منخفض', className: 'bg-green-50 text-green-700 border-green-100' },
  Medium: { label: 'متوسط', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  High:   { label: 'مرتفع', className: 'bg-red-50 text-red-600 border-red-100'      },
};

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

function SectionHeader({ title, meta }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
      {meta && <p className="text-[11px] text-gray-400">{meta}</p>}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl bg-white p-5 ${className}`} style={{ border: '1px solid #E5E7EB' }}>
      {children}
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3.5" style={{ border: '1px solid #F3F4F6' }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [reports,      setReports]      = useState(null);
  const [intelligence, setIntelligence] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [, reportsPayload, intelligencePayload] = await Promise.all([
          fetchAdminOverview(token),
          fetchAdminReports(token),
          fetchAdminIntelligence(token),
        ]);
        if (!active) return;
        setReports(reportsPayload);
        setIntelligence(intelligencePayload);
      } catch (err) {
        if (active) setError(err?.message || 'تعذر تحميل بيانات لوحة التحكم.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [token]);

  const stats = useMemo(() => {
    if (!reports?.totals) return [];
    return [
      { id: 'students',  label: 'إجمالي الطلاب',   value: reports.totals.students  || 0, trendDirection: 'up' },
      { id: 'teachers',  label: 'إجمالي المعلمين',  value: reports.totals.teachers  || 0, trendDirection: 'up' },
      { id: 'classes',   label: 'الصفوف',            value: reports.totals.classes   || 0, trendDirection: 'up' },
      { id: 'subjects',  label: 'المواد',            value: reports.totals.subjects  || 0, trendDirection: 'up' },
      { id: 'feedbacks', label: 'التغذية الراجعة',   value: reports.totals.feedbacks || 0, trendDirection: 'up' },
      { id: 'homeworks', label: 'الواجبات',          value: reports.totals.homeworks || 0, trendDirection: 'up' },
    ];
  }, [reports]);

  const riskIndex   = intelligence?.riskIndex   || {};
  const weeklyItems = intelligence?.weeklySnapshots || intelligence?.weeklySummary || [];
  const classAlerts = intelligence?.classAnalysis   || [];
  const updatedAt   = intelligence?.generatedAt
    ? new Date(intelligence.generatedAt).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="page-enter space-y-5">

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── KPIs ── */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[108px]" />)
          : stats.map((item) => <StatCard key={item.id} item={item} />)
        }
      </section>

      {/* ── Quick Actions + Intelligence ── */}
      <div className="grid gap-4 xl:grid-cols-2">

        {/* Quick Actions */}
        <Card>
          <SectionHeader title="الإجراءات السريعة" meta="مسارات الإدارة المعتمدة" />
          <div className="grid gap-2.5 sm:grid-cols-2">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.id}
                label={action.label}
                description={action.description}
                onClick={() => navigate(action.to)}
              />
            ))}
          </div>
        </Card>

        {/* Intelligence */}
        <Card>
          <SectionHeader
            title="محرك المتابعة"
            meta={updatedAt ? `آخر تحديث: ${updatedAt}` : undefined}
          />
          {loading ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Risk index */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  مؤشر المخاطر
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'High'].map((level) => {
                    const s = RISK_LEVEL[level];
                    return (
                      <div
                        key={level}
                        className={`rounded-lg border px-3 py-2.5 text-center ${s.className}`}
                      >
                        <p className="text-xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {Number(riskIndex[level] || 0).toLocaleString('en-US')}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold opacity-70">{s.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Other metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <MetricBox label="ردود معلقة"            value={Number(intelligence?.pendingResponses   || 0).toLocaleString('en-US')} />
                <MetricBox label="أولياء تحت المراقبة"   value={Number(intelligence?.flaggedParents     || 0).toLocaleString('en-US')} />
                <MetricBox label="حوادث متكررة"          value={Number(intelligence?.repeatedIncidents  || 0).toLocaleString('en-US')} />
                <MetricBox label="تنبيهات الصفوف"        value={Number(intelligence?.classAnalysis?.length || 0).toLocaleString('en-US')} />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Weekly Summary + Class Analysis ── */}
      <div className="grid gap-4 xl:grid-cols-2">

        {/* Weekly Summary */}
        <Card>
          <SectionHeader title="الملخص الأسبوعي" meta="تحليل آلي · بيانات فعلية فقط" />
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : weeklyItems.length ? (
            <ul
              className="space-y-1.5 max-h-64 overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}
            >
              {weeklyItems.slice(0, 8).map((item, i) => {
                const isObj = typeof item === 'object' && item !== null;
                return (
                  <li
                    key={isObj ? `${item.studentId}-${i}` : `${item}-${i}`}
                    className="rounded-lg bg-gray-50 px-3.5 py-2.5"
                    style={{ border: '1px solid #F3F4F6' }}
                  >
                    {isObj ? (
                      <>
                        <p className="text-[13px] font-semibold text-gray-800">
                          {item.studentName}
                          <span className="mr-2 text-[11px] font-normal text-gray-400">{item.className}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          {item.academicDirection} ·{' '}
                          {item.riskStatus === 'Low' ? 'مخاطر منخفضة' : item.riskStatus === 'Medium' ? 'مخاطر متوسطة' : 'مخاطر مرتفعة'}
                        </p>
                      </>
                    ) : (
                      <p className="text-[13px] text-gray-700">{item}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">لا توجد بيانات كافية لتوليد الملخص الأسبوعي.</p>
          )}
        </Card>

        {/* Class Analysis */}
        <Card>
          <SectionHeader title="تحليل الصفوف الذكي" meta="اقتراحات فقط · لا إجراءات تلقائية" />
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : classAlerts.length ? (
            <ul
              className="space-y-1.5 max-h-64 overflow-y-auto"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}
            >
              {classAlerts.slice(0, 8).map((item, i) => (
                <li
                  key={`${item.type}-${i}`}
                  className="rounded-lg bg-gray-50 px-3.5 py-2.5"
                  style={{ border: '1px solid #F3F4F6' }}
                >
                  <p className="text-[13px] font-semibold text-gray-800">{item.message}</p>
                  {item.suggestion && (
                    <p className="mt-0.5 text-[11px] text-gray-500">{item.suggestion}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">لا توجد تنبيهات مهمة على مستوى الصفوف هذا الأسبوع.</p>
          )}
        </Card>

      </div>
    </div>
  );
}
