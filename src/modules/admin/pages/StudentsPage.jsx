import { useEffect, useMemo, useState } from 'react';
import {
  bulkUpdateEnterpriseStudents,
  createSavedView,
  deleteSavedView,
  exportEnterpriseStudents,
  fetchEnterpriseStudentDetail,
  fetchEnterpriseStudents,
  fetchSavedViews,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';
import { useAdminEnterprise } from '../context/AdminEnterpriseContext';

const LIFECYCLE_OPTIONS = [
  'active',
  'probation',
  'academic_warning',
  'suspended',
  'graduated',
  'transferred',
  'archived',
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'absentDays', label: 'Absent Days' },
  { value: 'negativeReports', label: 'Negative Reports' },
  { value: 'studentLifecycleState', label: 'Lifecycle State' },
];

const COLUMN_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'className', label: 'Class' },
  { key: 'grade', label: 'Grade' },
  { key: 'riskLevel', label: 'Risk' },
  { key: 'attendanceMisses', label: 'Attendance Misses' },
  { key: 'averageGrade', label: 'Average Grade' },
  { key: 'lifecycleState', label: 'Lifecycle' },
  { key: 'isActive', label: 'Status' },
];

const defaultColumns = COLUMN_OPTIONS.map((item) => item.key);

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

const toCsv = (headers, rows) => {
  const escapeValue = (value) => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  return [headers.join(','), ...rows.map((row) => row.map((value) => escapeValue(value)).join(','))].join('\n');
};

const statusLabel = (isActive) => (isActive ? 'Active' : 'Disabled');

