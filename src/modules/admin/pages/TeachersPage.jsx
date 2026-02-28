import { useEffect, useMemo, useState } from 'react';
import { fetchEnterpriseTeacherDetail, fetchEnterpriseTeachers } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const workloadStyle = {
  overload: 'border-danger/30 bg-danger/10 text-danger',
  underload: 'border-warning/30 bg-warning/10 text-warning',
  balanced: 'border-success/30 bg-success/10 text-success',
};

export default function TeachersPage() {
  const { token } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [detail, setDetail] = useState(null);

  const query = useMemo(
    () => ({
      page,
      pageSize,
      search,
      subject,
    }),
    [page, pageSize, search, subject]
  );

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchEnterpriseTeachers(token, query);
      setRows(payload.rows || []);
      setTotalPages(Math.max(1, Number(payload.totalPages || 1)));
      setTotalCount(Number(payload.totalCount || 0));
    } catch (loadError) {
      setError(loadError.message || 'Failed to load teacher list.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, query]);

  const handleOpenDetail = async (teacherId) => {
    try {
      setDetailLoading(true);
      setSelectedTeacherId(teacherId);
      const payload = await fetchEnterpriseTeacherDetail(token, teacherId);
      setDetail(payload);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load teacher detail.');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const subjectOptions = useMemo(
    () => [...new Set(rows.map((item) => String(item.subject || '').trim()).filter(Boolean))].sort(),
    [rows]
  );

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="Enterprise Teacher Management"
        subtitle="Workload analytics, conflict warnings, and per-teacher operational dashboards."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <section className="panel-card">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="Search teacher name/email"
          />
          <select
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              setPage(1);
            }}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All subjects</option>
            {subjectOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={String(pageSize)}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
          >
            {[25, 50, 100, 200].map((item) => (
              <option key={item} value={item}>
                {item} per page
              </option>
            ))}
          </select>
          <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-text-secondary">
            {totalCount.toLocaleString('en-US')} teachers
          </p>
        </div>
      </section>

      <section className="panel-card">
        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Name</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Subject</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Classes</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Weekly Sessions</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Weekly Hours</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Conflicts</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Load</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Dashboard</th>
                </tr>
              </thead>
              <tbody>
                {!rows.length ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-text-secondary">
                      No teachers matched current filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="px-3 py-2 text-text-primary">
                        <p className="font-semibold">{row.name}</p>
                        <p className="text-xs text-text-secondary">{row.email}</p>
                      </td>
                      <td className="px-3 py-2 text-text-primary">{row.subject || '-'}</td>
                      <td className="px-3 py-2 text-text-primary">{(row.classes || []).join(', ') || '-'}</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.weeklySessions || 0)}</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.weeklyHours || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.conflictWarnings || 0)}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${
                            workloadStyle[row.workloadState] || 'border-border bg-background text-text-secondary'
                          }`}
                        >
                          {row.workloadState || 'unknown'}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" className="action-btn" onClick={() => handleOpenDetail(row.id)}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-text-secondary">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="action-btn"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
            >
              Previous
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selectedTeacherId ? (
        <section className="panel-card space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-text-primary">Teacher Operational Dashboard</h2>
            <button
              type="button"
              className="action-btn"
              onClick={() => {
                setSelectedTeacherId('');
                setDetail(null);
              }}
            >
              Close
            </button>
          </div>

          {detailLoading ? (
            <div className="grid gap-2">
              <div className="skeleton h-16" />
              <div className="skeleton h-16" />
            </div>
          ) : detail ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Teacher Overview</h3>
                <p className="mt-2 text-xs text-text-secondary">{detail.teacher?.name} | {detail.teacher?.email}</p>
                <p className="mt-1 text-xs text-text-secondary">Subject: {detail.teacher?.subject || '-'} | Classes: {(detail.teacher?.classes || []).join(', ') || '-'}</p>
                <p className="mt-1 text-xs text-text-secondary">Subject Grouping: {(detail.groupingBySubject || []).map((item) => `${item.subject} (${item.classCount})`).join(', ') || '-'}</p>
              </article>

              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Workload Analytics</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-sm border border-border p-2">Weekly hours: {Number(detail.workloadAnalytics?.weeklyHours || 0).toFixed(2)}</div>
                  <div className="rounded-sm border border-border p-2">Classes assigned: {Number(detail.workloadAnalytics?.classesAssigned || 0)}</div>
                  <div className="rounded-sm border border-border p-2">Schedule conflicts: {Number(detail.workloadAnalytics?.scheduleConflictWarnings || 0)}</div>
                  <div className="rounded-sm border border-border p-2">Attendance submissions: {Number(detail.workloadAnalytics?.attendanceCompletionTracker || 0)}</div>
                  <div className="rounded-sm border border-border p-2">Risk students: {Number(detail.workloadAnalytics?.riskStudentsSummary || 0)}</div>
                  <div className="rounded-sm border border-border p-2">Upcoming deadlines: {Number(detail.workloadAnalytics?.upcomingDeadlines || 0)}</div>
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3 xl:col-span-2">
                <h3 className="text-sm font-semibold text-text-primary">Weekly Hour Tracking and Conflict Timeline</h3>
                <div className="mt-2 overflow-auto">
                  <table className="min-w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-2 py-1">Class</th>
                        <th className="px-2 py-1">Subject</th>
                        <th className="px-2 py-1">Day</th>
                        <th className="px-2 py-1">Time</th>
                        <th className="px-2 py-1">Room</th>
                        <th className="px-2 py-1">Conflict Flags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.weeklyHourTracking || []).map((item) => (
                        <tr key={`${item.className}-${item.dayOfWeek}-${item.startTime}-${item.subject}`} className="border-b border-border/60">
                          <td className="px-2 py-1">{item.className}</td>
                          <td className="px-2 py-1">{item.subject}</td>
                          <td className="px-2 py-1">{item.dayOfWeek}</td>
                          <td className="px-2 py-1">{item.startTime} - {item.endTime}</td>
                          <td className="px-2 py-1">{item.room || '-'}</td>
                          <td className="px-2 py-1">{(item.conflictFlags || []).join(', ') || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Performance Metrics</h3>
                <p className="mt-2 text-xs text-text-secondary">Attendance compliance: {Number(detail.performanceMetrics?.attendanceComplianceRate || 0).toFixed(2)}%</p>
                <p className="mt-1 text-xs text-text-secondary">Feedback response metric: {Number(detail.performanceMetrics?.feedbackResponseTimeMetric || 0)}</p>
              </article>

              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Student-Teacher Feedback Cross View</h3>
                <div className="mt-2 space-y-2">
                  {(detail.studentTeacherFeedbackCrossView || []).slice(0, 10).map((item) => (
                    <div key={item._id || `${item.studentName}-${item.createdAt}`} className="rounded-sm border border-border p-2 text-xs">
                      <p className="font-semibold text-text-primary">{item.studentName || 'Student'} | {item.className || '-'}</p>
                      <p className="text-text-secondary">{item.workflowStatus || '-'} | urgency: {item.urgency || '-'}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3 xl:col-span-2">
                <h3 className="text-sm font-semibold text-text-primary">Parent Communication Log</h3>
                <div className="mt-2 space-y-2">
                  {(detail.parentCommunicationLog || []).slice(0, 10).map((item, index) => (
                    <div key={`${item.studentName}-${item.createdAt}-${index}`} className="rounded-sm border border-border p-2 text-xs">
                      <p className="font-semibold text-text-primary">{item.studentName || 'Student'} | {item.className || '-'}</p>
                      <p className="text-text-secondary">{item.createdAt ? new Date(item.createdAt).toLocaleString('en-US') : '-'}</p>
                    </div>
                  ))}
                  {!detail.parentCommunicationLog?.length ? (
                    <p className="text-xs text-text-secondary">No parent communication entries found.</p>
                  ) : null}
                </div>
              </article>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No teacher detail loaded.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
