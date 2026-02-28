import { useEffect, useMemo, useState } from 'react';
import {
  confirmAdminScheduleImport,
  copyAdminSchedulePattern,
  createAdminScheduleEntry,
  deleteAdminScheduleEntry,
  fetchAdminOverview,
  fetchAdminSchedule,
  previewAdminScheduleImport,
  suggestAdminScheduleSlot,
  updateAdminScheduleEntry,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';
import { useAdminEnterprise } from '../context/AdminEnterpriseContext';

const DAY_OPTIONS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
];

const DEFAULT_FORM = {
  className: '',
  teacherId: '',
  subject: '',
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '08:45',
  room: '',
  allowConflicts: false,
};

const toMinutes = (time) => {
  const value = String(time || '').trim();
  const parts = value.split(':');
  if (parts.length !== 2) return -1;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return -1;
  return hours * 60 + minutes;
};

const toTime = (minutes) => {
  const safe = Math.max(0, Math.min(24 * 60 - 1, Number(minutes || 0)));
  const hh = String(Math.floor(safe / 60)).padStart(2, '0');
  const mm = String(safe % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

const conflictLabel = (entry) => {
  const flags = entry?.conflictFlags || [];
  return flags.length ? flags.join(', ') : '';
};

const buildDefaultForm = ({ classes, teachers, subjects }) => {
  const firstClass = classes?.[0]?.name || '';
  const firstTeacher = teachers?.[0] || null;
  const teacherSubject = firstTeacher?.subject || firstTeacher?.subjects?.[0] || '';
  return {
    ...DEFAULT_FORM,
    className: firstClass,
    teacherId: firstTeacher?.id || '',
    subject: teacherSubject || subjects?.[0] || '',
  };
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

export default function SchedulePage() {
  const { token } = useAuth();
  const { selectedClass } = useAdminEnterprise();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);

  const [filters, setFilters] = useState({
    grade: '',
    teacherId: '',
    day: '',
  });

  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingEntryId, setEditingEntryId] = useState('');

  const [suggestionInputs, setSuggestionInputs] = useState({
    className: '',
    teacherId: '',
    dayOfWeek: 1,
    room: '',
    durationMinutes: 45,
  });
  const [suggestions, setSuggestions] = useState([]);

  const [patternCopy, setPatternCopy] = useState({
    fromClassName: '',
    toClassName: '',
    fromDay: '',
    toDay: '',
    allowConflicts: false,
  });

  const [ocrForm, setOcrForm] = useState({
    className: '',
    teacherId: '',
    ocrText: '',
    fileDataUrl: '',
  });
  const [ocrPreview, setOcrPreview] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const [dragEntryId, setDragEntryId] = useState('');

  const loadOverview = async () => {
    const payload = await fetchAdminOverview(token);
    const nextTeachers = payload.teachers || [];
    const nextClasses = payload.classes || [];
    const nextSubjects = payload.availableSubjects || [];
    const nextGrades = [...new Set(nextClasses.map((item) => item.grade).filter(Boolean))];

    setTeachers(nextTeachers);
    setClasses(nextClasses);
    setSubjects(nextSubjects);
    setGrades(nextGrades);

    setForm((current) => {
      const fallback = buildDefaultForm({
        classes: nextClasses,
        teachers: nextTeachers,
        subjects: nextSubjects,
      });
      return {
        ...fallback,
        ...current,
        className: current.className || fallback.className,
        teacherId: current.teacherId || fallback.teacherId,
        subject: current.subject || fallback.subject,
      };
    });

    setSuggestionInputs((current) => ({
      ...current,
      className: current.className || nextClasses?.[0]?.name || '',
      teacherId: current.teacherId || nextTeachers?.[0]?.id || '',
    }));

    setPatternCopy((current) => ({
      ...current,
      fromClassName: current.fromClassName || nextClasses?.[0]?.name || '',
      toClassName: current.toClassName || nextClasses?.[1]?.name || nextClasses?.[0]?.name || '',
    }));

    setOcrForm((current) => ({
      ...current,
      className: current.className || nextClasses?.[0]?.name || '',
      teacherId: current.teacherId || nextTeachers?.[0]?.id || '',
    }));
  };

  const loadSchedule = async (nextFilters = filters) => {
    const payload = await fetchAdminSchedule(token, nextFilters);
    setEntries(payload.entries || []);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');
        await loadOverview();
        if (!active) return;
        await loadSchedule();
      } catch (loadError) {
        if (active) setError(loadError?.message || 'Failed to load schedule data.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!selectedClass?.name) return;
    setForm((current) => ({ ...current, className: current.className || selectedClass.name }));
    setSuggestionInputs((current) => ({ ...current, className: current.className || selectedClass.name }));
    setPatternCopy((current) => ({
      ...current,
      fromClassName: current.fromClassName || selectedClass.name,
      toClassName: current.toClassName || selectedClass.name,
    }));
    setOcrForm((current) => ({ ...current, className: current.className || selectedClass.name }));
  }, [selectedClass?.name]);

  const rowsByDay = useMemo(() => {
    const grouped = DAY_OPTIONS.reduce((acc, item) => {
      acc[item.value] = [];
      return acc;
    }, {});

    (entries || []).forEach((entry) => {
      const day = Number(entry.dayOfWeek || 0);
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(entry);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key] = grouped[key].slice().sort((left, right) => String(left.startTime).localeCompare(String(right.startTime)));
    });

    return grouped;
  }, [entries]);

  const handleFilterChange = async (patch) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    try {
      setLoading(true);
      await loadSchedule(next);
    } catch (loadError) {
      setError(loadError?.message || 'Failed to apply schedule filters.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingEntryId('');
    setForm(
      buildDefaultForm({
        classes,
        teachers,
        subjects,
      })
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        className: form.className,
        teacherId: form.teacherId,
        subject: form.subject,
        dayOfWeek: Number(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room,
        allowConflicts: form.allowConflicts === true,
      };

      if (editingEntryId) {
        await updateAdminScheduleEntry(token, editingEntryId, payload);
        setSuccess('Schedule block updated.');
      } else {
        await createAdminScheduleEntry(token, payload);
        setSuccess('Schedule block created.');
      }

      await loadSchedule(filters);
      resetForm();
    } catch (saveError) {
      setError(saveError?.message || 'Failed to save schedule block.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete schedule block ${entry.className} ${entry.subject}?`)) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await deleteAdminScheduleEntry(token, entry.id);
      setSuccess('Schedule block deleted.');
      await loadSchedule(filters);
      if (editingEntryId === entry.id) resetForm();
    } catch (deleteError) {
      setError(deleteError?.message || 'Failed to delete schedule block.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntryId(entry.id);
    setForm({
      className: entry.className || '',
      teacherId: entry.teacherId || '',
      subject: entry.subject || '',
      dayOfWeek: Number(entry.dayOfWeek || 1),
      startTime: entry.startTime || '08:00',
      endTime: entry.endTime || '08:45',
      room: entry.room || '',
      allowConflicts: false,
    });
  };

  const handleQuickResize = async (entry, deltaMinutes) => {
    const start = toMinutes(entry.startTime);
    const end = toMinutes(entry.endTime);
    if (start < 0 || end < 0) return;
    const nextEnd = Math.max(start + 15, end + deltaMinutes);
    try {
      setSaving(true);
      await updateAdminScheduleEntry(token, entry.id, {
        endTime: toTime(nextEnd),
        allowConflicts: true,
      });
      await loadSchedule(filters);
      setSuccess('Block duration updated.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to resize block.');
    } finally {
      setSaving(false);
    }
  };

  const handleDropToDay = async (dayOfWeek) => {
    if (!dragEntryId) return;
    try {
      setSaving(true);
      await updateAdminScheduleEntry(token, dragEntryId, { dayOfWeek, allowConflicts: true });
      await loadSchedule(filters);
      setSuccess('Block moved to new day.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to move block.');
    } finally {
      setSaving(false);
      setDragEntryId('');
    }
  };

  const handleSuggestSlot = async () => {
    try {
      setSaving(true);
      setError('');
      const payload = await suggestAdminScheduleSlot(token, suggestionInputs);
      setSuggestions(payload.suggestions || []);
    } catch (saveError) {
      setError(saveError.message || 'Failed to suggest available slots.');
      setSuggestions([]);
    } finally {
      setSaving(false);
    }
  };

  const handleApplySuggestion = (item) => {
    setForm((current) => ({
      ...current,
      className: suggestionInputs.className,
      teacherId: suggestionInputs.teacherId,
      dayOfWeek: Number(item.dayOfWeek || 1),
      startTime: item.startTime || current.startTime,
      endTime: item.endTime || current.endTime,
      room: suggestionInputs.room || current.room,
    }));
    setSuccess('Suggestion applied to editor form.');
  };

  const handlePatternCopy = async () => {
    try {
      setSaving(true);
      setError('');
      const payload = await copyAdminSchedulePattern(token, patternCopy);
      setSuccess(`Pattern copy complete. Created ${Number(payload.copiedCount || 0)} blocks.`);
      await loadSchedule(filters);
    } catch (saveError) {
      setError(saveError.message || 'Failed to copy schedule pattern.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewOcr = async () => {
  try {
    setOcrLoading(true);
    setError('');

    const PERIOD_TIME_MAP = {
      1: { start: '08:00', end: '08:45' },
      2: { start: '08:45', end: '09:30' },
      3: { start: '09:30', end: '10:15' },
      4: { start: '10:30', end: '11:15' },
      5: { start: '11:15', end: '12:00' },
      6: { start: '12:30', end: '13:15' },
      7: { start: '13:15', end: '14:00' },
    };

    const DAY_MAP = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
      الاثنين: 1,
      الثلاثاء: 2,
      الاربعاء: 3,
      الأربعاء: 3,
      الخميس: 4,
      الجمعة: 5,
      السبت: 6,
      الاحد: 7,
      الأحد: 7,
    };

    let preparedRows = [];

    // 🔍 Detect grid format (Day,1,2,3...)
    if (ocrForm.ocrText.includes(',') && ocrForm.ocrText.toLowerCase().includes('day')) {
      const lines = ocrForm.ocrText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        throw new Error('Invalid schedule format.');
      }

      const header = lines[0].split(',').map((h) => h.trim());
      const periodNumbers = header.slice(1).map((p) => parseInt(p));

      lines.slice(1).forEach((line) => {
        const parts = line.split(',').map((p) => p.trim());
        const dayRaw = parts[0].toLowerCase();

        const dayOfWeek =
          Object.keys(DAY_MAP).find((key) => dayRaw.includes(key)) !== undefined
            ? DAY_MAP[
                Object.keys(DAY_MAP).find((key) => dayRaw.includes(key))
              ]
            : null;

        if (!dayOfWeek) return;

        parts.slice(1).forEach((subject, index) => {
          if (!subject || subject === '-' || subject === '—') return;

          const period = periodNumbers[index];
          const time = PERIOD_TIME_MAP[period];

          if (!time) return;

          preparedRows.push({
            dayOfWeek,
            startTime: time.start,
            endTime: time.end,
            subject: subject.trim(),
            room: ocrForm.defaultRoom || '',
          });
        });
      });

      setOcrLoading(false);
      return;
    }

// 🔁 Fallback to backend AI extraction
const payload = await previewAdminScheduleImport(token, {
  className: ocrForm.className,
  teacherId: ocrForm.teacherId,
  ocrText: ocrForm.ocrText,
  fileDataUrl: ocrForm.fileDataUrl,
});

setOcrPreview(payload);
  } catch (err) {
    console.error(err);
    setError(
      err.response?.data?.message ||
        err.message ||
        'Failed to preview OCR data'
    );
  } finally {
    setOcrLoading(false);
  }
};

  const handleConfirmOcrImport = async () => {
    if (!ocrPreview?.rows?.length) return;
    try {
      setOcrLoading(true);
      setError('');
      const payload = await confirmAdminScheduleImport(token, {
        className: ocrForm.className,
        teacherId: ocrForm.teacherId,
        rows: ocrPreview.rows,
        allowConflicts: true,
      });
      setSuccess(`OCR import complete. Created ${Number(payload.createdCount || 0)} rows.`);
      setOcrPreview(null);
      await loadSchedule(filters);
    } catch (saveError) {
      setError(saveError.message || 'Failed to import OCR rows.');
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="Enterprise Scheduling Engine"
        subtitle="Visual weekly timetable, conflict detection, auto-slot suggestions, pattern copy, and OCR-assisted import."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <div className="grid gap-3 md:grid-cols-3">
          <select value={filters.grade} onChange={(event) => handleFilterChange({ grade: event.target.value })} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All grades</option>
            {grades.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={filters.teacherId} onChange={(event) => handleFilterChange({ teacherId: event.target.value })} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All teachers</option>
            {teachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={filters.day} onChange={(event) => handleFilterChange({ day: event.target.value })} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All days</option>
            {DAY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Weekly Visual Timetable Grid (Drag to Move)</h2>
        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-5">
            {DAY_OPTIONS.map((day) => (
              <div
                key={`day-col-${day.value}`}
                className="rounded-sm border border-border bg-background p-2"
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDropToDay(day.value)}
              >
                <h3 className="mb-2 text-sm font-semibold text-text-primary">{day.label}</h3>
                <div className="space-y-2">
                  {(rowsByDay[day.value] || []).map((entry) => (
                    <article
                      key={entry.id}
                      draggable
                      onDragStart={() => setDragEntryId(entry.id)}
                      className={`rounded-sm border p-2 text-xs ${entry.conflictFlags?.length ? 'border-danger/40 bg-danger/5' : 'border-border bg-white'}`}
                    >
                      <p className="font-semibold text-text-primary">{entry.startTime} - {entry.endTime}</p>
                      <p className="text-text-secondary">{entry.className} | {entry.subject}</p>
                      <p className="text-text-secondary">{entry.teacherName || '-'} | Room {entry.room || '-'}</p>
                      {entry.conflictFlags?.length ? <p className="mt-1 text-danger">Conflict: {conflictLabel(entry)}</p> : null}
                      <div className="mt-2 flex flex-wrap gap-1">
                        <button type="button" className="action-btn px-2 py-1 text-[11px]" onClick={() => handleEdit(entry)}>Edit</button>
                        <button type="button" className="action-btn px-2 py-1 text-[11px]" onClick={() => handleDelete(entry)}>Delete</button>
                        <button type="button" className="action-btn px-2 py-1 text-[11px]" onClick={() => handleQuickResize(entry, -5)}>-5m</button>
                        <button type="button" className="action-btn px-2 py-1 text-[11px]" onClick={() => handleQuickResize(entry, 5)}>+5m</button>
                      </div>
                    </article>
                  ))}
                  {!rowsByDay[day.value]?.length ? <p className="text-xs text-text-secondary">No blocks</p> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">{editingEntryId ? 'Edit Schedule Block' : 'Create Schedule Block'}</h2>
        <form className="grid gap-3 lg:grid-cols-4" onSubmit={handleSubmit}>
          <select value={form.className} onChange={(event) => setForm((current) => ({ ...current, className: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {classes.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
          <select value={form.teacherId} onChange={(event) => setForm((current) => ({ ...current, teacherId: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {teachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={String(form.dayOfWeek)} onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {DAY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <input type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" />
          <input type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" />
          <input value={form.room} onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Room" />
          <label className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-sm">
            <input type="checkbox" checked={form.allowConflicts} onChange={(event) => setForm((current) => ({ ...current, allowConflicts: event.target.checked }))} />
            Allow conflicts
          </label>
          <div className="flex gap-2">
            <button type="submit" className="action-btn-primary" disabled={saving}>{editingEntryId ? 'Update Block' : 'Create Block'}</button>
            {editingEntryId ? <button type="button" className="action-btn" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Intelligent Time Allocation</h2>
        <div className="grid gap-3 md:grid-cols-5">
          <select value={suggestionInputs.className} onChange={(event) => setSuggestionInputs((current) => ({ ...current, className: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {classes.map((item) => <option key={`s-class-${item.id}`} value={item.name}>{item.name}</option>)}
          </select>
          <select value={suggestionInputs.teacherId} onChange={(event) => setSuggestionInputs((current) => ({ ...current, teacherId: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {teachers.map((item) => <option key={`s-teacher-${item.id}`} value={item.id}>{item.name}</option>)}
          </select>
          <select value={String(suggestionInputs.dayOfWeek)} onChange={(event) => setSuggestionInputs((current) => ({ ...current, dayOfWeek: Number(event.target.value) }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {DAY_OPTIONS.map((item) => <option key={`s-day-${item.value}`} value={item.value}>{item.label}</option>)}
          </select>
          <input value={suggestionInputs.room} onChange={(event) => setSuggestionInputs((current) => ({ ...current, room: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Room (optional)" />
          <input type="number" min={15} step={5} value={suggestionInputs.durationMinutes} onChange={(event) => setSuggestionInputs((current) => ({ ...current, durationMinutes: Number(event.target.value || 45) }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Duration" />
        </div>
        <button type="button" className="action-btn-primary" onClick={handleSuggestSlot} disabled={saving}>Suggest Available Slots</button>
        <div className="space-y-2">
          {suggestions.map((item, index) => (
            <article key={`${item.dayOfWeek}-${item.startTime}-${index}`} className="rounded-sm border border-border bg-background p-2 text-sm">
              <p className="font-semibold text-text-primary">Day {item.dayOfWeek} | {item.startTime} - {item.endTime}</p>
              <button type="button" className="action-btn mt-2" onClick={() => handleApplySuggestion(item)}>Use in Editor</button>
            </article>
          ))}
          {!suggestions.length ? <p className="text-xs text-text-secondary">No suggestions loaded yet.</p> : null}
        </div>
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Pattern Replication</h2>
        <div className="grid gap-3 md:grid-cols-5">
          <select value={patternCopy.fromClassName} onChange={(event) => setPatternCopy((current) => ({ ...current, fromClassName: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {classes.map((item) => <option key={`from-${item.id}`} value={item.name}>From: {item.name}</option>)}
          </select>
          <select value={patternCopy.toClassName} onChange={(event) => setPatternCopy((current) => ({ ...current, toClassName: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {classes.map((item) => <option key={`to-${item.id}`} value={item.name}>To: {item.name}</option>)}
          </select>
          <select value={patternCopy.fromDay} onChange={(event) => setPatternCopy((current) => ({ ...current, fromDay: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">All days</option>
            {DAY_OPTIONS.map((item) => <option key={`from-day-${item.value}`} value={item.value}>From day: {item.label}</option>)}
          </select>
          <select value={patternCopy.toDay} onChange={(event) => setPatternCopy((current) => ({ ...current, toDay: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            <option value="">Keep original day</option>
            {DAY_OPTIONS.map((item) => <option key={`to-day-${item.value}`} value={item.value}>To day: {item.label}</option>)}
          </select>
          <label className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-sm">
            <input type="checkbox" checked={patternCopy.allowConflicts} onChange={(event) => setPatternCopy((current) => ({ ...current, allowConflicts: event.target.checked }))} />
            Allow conflicts
          </label>
        </div>
        <button type="button" className="action-btn-primary" onClick={handlePatternCopy} disabled={saving}>Copy Schedule Pattern</button>
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">OCR Schedule Import</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <select value={ocrForm.className} onChange={(event) => setOcrForm((current) => ({ ...current, className: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {classes.map((item) => <option key={`ocr-class-${item.id}`} value={item.name}>{item.name}</option>)}
          </select>
          <select value={ocrForm.teacherId} onChange={(event) => setOcrForm((current) => ({ ...current, teacherId: event.target.value }))} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
            {teachers.map((item) => <option key={`ocr-teacher-${item.id}`} value={item.id}>{item.name}</option>)}
          </select>
          <input
            type="file"
            accept="image/*"
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                const fileDataUrl = await readFileAsDataUrl(file);
                setOcrForm((current) => ({ ...current, fileDataUrl }));
              } catch {
                setError('Failed to parse selected image.');
              }
            }}
          />
        </div>
        <textarea value={ocrForm.ocrText} onChange={(event) => setOcrForm((current) => ({ ...current, ocrText: event.target.value }))} className="focus-ring min-h-[120px] w-full rounded-sm border border-border px-3 py-2 text-sm" placeholder="Paste OCR text here..." />
        <button type="button" className="action-btn-primary" onClick={handlePreviewOcr} disabled={ocrLoading}>Preview OCR Import</button>

        {ocrLoading ? (
          <div className="grid gap-2">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
        ) : ocrPreview ? (
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">Rows: {Number(ocrPreview.summary?.totalRows || 0)} | Valid: {Number(ocrPreview.summary?.validRows || 0)} | Conflicts: {Number(ocrPreview.summary?.conflictRows || 0)}</p>
            <div className="overflow-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-2 py-1">Skip</th>
                    <th className="px-2 py-1">Day</th>
                    <th className="px-2 py-1">Start</th>
                    <th className="px-2 py-1">End</th>
                    <th className="px-2 py-1">Subject</th>
                    <th className="px-2 py-1">Room</th>
                    <th className="px-2 py-1">Issues</th>
                    <th className="px-2 py-1">Conflicts</th>
                  </tr>
                </thead>
                <tbody>
                  {(ocrPreview.rows || []).map((row, index) => (
                    <tr key={`ocr-row-${index}`} className="border-b border-border/60">
                      <td className="px-2 py-1">
                        <input
                          type="checkbox"
                          checked={row.skip === true}
                          onChange={(event) =>
                            setOcrPreview((current) => ({
                              ...current,
                              rows: (current.rows || []).map((item, rowIndex) => (rowIndex === index ? { ...item, skip: event.target.checked } : item)),
                            }))
                          }
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input value={row.dayOfWeek || ''} onChange={(event) => setOcrPreview((current) => ({ ...current, rows: (current.rows || []).map((item, rowIndex) => (rowIndex === index ? { ...item, dayOfWeek: Number(event.target.value || 1) } : item)) }))} className="focus-ring w-16 rounded-sm border border-border px-2 py-1 text-xs" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={row.startTime || ''} onChange={(event) => setOcrPreview((current) => ({ ...current, rows: (current.rows || []).map((item, rowIndex) => (rowIndex === index ? { ...item, startTime: event.target.value } : item)) }))} className="focus-ring w-20 rounded-sm border border-border px-2 py-1 text-xs" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={row.endTime || ''} onChange={(event) => setOcrPreview((current) => ({ ...current, rows: (current.rows || []).map((item, rowIndex) => (rowIndex === index ? { ...item, endTime: event.target.value } : item)) }))} className="focus-ring w-20 rounded-sm border border-border px-2 py-1 text-xs" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={row.subject || ''} onChange={(event) => setOcrPreview((current) => ({ ...current, rows: (current.rows || []).map((item, rowIndex) => (rowIndex === index ? { ...item, subject: event.target.value } : item)) }))} className="focus-ring w-28 rounded-sm border border-border px-2 py-1 text-xs" />
                      </td>
                      <td className="px-2 py-1">
                        <input value={row.room || ''} onChange={(event) => setOcrPreview((current) => ({ ...current, rows: (current.rows || []).map((item, rowIndex) => (rowIndex === index ? { ...item, room: event.target.value } : item)) }))} className="focus-ring w-20 rounded-sm border border-border px-2 py-1 text-xs" />
                      </td>
                      <td className="px-2 py-1">{(row.issues || []).join(', ') || '-'}</td>
                      <td className="px-2 py-1">{(row.conflictFlags || []).join(', ') || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="action-btn-primary" onClick={handleConfirmOcrImport} disabled={ocrLoading}>Confirm OCR Import</button>
          </div>
        ) : (
          <p className="text-xs text-text-secondary">Run preview to review extracted rows before import.</p>
        )}
      </section>
    </div>
  );
}
