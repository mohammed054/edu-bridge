import { useEffect, useMemo, useState } from 'react';
import { fetchAdminReports } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

export default function ReportsPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState(null);

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await fetchAdminReports(token);
        if (!active) {
          return;
        }
        setReports(payload);
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'تعذر تحميل التقارير.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, [token]);

  const cards = useMemo(() => {
    if (!reports?.totals) {
      return [];
    }

    return [
      { key: 'students', title: 'إجمالي الطلاب', value: reports.totals.students || 0 },
      { key: 'teachers', title: 'إجمالي المعلمين', value: reports.totals.teachers || 0 },
      { key: 'classes', title: 'إجمالي الصفوف', value: reports.totals.classes || 0 },
      { key: 'subjects', title: 'إجمالي المواد', value: reports.totals.subjects || 0 },
      { key: 'feedbacks', title: 'إجمالي التغذية الراجعة', value: reports.totals.feedbacks || 0 },
      { key: 'homeworks', title: 'إجمالي الواجبات', value: reports.totals.homeworks || 0 },
    ];
  }, [reports]);

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="التقارير"
        subtitle="مؤشرات تشغيلية مباشرة مبنية على بيانات النظام الحالية."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <section className="panel-card">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="skeleton h-[112px]" />
            <div className="skeleton h-[112px]" />
            <div className="skeleton h-[112px]" />
            <div className="skeleton h-[112px]" />
            <div className="skeleton h-[112px]" />
            <div className="skeleton h-[112px]" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((report) => (
              <article key={report.key} className="panel-card-hover">
                <p className="caption-premium">{report.title}</p>
                <p className="mt-2 text-3xl font-bold text-text-primary">
                  {Number(report.value || 0).toLocaleString('en-US')}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">ملخص الاستبيانات</h2>
          <p className="caption-premium">
            {reports?.generatedAt
              ? `آخر تحديث: ${new Date(reports.generatedAt).toLocaleString('en-US')}`
              : ''}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
        ) : (
          <div className="space-y-2">
            {(reports?.surveys || []).slice(0, 8).map((survey) => (
              <article key={survey.id} className="rounded-sm border border-border bg-background p-3">
                <p className="text-sm font-semibold text-text-primary">{survey.name}</p>
                <p className="text-xs text-text-secondary">
                  الفئة: {(survey.audience || []).join(', ') || '-'} | الردود:{' '}
                  {Number(survey.totalResponses || 0).toLocaleString('en-US')}
                </p>
              </article>
            ))}
            {!reports?.surveys?.length ? (
              <p className="text-sm text-text-secondary">لا توجد استبيانات حالياً.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
