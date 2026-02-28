import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEnterpriseDashboard, fetchEnterpriseHierarchy } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';

const metricCards = [
  { key: 'risk', title: 'High-Risk Students', to: '/admin/students' },
  { key: 'tickets', title: 'Pending Tickets', to: '/admin/feedback' },
  { key: 'conflicts', title: 'Schedule Conflicts', to: '/admin/schedule' },
  { key: 'survey', title: 'Survey Participation', to: '/admin/surveys' },
  { key: 'unread', title: 'Unread Notifications', to: '/admin/notifications' },
  { key: 'responses', title: 'Survey Responses', to: '/admin/reports' },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [hierarchy, setHierarchy] = useState(null);

  const [gradeFilter, setGradeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashboardPayload, hierarchyPayload] = await Promise.all([
        fetchEnterpriseDashboard(token, { grade: gradeFilter, className: classFilter }),
        fetchEnterpriseHierarchy(token),
      ]);
      setDashboard(dashboardPayload);
      setHierarchy(hierarchyPayload);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load enterprise dashboard.');
      setDashboard(null);
      setHierarchy(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gradeFilter, classFilter]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadDashboard();
    }, 60000);
    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gradeFilter, classFilter]);

  const gradeOptions = useMemo(() => {
    const yearMap = hierarchy?.hierarchy || {};
    const grades = [];
    Object.keys(yearMap).forEach((year) => {
      Object.keys(yearMap[year] || {}).forEach((grade) => grades.push(grade));
    });
    return [...new Set(grades)].filter(Boolean).sort();
  }, [hierarchy]);

  const classOptions = useMemo(() => {
    const yearMap = hierarchy?.hierarchy || {};
    const classes = [];
    Object.keys(yearMap).forEach((year) => {
      Object.keys(yearMap[year] || {}).forEach((grade) => {
        (yearMap[year][grade] || []).forEach((item) => classes.push(item.name));
      });
    });
    return [...new Set(classes)].filter(Boolean).sort();
  }, [hierarchy]);

  const metrics = useMemo(() => {
    if (!dashboard) {
      return {
        risk: 0,
        tickets: 0,
        conflicts: 0,
        survey: 0,
        unread: 0,
        responses: 0,
      };
    }
    return {
      risk: (dashboard.highRiskStudents || []).length,
      tickets: Number(dashboard.pendingFeedbackTickets || 0),
      conflicts: (dashboard.scheduleConflicts || []).length,
      survey: Number(dashboard.surveyParticipationRate || 0).toFixed(2),
      unread: Number(dashboard.notificationQueue?.unread || 0),
      responses: Number(dashboard.surveyResponseCount || 0),
    };
  }, [dashboard]);

  return (
    <div className="page-enter space-y-5 p-1">
      <header className="panel-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-text-primary">Enterprise Admin Dashboard</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Operational cockpit with live risks, workload, capacity, ticket backlog, conflicts, and participation.
            </p>
          </div>
          <p className="text-xs text-text-secondary">
            Last update: {dashboard?.generatedAt ? new Date(dashboard.generatedAt).toLocaleString('en-US') : '-'}
          </p>
        </div>
      </header>

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <section className="panel-card">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value)}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All grades</option>
            {gradeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All classes</option>
            {classOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button type="button" className="action-btn" onClick={loadDashboard} disabled={loading}>
            Refresh Dashboard
          </button>
          <button type="button" className="action-btn" onClick={() => navigate('/admin/reports')}>
            Open Reports Engine
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <button key={card.key} type="button" className="panel-card-hover text-left" onClick={() => navigate(card.to)}>
            <p className="text-xs text-text-secondary">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">{metrics[card.key]}</p>
          </button>
        ))}
      </section>

      {loading ? (
        <section className="panel-card">
          <div className="grid gap-2">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-2">
            <article className="panel-card">
              <h2 className="mb-3 text-base font-semibold text-text-primary">Attendance Rate Trends</h2>
              <div className="space-y-2">
                {(dashboard?.attendanceRateTrends || []).slice(0, 10).map((item, index) => (
                  <div key={`${item.studentId || index}-${item.className || ''}`} className="rounded-sm border border-border bg-background p-2 text-xs">
                    <p className="font-semibold text-text-primary">{item.studentName || 'Student'} | {item.className || '-'}</p>
                    <p className="text-text-secondary">risk: {item.riskStatus || '-'} | attendance: {item.attendanceRate ?? '-'}</p>
                  </div>
                ))}
                {!dashboard?.attendanceRateTrends?.length ? <p className="text-xs text-text-secondary">No trend snapshots.</p> : null}
              </div>
            </article>

            <article className="panel-card">
              <h2 className="mb-3 text-base font-semibold text-text-primary">Teacher Workload Heatmap</h2>
              <div className="space-y-2">
                {(dashboard?.teacherWorkloadHeatmap || []).slice(0, 12).map((item) => (
                  <div key={item.teacherName} className="rounded-sm border border-border bg-background p-2 text-xs">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-semibold text-text-primary">{item.teacherName}</span>
                      <span className="text-text-secondary">{Number(item.sessions || 0)} sessions</span>
                    </div>
                    <div className="h-2 rounded-full bg-border">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, Number(item.sessions || 0) * 5)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <article className="panel-card">
              <h2 className="mb-3 text-base font-semibold text-text-primary">Class Capacity Utilization</h2>
              <div className="space-y-2">
                {(dashboard?.classCapacityUtilization || []).slice(0, 15).map((item) => (
                  <div key={item.className} className="rounded-sm border border-border bg-background p-2 text-xs">
                    <p className="font-semibold text-text-primary">{item.className}</p>
                    <p className="text-text-secondary">enrolled: {item.enrolled} / {item.capacity} | utilization: {Number(item.utilizationRate || 0).toFixed(2)}%</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <h2 className="mb-3 text-base font-semibold text-text-primary">High-Risk Student Alerts</h2>
              <div className="space-y-2">
                {(dashboard?.highRiskStudents || []).slice(0, 15).map((item, index) => (
                  <div key={`${item.studentId || index}-${item.className || ''}`} className="rounded-sm border border-danger/35 bg-danger/5 p-2 text-xs">
                    <p className="font-semibold text-text-primary">{item.studentName || 'Student'} | {item.className || '-'}</p>
                    <p className="text-danger">risk score: {item.riskScore ?? '-'} | status: {item.riskStatus || '-'}</p>
                  </div>
                ))}
                {!dashboard?.highRiskStudents?.length ? <p className="text-xs text-text-secondary">No high-risk alerts for current filter.</p> : null}
              </div>
            </article>
          </section>

          <section className="panel-card">
            <h2 className="mb-3 text-base font-semibold text-text-primary">Schedule Conflict Alerts</h2>
            <div className="space-y-2">
              {(dashboard?.scheduleConflicts || []).slice(0, 20).map((item) => (
                <div key={item.id} className="rounded-sm border border-danger/35 bg-danger/5 p-2 text-xs">
                  <p className="font-semibold text-text-primary">{item.className} | {item.teacherName}</p>
                  <p className="text-text-secondary">Day {item.dayOfWeek} | {item.startTime} - {item.endTime} | Room {item.room || '-'}</p>
                  <p className="text-danger">flags: {(item.conflictFlags || []).join(', ')}</p>
                </div>
              ))}
              {!dashboard?.scheduleConflicts?.length ? <p className="text-xs text-text-secondary">No schedule conflicts detected.</p> : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
