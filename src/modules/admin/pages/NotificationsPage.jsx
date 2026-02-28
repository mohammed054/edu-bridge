import { useEffect, useMemo, useState } from 'react';
import { fetchAdminIncidents, fetchAdminIntelligence } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const levelStyles = {
  info: 'bg-primary/10 text-primary border-primary/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
};

export default function NotificationsPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intelligence, setIntelligence] = useState(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [insightsPayload, incidentsPayload] = await Promise.all([
          fetchAdminIntelligence(token),
          fetchAdminIncidents(token),
        ]);

        if (!active) {
          return;
        }

        setIntelligence(insightsPayload);
        setIncidents(incidentsPayload.incidents || []);
      } catch (loadError) {
        if (active) {
          setError(loadError?.message || 'تعذر تحميل الإشعارات.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [token]);

  const items = useMemo(() => {
    if (!intelligence) {
      return [];
    }

    return [
      {
        id: 'risk-high',
        level: Number(intelligence?.riskIndex?.High || 0) > 0 ? 'danger' : 'info',
        title: 'طلاب بخطورة عالية',
        description: `${Number(intelligence?.riskIndex?.High || 0).toLocaleString('en-US')} طالب`,
      },
      {
        id: 'pending-parent',
        level: Number(intelligence?.pendingResponses || 0) > 0 ? 'warning' : 'info',
        title: 'ردود أولياء الأمور المعلقة',
        description: `${Number(intelligence?.pendingResponses || 0).toLocaleString('en-US')} حالة`,
      },
      {
        id: 'flagged-parents',
        level: Number(intelligence?.flaggedParents || 0) > 0 ? 'warning' : 'info',
        title: 'أولياء أمور بحاجة متابعة',
        description: `${Number(intelligence?.flaggedParents || 0).toLocaleString('en-US')} حالة`,
      },
      {
        id: 'repeated-incidents',
        level: Number(intelligence?.repeatedIncidents || 0) > 0 ? 'warning' : 'info',
        title: 'طلاب بتكرار حوادث',
        description: `${Number(intelligence?.repeatedIncidents || 0).toLocaleString('en-US')} طالب`,
      },
    ];
  }, [intelligence]);

  const highIncidents = useMemo(
    () => (incidents || []).filter((item) => item.severity === 'high').slice(0, 6),
    [incidents]
  );

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="الإشعارات"
        subtitle="تنبيهات تشغيلية مرتبطة بالانضباط الأكاديمي وتفاعل أولياء الأمور."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <section className="panel-card">
        {loading ? (
          <div className="grid gap-3">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        ) : (
          <ol className="relative mr-3 space-y-4 border-r border-border pr-6">
            {items.map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -right-[30px] top-1 h-3 w-3 rounded-full border-2 border-surface bg-primary" />
                <article className="rounded-sm border border-border bg-background p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-text-primary">{item.title}</h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        levelStyles[item.level] || 'border-border bg-background text-text-secondary'
                      }`}
                    >
                      {item.level}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{item.description}</p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="panel-card">
        <h2 className="mb-3 text-base font-semibold text-text-primary">حوادث شدة عالية (حديثة)</h2>
        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
        ) : highIncidents.length ? (
          <div className="space-y-2">
            {highIncidents.map((item) => (
              <article key={item.id} className="rounded-sm border border-border bg-background px-3 py-2">
                <p className="text-sm font-semibold text-text-primary">{item.studentName} · {item.className}</p>
                <p className="text-xs text-text-secondary">{item.subject} · {new Date(item.createdAt).toLocaleString('en-US')}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">لا توجد حوادث شدة عالية حالياً.</p>
        )}
      </section>
    </div>
  );
}
