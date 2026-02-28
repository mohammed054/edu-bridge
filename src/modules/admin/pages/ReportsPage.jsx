import { useEffect, useMemo, useState } from 'react';
import {
  exportEnterpriseStudents,
  exportTicketWorkflow,
  fetchEnterpriseClasses,
  fetchEnterpriseDashboard,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const downloadText = (text, filename, mimeType = 'text/plain;charset=utf-8') => {
  const blob = new Blob([text], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

export default function ReportsPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [dashboard, setDashboard] = useState(null);
  const [classes, setClasses] = useState([]);

  const [gradeFilter, setGradeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [reportType, setReportType] = useState('students_filtered');

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashboardPayload, classesPayload] = await Promise.all([
        fetchEnterpriseDashboard(token, { grade: gradeFilter, className: classFilter }),
        fetchEnterpriseClasses(token),
      ]);
      setDashboard(dashboardPayload);
      setClasses(classesPayload.rows || []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load analytics reports.');
      setDashboard(null);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gradeFilter, classFilter]);

  const gradeOptions = useMemo(
    () => [...new Set(classes.map((item) => String(item.grade || '').trim()).filter(Boolean))].sort(),
    [classes]
  );

  const classOptions = useMemo(() => classes.map((item) => item.name).filter(Boolean).sort(), [classes]);

  const dashboardMetrics = useMemo(() => {
    if (!dashboard) return null;
    return {
      riskCount: (dashboard.highRiskStudents || []).length,
      conflictCount: (dashboard.scheduleConflicts || []).length,
      pendingTickets: Number(dashboard.pendingFeedbackTickets || 0),
      surveyParticipationRate: Number(dashboard.surveyParticipationRate || 0),
      surveyResponseCount: Number(dashboard.surveyResponseCount || 0),
      queueUnread: Number(dashboard.notificationQueue?.unread || 0),
    };
  }, [dashboard]);

  const handleExport = async () => {
    try {
      setExporting(true);
      setError('');
      setSuccess('');

      if (reportType === 'students_filtered') {
        const csv = await exportEnterpriseStudents(token, { className: classFilter });
        downloadText(csv, `students-report-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
      } else if (reportType === 'tickets_workflow') {
        const csv = await exportTicketWorkflow(token);
        downloadText(csv, `tickets-report-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
      } else if (reportType === 'dashboard_snapshot') {
        downloadText(
          JSON.stringify(
            {
              generatedAt: new Date().toISOString(),
              filters: { gradeFilter, classFilter },
              dashboard,
              classes,
            },
            null,
            2
          ),
          `dashboard-snapshot-${new Date().toISOString().slice(0, 10)}.json`,
          'application/json;charset=utf-8'
        );
      } else if (reportType === 'print_pdf') {
        window.print();
      }

      setSuccess('Report export completed.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="Analytics and Reporting Engine"
        subtitle="Operational dashboard with drill-down signals, comparative indicators, risk scoring surfaces, and custom exports."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <div className="grid gap-3 md:grid-cols-4">
          <select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All grades</option>
            {gradeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All classes</option>
            {classOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={reportType} onChange={(event) => setReportType(event.target.value)} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="students_filtered">Export Students CSV</option>
            <option value="tickets_workflow">Export Tickets CSV</option>
            <option value="dashboard_snapshot">Export Dashboard Snapshot JSON</option>
            <option value="print_pdf">Print to PDF</option>
          </select>
          <button type="button" className="action-btn-primary" onClick={handleExport} disabled={exporting || loading}>
            Run Report Export
          </button>
        </div>
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
          <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <article className="panel-card-hover">
              <p className="text-xs text-text-secondary">High-Risk Students</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{Number(dashboardMetrics?.riskCount || 0)}</p>
            </article>
            <article className="panel-card-hover">
              <p className="text-xs text-text-secondary">Schedule Conflicts</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{Number(dashboardMetrics?.conflictCount || 0)}</p>
            </article>
            <article className="panel-card-hover">
              <p className="text-xs text-text-secondary">Pending Tickets</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{Number(dashboardMetrics?.pendingTickets || 0)}</p>
            </article>
            <article className="panel-card-hover">
              <p className="text-xs text-text-secondary">Survey Participation</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{Number(dashboardMetrics?.surveyParticipationRate || 0).toFixed(2)}%</p>
            </article>
            <article className="panel-card-hover">
              <p className="text-xs text-text-secondary">Survey Responses</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{Number(dashboardMetrics?.surveyResponseCount || 0)}</p>
            </article>
            <article className="panel-card-hover">
              <p className="text-xs text-text-secondary">Unread Notifications</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{Number(dashboardMetrics?.queueUnread || 0)}</p>
            </article>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <article className="panel-card">
              <h2 className="mb-3 text-base font-semibold text-text-primary">Attendance Trend (Weekly Snapshot)</h2>
              <div className="space-y-2">
                {(dashboard?.attendanceRateTrends || []).slice(0, 10).map((item, index) => (
                  <div key={`${item.studentId || index}-${item.className || ''}`} className="rounded-sm border border-border bg-background p-2 text-xs">
                    <p className="font-semibold text-text-primary">{item.studentName || 'Student'} | {item.className || '-'}</p>
                    <p className="text-text-secondary">Risk: {item.riskStatus || '-'} | Attendance: {item.attendanceRate ?? '-'}</p>
                  </div>
                ))}
                {!dashboard?.attendanceRateTrends?.length ? <p className="text-xs text-text-secondary">No weekly trend rows available.</p> : null}
              </div>
            </article>

            <article className="panel-card">
              <h2 className="mb-3 text-base font-semibold text-text-primary">Teacher Workload Heatmap</h2>
              <div className="space-y-2">
                {(dashboard?.teacherWorkloadHeatmap || []).slice(0, 12).map((item) => (
                  <div key={item.teacherName} className="rounded-sm border border-border bg-background p-2">
                    <div className="mb-1 flex items-center justify-between text-xs">
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
                {(dashboard?.classCapacityUtilization || []).slice(0, 20).map((item) => (
                  <div key={item.className} className="rounded-sm border border-border bg-background p-2 text-xs">
                    <p className="font-semibold text-text-primary">{item.className}</p>
                    <p className="text-text-secondary">Enrolled: {item.enrolled} / {item.capacity} | Utilization: {Number(item.utilizationRate || 0).toFixed(2)}%</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <h2 className="mb-3 text-base font-semibold text-text-primary">Schedule Conflict Alerts</h2>
              <div className="space-y-2">
                {(dashboard?.scheduleConflicts || []).slice(0, 20).map((item) => (
                  <div key={item.id} className="rounded-sm border border-danger/40 bg-danger/5 p-2 text-xs">
                    <p className="font-semibold text-text-primary">{item.className} | {item.teacherName}</p>
                    <p className="text-text-secondary">Day {item.dayOfWeek} | {item.startTime} - {item.endTime} | Room {item.room || '-'}</p>
                    <p className="text-danger">Conflicts: {(item.conflictFlags || []).join(', ')}</p>
                  </div>
                ))}
                {!dashboard?.scheduleConflicts?.length ? <p className="text-xs text-text-secondary">No conflicts detected.</p> : null}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
