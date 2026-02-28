import { useEffect, useMemo, useState } from 'react';
import {
  createAdminScheduleEntry,
  deleteAdminScheduleEntry,
  fetchAdminOverview,
  fetchAdminSchedule,
  updateAdminScheduleEntry,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const DAY_LABELS = {
  1: 'الاثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
};

const DEFAULT_FORM = {
  id: '',
  className: '',
  teacherId: '',
  subject: '',
  dayOfWeek: '1',
  startTime: '08:00',
  endTime: '08:45',
  room: '',
};

const buildDefaultForm = ({ classes, teachers, subjects }) => {
  const firstClass = classes[0]?.name || '';
  const firstTeacher = teachers[0] || null;
  const firstTeacherSubject = firstTeacher?.subject || firstTeacher?.subjects?.[0] || '';
  const firstSubject = firstTeacherSubject || subjects[0] || '';

  return {
    ...DEFAULT_FORM,
    className: firstClass,
    teacherId: firstTeacher?.id || '',
    subject: firstSubject,
  };
};

export default function SchedulePage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [entries, setEntries] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [filters, setFilters] = useState({
    grade: '',
    teacherId: '',
    day: '',
  });
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingEntryId, setEditingEntryId] = useState('');

  const selectedTeacher = useMemo(
    () => teachers.find((item) => item.id === form.teacherId) || null,
    [teachers, form.teacherId]
  );

  const classOptions = useMemo(() => {
    if (!selectedTeacher?.classes?.length) {
      return classes;
    }

    const allowedClassNames = new Set(selectedTeacher.classes);
    return classes.filter((item) => allowedClassNames.has(item.name));
  }, [classes, selectedTeacher]);

  const subjectOptions = useMemo(() => {
    const assigned = [
      selectedTeacher?.subject,
      ...(Array.isArray(selectedTeacher?.subjects) ? selectedTeacher.subjects : []),
    ]
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    const uniqueAssigned = [...new Set(assigned)];
    return uniqueAssigned.length ? uniqueAssigned : subjects;
  }, [selectedTeacher, subjects]);

  useEffect(() => {
    setForm((current) => {
      const hasClass = classOptions.some((item) => item.name === current.className);
      const hasSubject = subjectOptions.includes(current.subject);
      const nextClassName = hasClass ? current.className : classOptions[0]?.name || current.className;
      const nextSubject = hasSubject ? current.subject : subjectOptions[0] || current.subject;

      if (nextClassName === current.className && nextSubject === current.subject) {
        return current;
      }

      return {
        ...current,
        className: nextClassName,
        subject: nextSubject,
      };
    });
  }, [classOptions, subjectOptions]);

  const loadOverview = async () => {
    const overview = await fetchAdminOverview(token);
    const nextTeachers = overview.teachers || [];
    const nextClasses = overview.classes || [];
    const nextSubjects = overview.availableSubjects || [];

    setTeachers(nextTeachers);
    setClasses(nextClasses);
    setSubjects(nextSubjects);

    const distinctGrades = [
      ...new Set(nextClasses.map((item) => String(item.grade || '').trim()).filter(Boolean)),
    ].sort((left, right) => left.localeCompare(right));
    setGrades(distinctGrades);

    setForm((current) => {
      const teacherIds = new Set(nextTeachers.map((item) => item.id));
      const classNames = new Set(nextClasses.map((item) => item.name));
      const fallback = buildDefaultForm({
        classes: nextClasses,
        teachers: nextTeachers,
        subjects: nextSubjects,
      });

      const teacher = nextTeachers.find((item) => item.id === current.teacherId);
      const teacherSubject = teacher?.subject || teacher?.subjects?.[0] || '';

      return {
        ...fallback,
        ...current,
        className: classNames.has(current.className) ? current.className : fallback.className,
        teacherId: teacherIds.has(current.teacherId) ? current.teacherId : fallback.teacherId,
        subject: current.subject || teacherSubject || fallback.subject,
      };
    });
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
        if (!active) {
          return;
        }
        await loadSchedule();
      } catch (loadError) {
        if (active) {
          setError(loadError?.message || 'تعذر تحميل الجدول الأكاديمي.');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFilterChange = async (nextPatch) => {
    const nextFilters = { ...filters, ...nextPatch };
    setFilters(nextFilters);

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await loadSchedule(nextFilters);
    } catch (loadError) {
      setError(loadError?.message || 'تعذر تطبيق الفلاتر.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = (teacherId) => {
    const teacher = teachers.find((item) => item.id === teacherId);
    const teacherSubject = teacher?.subject || teacher?.subjects?.[0] || '';
    const teacherClasses = Array.isArray(teacher?.classes) ? teacher.classes : [];
    const nextClassName = teacherClasses.includes(form.className)
      ? form.className
      : teacherClasses[0] || form.className;

    setForm((current) => ({
      ...current,
      teacherId,
      className: nextClassName,
      subject: teacherSubject || current.subject,
    }));
  };

  const resetFormToDefaults = () => {
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

    if (!form.className || !form.teacherId || !form.subject || !form.dayOfWeek || !form.startTime || !form.endTime) {
      setError('الصف والمعلم والمادة واليوم ووقت الحصة مطلوبة.');
      return;
    }

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
      };

      if (editingEntryId) {
        await updateAdminScheduleEntry(token, editingEntryId, payload);
        setSuccess('تم تحديث الحصة بنجاح.');
      } else {
        await createAdminScheduleEntry(token, payload);
        setSuccess('تمت إضافة الحصة بنجاح.');
      }

      await loadSchedule(filters);
      resetFormToDefaults();
    } catch (saveError) {
      setError(saveError?.message || 'تعذر حفظ بيانات الحصة.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntryId(entry.id);
    setError('');
    setSuccess('');
    setForm({
      id: entry.id,
      className: entry.className || '',
      teacherId: entry.teacherId || '',
      subject: entry.subject || '',
      dayOfWeek: String(entry.dayOfWeek || ''),
      startTime: entry.startTime || '',
      endTime: entry.endTime || '',
      room: entry.room || '',
    });
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`تأكيد حذف الحصة: ${entry.className} - ${entry.subject}؟`)) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await deleteAdminScheduleEntry(token, entry.id);
      setSuccess('تم حذف الحصة بنجاح.');
      await loadSchedule(filters);
      if (editingEntryId === entry.id) {
        resetFormToDefaults();
      }
    } catch (deleteError) {
      setError(deleteError?.message || 'تعذر حذف الحصة.');
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(
    () =>
      entries
        .slice()
        .sort((left, right) => {
          if (left.dayOfWeek !== right.dayOfWeek) {
            return Number(left.dayOfWeek || 0) - Number(right.dayOfWeek || 0);
          }
          return String(left.startTime || '').localeCompare(String(right.startTime || ''));
        }),
    [entries]
  );

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="الجدول الأكاديمي"
        subtitle="إدارة الحصص الأكاديمية حسب الصف والمعلم واليوم."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <div className="mb-3 grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">المرحلة</span>
            <select
              value={filters.grade}
              onChange={(event) => handleFilterChange({ grade: event.target.value })}
              className="focus-ring h-10 w-full rounded-sm border border-border bg-white px-3 text-sm"
            >
              <option value="">كل المراحل</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">المعلم</span>
            <select
              value={filters.teacherId}
              onChange={(event) => handleFilterChange({ teacherId: event.target.value })}
              className="focus-ring h-10 w-full rounded-sm border border-border bg-white px-3 text-sm"
            >
              <option value="">كل المعلمين</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">اليوم</span>
            <select
              value={filters.day}
              onChange={(event) => handleFilterChange({ day: event.target.value })}
              className="focus-ring h-10 w-full rounded-sm border border-border bg-white px-3 text-sm"
            >
              <option value="">كل الأيام</option>
              {Object.entries(DAY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel-card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-text-primary">
            {editingEntryId ? 'تعديل حصة' : 'إضافة حصة جديدة'}
          </h2>
          {editingEntryId ? (
            <button type="button" className="action-btn" onClick={resetFormToDefaults} disabled={saving}>
              إلغاء التعديل
            </button>
          ) : null}
        </div>

        <form className="grid gap-3 lg:grid-cols-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">الصف</span>
            <select
              value={form.className}
              onChange={(event) => setForm((current) => ({ ...current, className: event.target.value }))}
              className="focus-ring h-10 w-full rounded-sm border border-border bg-white px-3 text-sm"
            >
              {classOptions.map((classItem) => (
                <option key={classItem.id} value={classItem.name}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">المعلم</span>
            <select
              value={form.teacherId}
              onChange={(event) => handleTeacherChange(event.target.value)}
              className="focus-ring h-10 w-full rounded-sm border border-border bg-white px-3 text-sm"
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">المادة</span>
            <select
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              className="focus-ring h-10 w-full rounded-sm border border-border bg-white px-3 text-sm"
            >
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">اليوم</span>
            <select
              value={form.dayOfWeek}
              onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: event.target.value }))}
              className="focus-ring h-10 w-full rounded-sm border border-border bg-white px-3 text-sm"
            >
              {Object.entries(DAY_LABELS).map(([key, label]) => (
                <option key={`form-day-${key}`} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">وقت البداية</span>
            <input
              type="time"
              value={form.startTime}
              onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
              className="focus-ring h-10 w-full rounded-sm border border-border px-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">وقت النهاية</span>
            <input
              type="time"
              value={form.endTime}
              onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
              className="focus-ring h-10 w-full rounded-sm border border-border px-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-text-secondary">القاعة</span>
            <input
              type="text"
              value={form.room}
              onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))}
              className="focus-ring h-10 w-full rounded-sm border border-border px-3 text-sm"
              placeholder="A-12"
            />
          </label>

          <div className="flex items-end">
            <button type="submit" className="action-btn-primary h-10" disabled={saving}>
              {editingEntryId ? 'حفظ التعديل' : 'إضافة الحصة'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel-card">
        {loading ? (
          <div className="grid gap-2">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
        ) : !rows.length ? (
          <p className="text-sm text-text-secondary">Schedule not yet assigned.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-right">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">اليوم</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">الوقت</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">الصف</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">المادة</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">المعلم</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">القاعة</th>
                  <th className="px-3 py-2 text-xs font-semibold text-text-secondary">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/60">
                    <td className="px-3 py-3 text-sm text-text-primary">{DAY_LABELS[entry.dayOfWeek] || entry.dayName}</td>
                    <td className="px-3 py-3 text-sm text-text-primary">
                      {entry.startTime} - {entry.endTime}
                    </td>
                    <td className="px-3 py-3 text-sm text-text-primary">{entry.className}</td>
                    <td className="px-3 py-3 text-sm text-text-primary">{entry.subject}</td>
                    <td className="px-3 py-3 text-sm text-text-primary">{entry.teacherName || '-'}</td>
                    <td className="px-3 py-3 text-sm text-text-secondary">{entry.room || '-'}</td>
                    <td className="px-3 py-3 text-sm text-text-primary">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="action-btn" onClick={() => handleEdit(entry)} disabled={saving}>
                          تعديل
                        </button>
                        <button type="button" className="action-btn" onClick={() => handleDelete(entry)} disabled={saving}>
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