export default function StudentsPage() {
  const { token } = useAuth();
  const { selectedGrade, selectedClass } = useAdminEnterprise();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [lifecycleState, setLifecycleState] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [availableFilters, setAvailableFilters] = useState({
    classNames: [],
    grades: [],
    riskLevels: ['low', 'medium', 'high'],
    lifecycleStates: LIFECYCLE_OPTIONS,
  });

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('activate');
  const [bulkClassName, setBulkClassName] = useState('');
  const [bulkLifecycleState, setBulkLifecycleState] = useState('active');

  const [views, setViews] = useState([]);
  const [activeViewId, setActiveViewId] = useState('');
  const [newViewTitle, setNewViewTitle] = useState('');
  const [markDefaultView, setMarkDefaultView] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const query = useMemo(
    () => ({
      page,
      pageSize,
      search,
      className,
      grade,
      riskLevel,
      lifecycleState,
      sortBy,
      sortOrder,
    }),
    [page, pageSize, search, className, grade, riskLevel, lifecycleState, sortBy, sortOrder]
  );

  const applySavedView = (view) => {
    const filters = view?.filters || {};
    const sort = view?.sort || {};
    setSearch(String(filters.search || ''));
    setClassName(String(filters.className || ''));
    setGrade(String(filters.grade || ''));
    setRiskLevel(String(filters.riskLevel || ''));
    setLifecycleState(String(filters.lifecycleState || ''));
    setSortBy(String(sort.sortBy || 'name'));
    setSortOrder(String(sort.sortOrder || 'asc'));
    setVisibleColumns(Array.isArray(view?.columns) && view.columns.length ? view.columns : defaultColumns);
    setPage(1);
  };

  const loadViews = async () => {
    try {
      const payload = await fetchSavedViews(token, { moduleKey: 'students' });
      const fetchedViews = payload.views || [];
      setViews(fetchedViews);
      const defaultView = fetchedViews.find((item) => item.isDefault);
      if (defaultView && !activeViewId) {
        setActiveViewId(defaultView.id);
        applySavedView(defaultView);
      }
    } catch {
      setViews([]);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchEnterpriseStudents(token, query);
      setRows(payload.rows || []);
      setTotalCount(Number(payload.totalCount || 0));
      setTotalPages(Math.max(1, Number(payload.totalPages || 1)));
      setAvailableFilters(
        payload.availableFilters || {
          classNames: [],
          grades: [],
          riskLevels: ['low', 'medium', 'high'],
          lifecycleStates: LIFECYCLE_OPTIONS,
        }
      );
    } catch (loadError) {
      setError(loadError.message || 'Failed to load students.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (selectedGrade && !grade) setGrade(selectedGrade);
    if (selectedClass?.name && !className) setClassName(selectedClass.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade, selectedClass?.name]);

  useEffect(() => {
    loadStudents();
    setSelectedIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, query]);

  const selectedRows = useMemo(() => rows.filter((item) => selectedIds.has(item.id)), [rows, selectedIds]);
  const allRowsSelected = rows.length > 0 && rows.every((item) => selectedIds.has(item.id));
  const activeColumns = useMemo(() => COLUMN_OPTIONS.filter((item) => visibleColumns.includes(item.key)), [visibleColumns]);

  const toggleSelected = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllCurrentPage = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allRowsSelected) rows.forEach((item) => next.delete(item.id));
      else rows.forEach((item) => next.add(item.id));
      return next;
    });
  };

  const handleBulkAction = async () => {
    if (!selectedIds.size) {
      setError('Select at least one student row first.');
      return;
    }

    const payload = { studentIds: [...selectedIds], action: bulkAction, payload: {} };
    if (bulkAction === 'move_class') {
      if (!bulkClassName) {
        setError('Choose target class for bulk move.');
        return;
      }
      payload.payload.className = bulkClassName;
    }
    if (bulkAction === 'set_lifecycle') payload.payload.lifecycleState = bulkLifecycleState;

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const response = await bulkUpdateEnterpriseStudents(token, payload);
      setSuccess(`Bulk action completed. Updated ${Number(response.modifiedCount || 0)} rows.`);
      await loadStudents();
      setSelectedIds(new Set());
    } catch (saveError) {
      setError(saveError.message || 'Bulk action failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportFiltered = async () => {
    try {
      setSaving(true);
      setError('');
      const csv = await exportEnterpriseStudents(token, { className });
      downloadCsv(csv, `students-filtered-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (saveError) {
      setError(saveError.message || 'Failed to export student list.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportSelected = () => {
    if (!selectedRows.length) {
      setError('Select at least one row before exporting selected.');
      return;
    }

    const csv = toCsv(
      ['name', 'email', 'className', 'grade', 'riskLevel', 'attendanceMisses', 'lifecycleState', 'averageGrade', 'isActive'],
      selectedRows.map((item) => [
        item.name,
        item.email,
        item.className,
        item.grade,
        item.riskLevel,
        item.attendanceMisses,
        item.lifecycleState,
        item.averageGrade,
        item.isActive ? 'true' : 'false',
      ])
    );
    downloadCsv(csv, `students-selected-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleSaveView = async () => {
    if (!newViewTitle.trim()) {
      setError('Enter a view title before saving.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await createSavedView(token, {
        moduleKey: 'students',
        title: newViewTitle.trim(),
        filters: { search, className, grade, riskLevel, lifecycleState },
        sort: { sortBy, sortOrder },
        columns: visibleColumns,
        isDefault: markDefaultView,
      });
      setNewViewTitle('');
      setMarkDefaultView(false);
      await loadViews();
      setSuccess('Saved view created.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to save view.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteView = async () => {
    if (!activeViewId) {
      setError('Select a saved view first.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await deleteSavedView(token, activeViewId);
      setActiveViewId('');
      await loadViews();
      setSuccess('Saved view deleted.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to delete view.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDetail = async (studentId) => {
    try {
      setDetailLoading(true);
      setSelectedStudentId(studentId);
      const payload = await fetchEnterpriseStudentDetail(token, studentId);
      setDetail(payload);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load student detail.');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="Enterprise Student Management"
        subtitle="Server-driven tables, saved views, bulk operations, and full entity detail."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card space-y-4">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Search name or email" />
          <select value={className} onChange={(event) => { setClassName(event.target.value); setPage(1); }} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All classes</option>
            {(availableFilters.classNames || []).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={grade} onChange={(event) => { setGrade(event.target.value); setPage(1); }} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All grades</option>
            {(availableFilters.grades || []).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={riskLevel} onChange={(event) => { setRiskLevel(event.target.value); setPage(1); }} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All risk levels</option>
            {(availableFilters.riskLevels || []).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={lifecycleState} onChange={(event) => { setLifecycleState(event.target.value); setPage(1); }} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All lifecycle states</option>
            {(availableFilters.lifecycleStates || []).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {SORT_OPTIONS.map((item) => <option key={item.value} value={item.value}>Sort by {item.label}</option>)}
          </select>
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <select value={String(pageSize)} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {[25, 50, 100, 200].map((item) => <option key={item} value={item}>{item} per page</option>)}
          </select>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-2 md:grid-cols-[1fr_220px_auto_auto]">
            <input value={newViewTitle} onChange={(event) => setNewViewTitle(event.target.value)} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="New saved view title" />
            <select
              value={activeViewId}
              onChange={(event) => {
                const nextId = event.target.value;
                setActiveViewId(nextId);
                const match = views.find((item) => item.id === nextId);
                if (match) applySavedView(match);
              }}
              className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="">Saved views</option>
              {views.map((item) => <option key={item.id} value={item.id}>{item.title}{item.isDefault ? ' (default)' : ''}</option>)}
            </select>
            <button type="button" className="action-btn" onClick={handleSaveView} disabled={saving}>Save View</button>
            <button type="button" className="action-btn" onClick={handleDeleteView} disabled={saving}>Delete View</button>
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-text-secondary">
            <input type="checkbox" checked={markDefaultView} onChange={(event) => setMarkDefaultView(event.target.checked)} />
            Mark default
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {COLUMN_OPTIONS.map((column) => {
            const active = visibleColumns.includes(column.key);
            return (
              <button
                key={column.key}
                type="button"
                className={`action-btn rounded-full px-3 py-1 text-xs ${active ? 'border-transparent bg-primary text-white' : ''}`}
                onClick={() =>
                  setVisibleColumns((current) => {
                    if (current.includes(column.key)) return current.length === 1 ? current : current.filter((item) => item !== column.key);
                    return [...current, column.key];
                  })
                }
              >
                {column.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-text-primary">{totalCount.toLocaleString('en-US')} students total</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="action-btn" onClick={handleExportFiltered} disabled={saving}>Export Filtered</button>
            <button type="button" className="action-btn" onClick={handleExportSelected} disabled={saving}>Export Selected</button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[220px_220px_220px_auto]">
          <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="archive">Archive</option>
            <option value="restore">Restore</option>
            <option value="set_lifecycle">Set lifecycle state</option>
            <option value="move_class">Move class</option>
          </select>
          {bulkAction === 'move_class' ? (
            <select value={bulkClassName} onChange={(event) => setBulkClassName(event.target.value)} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
              <option value="">Select target class</option>
              {(availableFilters.classNames || []).map((item) => <option key={`bulk-${item}`} value={item}>{item}</option>)}
            </select>
          ) : null}
          {bulkAction === 'set_lifecycle' ? (
            <select value={bulkLifecycleState} onChange={(event) => setBulkLifecycleState(event.target.value)} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
              {LIFECYCLE_OPTIONS.map((item) => <option key={`lifecycle-${item}`} value={item}>{item}</option>)}
            </select>
          ) : null}
          <button type="button" className="action-btn-primary" onClick={handleBulkAction} disabled={saving}>
            Run Bulk Action ({selectedIds.size})
          </button>
        </div>

        {loading ? (
          <div className="grid gap-2"><div className="skeleton h-12" /><div className="skeleton h-12" /><div className="skeleton h-12" /></div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-3 py-2"><input type="checkbox" checked={allRowsSelected} onChange={toggleSelectAllCurrentPage} /></th>
                  {activeColumns.map((column) => <th key={`header-${column.key}`} className="px-3 py-2 text-xs font-semibold text-text-secondary">{column.label}</th>)}
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">Detail</th>
                </tr>
              </thead>
              <tbody>
                {!rows.length ? (
                  <tr><td colSpan={activeColumns.length + 2} className="px-3 py-8 text-center text-text-secondary">No students matched this view.</td></tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="px-3 py-2"><input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelected(row.id)} /></td>
                      {activeColumns.map((column) => <td key={`${row.id}-${column.key}`} className="px-3 py-2 text-text-primary">{column.key === 'isActive' ? statusLabel(row.isActive) : row[column.key] ?? '-'}</td>)}
                      <td className="px-3 py-2"><button type="button" className="action-btn" onClick={() => handleOpenDetail(row.id)}>Open</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-secondary">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button type="button" className="action-btn" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>Previous</button>
            <button type="button" className="action-btn" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages || loading}>Next</button>
          </div>
        </div>
      </section>

      {selectedStudentId ? (
        <section className="panel-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">Student Entity View</h2>
            <button type="button" className="action-btn" onClick={() => { setSelectedStudentId(''); setDetail(null); }}>Close</button>
          </div>

          {detailLoading ? (
            <div className="grid gap-2"><div className="skeleton h-16" /><div className="skeleton h-16" /></div>
          ) : detail ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Overview</h3>
                <p className="mt-2 text-xs text-text-secondary">{detail.student?.name} | {detail.student?.email} | Class {detail.student?.className || '-'}</p>
                <p className="mt-1 text-xs text-text-secondary">Lifecycle: {detail.student?.lifecycleState} | Avg grade: {Number(detail.overview?.averageGrade || 0).toFixed(2)} | Absent: {Number(detail.overview?.absentDays || 0)}</p>
              </article>

              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Attendance Heatmap</h3>
                <div className="mt-2 grid grid-cols-8 gap-2">
                  {(detail.attendanceHeatmap || []).slice(0, 40).map((item) => {
                    const status = String(item.status || '').toLowerCase();
                    const color = status === 'present' ? 'bg-success/80' : status === 'absent' ? 'bg-danger/80' : status === 'late' ? 'bg-warning/80' : 'bg-border';
                    return <div key={`${item.date}-${item.status}`} className={`h-5 rounded-sm ${color}`} title={`${item.date}: ${item.status}`} />;
                  })}
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3 lg:col-span-2">
                <h3 className="text-sm font-semibold text-text-primary">Schedule Preview</h3>
                <div className="mt-2 overflow-auto">
                  <table className="min-w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-2 py-1">Day</th><th className="px-2 py-1">Time</th><th className="px-2 py-1">Subject</th><th className="px-2 py-1">Teacher</th><th className="px-2 py-1">Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.schedulePreview || []).map((item) => (
                        <tr key={`${item.dayOfWeek}-${item.startTime}-${item.subject}`} className="border-b border-border/60">
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

              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Incident History</h3>
                <div className="mt-2 space-y-2">
                  {(detail.incidentHistory || []).slice(0, 8).map((item) => (
                    <div key={item._id || `${item.createdAt}-${item.subject}`} className="rounded-sm border border-border p-2 text-xs">
                      <p className="font-semibold text-text-primary">{item.subject || 'Incident'}</p>
                      <p className="text-text-secondary">{item.description || '-'}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3">
                <h3 className="text-sm font-semibold text-text-primary">Communication Log</h3>
                <div className="mt-2 space-y-2">
                  {(detail.communicationLog || []).slice(0, 8).map((item) => (
                    <div key={item.id} className="rounded-sm border border-border p-2 text-xs">
                      <p className="font-semibold text-text-primary">{item.subject || 'Message'}</p>
                      <p className="text-text-secondary">{item.message || '-'}</p>
                      <p className="text-text-secondary">{item.senderRole} | {item.ticketStatus}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-sm border border-border bg-background p-3 lg:col-span-2">
                <h3 className="text-sm font-semibold text-text-primary">Lifecycle Panels</h3>
                <p className="mt-2 text-xs text-text-secondary">Parent contact: {detail.parentContactBlock?.message || 'Unavailable'}</p>
                <p className="mt-1 text-xs text-text-secondary">Survey responses: {Number(detail.surveyParticipation?.totalResponses || 0)}</p>
              </article>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No student detail loaded.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
