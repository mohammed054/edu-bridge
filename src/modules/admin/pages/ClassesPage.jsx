import { useEffect, useMemo, useState } from 'react';
import {
  exportEnterpriseClassRoster,
  fetchEnterpriseClassDetail,
  fetchEnterpriseClasses,
  updateEnterpriseClassDetail,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';
import { useAdminEnterprise } from '../context/AdminEnterpriseContext';

const downloadCsv = (csvText, filename) => {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

export default function ClassesPage() {
  const { token } = useAuth();
  const { selectedGrade } = useAdminEnterprise();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState('');

  const [selectedClassId, setSelectedClassId] = useState('');
  const [detail, setDetail] = useState(null);
  const [capacityInput, setCapacityInput] = useState(35);
  const [sectionInput, setSectionInput] = useState('');
  const [yearInput, setYearInput] = useState('');

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchEnterpriseClasses(token);
      setRows(payload.rows || []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load class list.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (selectedGrade && !grade) setGrade(selectedGrade);
  }, [selectedGrade, grade]);

  const visibleRows = useMemo(() => {
    const pattern = search.trim().toLowerCase();
    return rows.filter((item) => {
      const matchText =
        !pattern ||
        String(item.name || '').toLowerCase().includes(pattern) ||
        String(item.grade || '').toLowerCase().includes(pattern) ||
        String(item.section || '').toLowerCase().includes(pattern);
      const matchGrade = !grade || String(item.grade || '') === grade;
      return matchText && matchGrade;
    });
  }, [rows, search, grade]);

  const grades = useMemo(
    () => [...new Set(rows.map((item) => String(item.grade || '').trim()).filter(Boolean))].sort(),
    [rows]
  );

  const handleOpenDetail = async (classId) => {
    try {
      setDetailLoading(true);
      setSelectedClassId(classId);
      const payload = await fetchEnterpriseClassDetail(token, classId);
      setDetail(payload);
      setCapacityInput(Number(payload.class?.capacity || 35));
      setSectionInput(payload.class?.section || '');
      setYearInput(payload.class?.academicYear || '');
    } catch (loadError) {
      setError(loadError.message || 'Failed to load class detail.');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!selectedClassId) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updateEnterpriseClassDetail(token, selectedClassId, {
        capacity: Number(capacityInput || 35),
        section: sectionInput,
        academicYear: yearInput,
      });
      setSuccess('Class settings updated.');
      await loadClasses();
      await handleOpenDetail(selectedClassId);
    } catch (saveError) {
      setError(saveError.message || 'Failed to update class settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportRoster = async () => {
    if (!selectedClassId) return;
    try {
      setSaving(true);
      setError('');
      const csv = await exportEnterpriseClassRoster(token, selectedClassId);
      const className = detail?.class?.name || 'class-roster';
      downloadCsv(csv, `${className}-roster-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (saveError) {
      setError(saveError.message || 'Failed to export roster.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="Enterprise Class Management"
        subtitle="Class roster controls, capacity planning, performance aggregates, and timetable preview."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="Search class by name/grade/section"
          />
          <select
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">All grades</option>
            {grades.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm text-text-secondary">
            {visibleRows.length.toLocaleString('en-US')} classes in view
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
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Class</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Grade</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Capacity</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Enrolled</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Utilization</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Teacher Count</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Weekly Sessions</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Performance Avg</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Attendance Rate</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Detail</th>
                </tr>
              </thead>
              <tbody>
                {!visibleRows.length ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-text-secondary">
                      No classes found.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="px-3 py-2 text-text-primary">{row.name}</td>
                      <td className="px-3 py-2 text-text-primary">{row.grade || '-'}</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.capacity || 0)}</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.enrolled || 0)}</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.utilizationRate || 0).toFixed(2)}%</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.teacherCount || 0)}</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.weeklySessions || 0)}</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.performanceAverage || 0).toFixed(2)}</td>
                      <td className="px-3 py-2 text-text-primary">{Number(row.attendanceRate || 0).toFixed(2)}%</td>
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
      </section>

      {selectedClassId ? (
        <section className="panel-card space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-text-primary">Class Detail Page</h2>
            <button
              type="button"
              className="action-btn"
              onClick={() => {
                setSelectedClassId('');
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
                <h3 className="text-sm font-semibold text-text-primary">Class Configuration and Capacity</h3>
                <p className="mt-2 text-xs text-text-secondary">
                  {detail.class?.name} | Grade {detail.class?.grade || '-'} | Section {detail.class?.section || '-'}
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <input
                    type="number"
                    min={1}
                    value={capacityInput}
                    onChange={(event) => setCapacityInput(Number(event.target.value || 35))}
                    className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
                    placeholder="Capacity"
                  />
                  <input
                    value={sectionInput}
                    onChange={(event) => setSectionInput(event.target.value)}
                    className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
                    placeholder="Section"
                  />
                  <input
                    value={yearInput}
                    onChange={(event) => setYearInput(event.target.value)}
                    className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
                    placeholder="Academic year"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="action-btn-primary" onClick={handleUpdateClass} disabled={saving}>
                    Save Capacity Settings
                  </button>
                  <button type="button" className="action-btn" onClick={handleExportRoster} disabled={saving}>
                    Export Roster
                  </button>
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Class Performance Metrics</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-sm border border-border p-2">Average performance: {Number(detail.classPerformanceMetrics?.averagePerformance || 0).toFixed(2)}</div>
                  <div className="rounded-sm border border-border p-2">Attendance rate: {Number(detail.classPerformanceMetrics?.attendanceRate || 0).toFixed(2)}%</div>
                  <div className="rounded-sm border border-border p-2">Roster size: {Number((detail.studentRosterPanel || []).length)}</div>
                  <div className="rounded-sm border border-border p-2">Teacher assignments: {Number((detail.teacherAssignmentPanel || []).length)}</div>
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Student Roster Panel</h3>
                <div className="mt-2 max-h-80 overflow-auto space-y-2">
                  {(detail.studentRosterPanel || []).map((student) => (
                    <div key={student.id} className="rounded-sm border border-border p-2 text-xs">
                      <p className="font-semibold text-text-primary">{student.name}</p>
                      <p className="text-text-secondary">{student.email}</p>
                      <p className="text-text-secondary">Lifecycle: {student.lifecycleState}</p>
                    </div>
                  ))}
                  {!detail.studentRosterPanel?.length ? <p className="text-xs text-text-secondary">No students assigned.</p> : null}
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Teacher Assignment Panel</h3>
                <div className="mt-2 max-h-80 overflow-auto space-y-2">
                  {(detail.teacherAssignmentPanel || []).map((teacher) => (
                    <div key={teacher.id} className="rounded-sm border border-border p-2 text-xs">
                      <p className="font-semibold text-text-primary">{teacher.name}</p>
                      <p className="text-text-secondary">Subject: {teacher.subject || '-'}</p>
                    </div>
                  ))}
                  {!detail.teacherAssignmentPanel?.length ? <p className="text-xs text-text-secondary">No teachers assigned.</p> : null}
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3 xl:col-span-2">
                <h3 className="text-sm font-semibold text-text-primary">Weekly Timetable View</h3>
                <div className="mt-2 overflow-auto">
                  <table className="min-w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-2 py-1">Day</th>
                        <th className="px-2 py-1">Time</th>
                        <th className="px-2 py-1">Subject</th>
                        <th className="px-2 py-1">Teacher</th>
                        <th className="px-2 py-1">Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.weeklyTimetableView || []).map((item) => (
                        <tr key={`${item.dayOfWeek}-${item.startTime}-${item.subject}-${item.teacherName}`} className="border-b border-border/60">
                          <td className="px-2 py-1">{item.dayOfWeek}</td>
                          <td className="px-2 py-1">{item.startTime} - {item.endTime}</td>
                          <td className="px-2 py-1">{item.subject}</td>
                          <td className="px-2 py-1">{item.teacherName}</td>
                          <td className="px-2 py-1">{item.room || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No class detail loaded.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
