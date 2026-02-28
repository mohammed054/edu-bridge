import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createTeacherAnnouncement,
  createTeacherIncident,
  fetchTeacherDashboardInsights,
  fetchTeacherExams,
  fetchTeacherWeeklySchedule,
  markTeacherAttendance,
} from '../../api/api';
import { useAuth } from '../../core/auth/useAuth';
import ModalComponent from './components/ModalComponent';
import './teacherPortal.css';

const DAY_LABELS = {
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
};

const EMPTY_INSIGHTS = {
  pendingResponses: 0,
  flaggedParents: 0,
  repeatedIncidents: 0,
};

const toClassStudentMap = (classes = []) =>
  classes.reduce((acc, classItem) => {
    acc[classItem.name] = classItem.students || [];
    return acc;
  }, {});

export default function TeacherSchedulePage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  const [entries, setEntries] = useState([]);
  const [classStudents, setClassStudents] = useState({});
  const [insights, setInsights] = useState(EMPTY_INSIGHTS);

  const [attendanceModal, setAttendanceModal] = useState({ open: false, entry: null });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceStatuses, setAttendanceStatuses] = useState({});

  const [postModal, setPostModal] = useState({ open: false, entry: null });
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');

  const [incidentModal, setIncidentModal] = useState({ open: false, entry: null });
  const [incidentStudentId, setIncidentStudentId] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('low');
  const [incidentDescription, setIncidentDescription] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [schedulePayload, classesPayload, insightsPayload] = await Promise.all([
        fetchTeacherWeeklySchedule(token),
        fetchTeacherExams(token),
        fetchTeacherDashboardInsights(token),
      ]);

      setEntries(schedulePayload.entries || []);
      setClassStudents(toClassStudentMap(classesPayload.classes || []));
      setInsights({
        pendingResponses: Number(insightsPayload.pendingResponses || 0),
        flaggedParents: Number(insightsPayload.flaggedParents || 0),
        repeatedIncidents: Number(insightsPayload.repeatedIncidents || 0),
      });
    } catch (loadError) {
      setError(loadError?.message || 'تعذر تحميل جدول المعلم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredEntries = useMemo(() => {
    if (!dayFilter) {
      return entries;
    }
    return entries.filter((entry) => String(entry.dayOfWeek) === String(dayFilter));
  }, [dayFilter, entries]);

  const entriesByDay = useMemo(() => {
    return filteredEntries.reduce((acc, entry) => {
      const dayKey = String(entry.dayOfWeek);
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(entry);
      return acc;
    }, {});
  }, [filteredEntries]);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const openAttendanceModal = (entry) => {
    resetMessages();
    const students = classStudents[entry.className] || [];
    const defaultStatuses = students.reduce((acc, student) => {
      acc[student.id] = 'present';
      return acc;
    }, {});
    setAttendanceStatuses(defaultStatuses);
    setAttendanceDate(new Date().toISOString().slice(0, 10));
    setAttendanceModal({ open: true, entry });
  };

  const saveAttendance = async () => {
    const entry = attendanceModal.entry;
    if (!entry) {
      return;
    }

    const students = classStudents[entry.className] || [];
    if (!students.length) {
      setError('لا يوجد طلاب ضمن الصف المحدد.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await markTeacherAttendance(token, {
        className: entry.className,
        subject: entry.subject,
        attendanceDate,
        slotStartTime: entry.startTime,
        slotEndTime: entry.endTime,
        entries: students.map((student) => ({
          studentId: student.id,
          status: attendanceStatuses[student.id] || 'present',
        })),
      });
      setSuccess('تم حفظ الحضور.');
      setAttendanceModal({ open: false, entry: null });
    } catch (saveError) {
      setError(saveError?.message || 'تعذر حفظ الحضور.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPostModal = (entry) => {
    resetMessages();
    setPostTitle('');
    setPostBody('');
    setPostModal({ open: true, entry });
  };

  const savePost = async () => {
    const entry = postModal.entry;
    if (!entry) {
      return;
    }

    if (!postTitle.trim() || !postBody.trim()) {
      setError('عنوان ومحتوى التحديث مطلوبان.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await createTeacherAnnouncement(token, {
        className: entry.className,
        subject: entry.subject,
        title: postTitle.trim(),
        body: postBody.trim(),
      });
      setSuccess('تم نشر التحديث.');
      setPostModal({ open: false, entry: null });
    } catch (saveError) {
      setError(saveError?.message || 'تعذر نشر التحديث.');
    } finally {
      setSubmitting(false);
    }
  };

  const openIncidentModal = (entry) => {
    resetMessages();
    const students = classStudents[entry.className] || [];
    setIncidentStudentId(students[0]?.id || '');
    setIncidentSeverity('low');
    setIncidentDescription('');
    setIncidentModal({ open: true, entry });
  };

  const saveIncident = async () => {
    const entry = incidentModal.entry;
    if (!entry) {
      return;
    }

    if (!incidentStudentId || !incidentDescription.trim()) {
      setError('الطالب ووصف الحادثة مطلوبان.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await createTeacherIncident(token, {
        className: entry.className,
        subject: entry.subject,
        studentId: incidentStudentId,
        severity: incidentSeverity,
        description: incidentDescription.trim(),
      });
      setSuccess('تم تسجيل الحادثة وإرسال إشعار ولي الأمر تلقائياً.');
      setIncidentModal({ open: false, entry: null });
      await loadData();
    } catch (saveError) {
      setError(saveError?.message || 'تعذر تسجيل الحادثة.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main dir="rtl" className="ht-theme min-h-screen bg-[var(--ht-bg-base)]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-12">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="ht-display text-[30px] font-semibold text-[var(--ht-neutral-900)]">الجدول الأسبوعي</h1>
            <p className="mt-1 text-[13px] text-[var(--ht-neutral-500)]">نظرة تشغيلية على حصصك الأكاديمية</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/teacher')}
            className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-subtle)]"
          >
            العودة للبوابة
          </button>
        </header>

        {error ? (
          <p className="mb-4 rounded-[4px] border border-[var(--ht-danger-100)] bg-[var(--ht-danger-100)] px-3 py-2 text-[13px] text-[var(--ht-danger-600)]">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mb-4 rounded-[4px] border border-[var(--ht-success-100)] bg-[var(--ht-success-100)] px-3 py-2 text-[13px] text-[var(--ht-success-600)]">
            {success}
          </p>
        ) : null}

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <article className="ht-surface p-4">
            <p className="text-[12px] text-[var(--ht-neutral-500)]">Pending responses</p>
            <p className="mt-2 text-[24px] font-semibold text-[var(--ht-neutral-900)]">{insights.pendingResponses}</p>
          </article>
          <article className="ht-surface p-4">
            <p className="text-[12px] text-[var(--ht-neutral-500)]">Flagged parents</p>
            <p className="mt-2 text-[24px] font-semibold text-[var(--ht-neutral-900)]">{insights.flaggedParents}</p>
          </article>
          <article className="ht-surface p-4">
            <p className="text-[12px] text-[var(--ht-neutral-500)]">Repeated incidents</p>
            <p className="mt-2 text-[24px] font-semibold text-[var(--ht-neutral-900)]">{insights.repeatedIncidents}</p>
          </article>
        </section>

        <section className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[20px] font-semibold text-[var(--ht-neutral-900)]">الحصص</h2>
          <select
            value={dayFilter}
            onChange={(event) => setDayFilter(event.target.value)}
            className="h-10 rounded-[4px] border border-[var(--ht-border-default)] bg-white px-3 text-[13px] text-[var(--ht-neutral-700)]"
          >
            <option value="">كل الأيام</option>
            {Object.entries(DAY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </section>

        {loading ? (
          <section className="grid gap-3">
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
            <div className="skeleton h-20" />
          </section>
        ) : !filteredEntries.length ? (
          <section className="ht-surface p-8 text-center">
            <p className="text-[16px] font-medium text-[var(--ht-neutral-800)]">Schedule not yet assigned.</p>
          </section>
        ) : (
          <section className="space-y-5">
            {Object.keys(entriesByDay)
              .sort((a, b) => Number(a) - Number(b))
              .map((dayKey) => (
                <article key={dayKey} className="ht-surface p-5">
                  <h3 className="mb-4 text-[18px] font-semibold text-[var(--ht-neutral-900)]">
                    {DAY_LABELS[dayKey] || dayKey}
                  </h3>
                  <div className="grid gap-3">
                    {entriesByDay[dayKey]
                      .slice()
                      .sort((left, right) => String(left.startTime).localeCompare(String(right.startTime)))
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-[4px] border border-[var(--ht-border-subtle)] bg-[var(--ht-bg-subtle)] p-4"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[14px] font-semibold text-[var(--ht-neutral-900)]">
                                {entry.startTime} - {entry.endTime}
                              </p>
                              <p className="text-[13px] text-[var(--ht-neutral-600)]">
                                {entry.className} · {entry.subject} · {entry.room || '-'}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openAttendanceModal(entry)}
                                className="ht-interactive inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[12px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-base)]"
                              >
                                Mark attendance
                              </button>
                              <button
                                type="button"
                                onClick={() => openPostModal(entry)}
                                className="ht-interactive inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[12px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-base)]"
                              >
                                Post update
                              </button>
                              <button
                                type="button"
                                onClick={() => openIncidentModal(entry)}
                                className="ht-interactive inline-flex h-9 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[12px] font-medium text-[var(--ht-neutral-700)] hover:bg-[var(--ht-bg-base)]"
                              >
                                Log incident
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </article>
              ))}
          </section>
        )}
      </div>

      <ModalComponent
        open={attendanceModal.open}
        onClose={() => setAttendanceModal({ open: false, entry: null })}
        title="تسجيل الحضور"
        description="تحديد حالة حضور الطلاب للحصة."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAttendanceModal({ open: false, entry: null })}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)]"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={saveAttendance}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white disabled:opacity-60"
            >
              {submitting ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </>
        }
      >
        <label className="mb-3 block">
          <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">تاريخ الحصة</span>
          <input
            type="date"
            value={attendanceDate}
            onChange={(event) => setAttendanceDate(event.target.value)}
            className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px]"
          />
        </label>
        <div className="space-y-2">
          {(classStudents[attendanceModal.entry?.className] || []).map((student) => (
            <div key={student.id} className="flex items-center justify-between rounded-[4px] border border-[var(--ht-border-subtle)] p-2">
              <p className="text-[13px] text-[var(--ht-neutral-700)]">{student.name}</p>
              <select
                value={attendanceStatuses[student.id] || 'present'}
                onChange={(event) =>
                  setAttendanceStatuses((current) => ({ ...current, [student.id]: event.target.value }))
                }
                className="h-8 rounded-[4px] border border-[var(--ht-border-default)] px-2 text-[12px]"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
          ))}
        </div>
      </ModalComponent>

      <ModalComponent
        open={postModal.open}
        onClose={() => setPostModal({ open: false, entry: null })}
        title="نشر تحديث أكاديمي"
        description="سيظهر التحديث ضمن مادة الحصة فقط."
        footer={
          <>
            <button
              type="button"
              onClick={() => setPostModal({ open: false, entry: null })}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)]"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={savePost}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white disabled:opacity-60"
            >
              {submitting ? 'جارٍ الحفظ...' : 'نشر'}
            </button>
          </>
        }
      >
        <label className="mb-3 block">
          <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">العنوان</span>
          <input
            type="text"
            value={postTitle}
            onChange={(event) => setPostTitle(event.target.value)}
            className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">المحتوى</span>
          <textarea
            value={postBody}
            onChange={(event) => setPostBody(event.target.value)}
            className="min-h-[110px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px]"
          />
        </label>
      </ModalComponent>

      <ModalComponent
        open={incidentModal.open}
        onClose={() => setIncidentModal({ open: false, entry: null })}
        title="تسجيل حادثة سلوكية"
        description="سيتم إرسال إشعار ولي الأمر تلقائياً."
        footer={
          <>
            <button
              type="button"
              onClick={() => setIncidentModal({ open: false, entry: null })}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)]"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={saveIncident}
              className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white disabled:opacity-60"
            >
              {submitting ? 'جارٍ الحفظ...' : 'تسجيل'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الطالب</span>
            <select
              value={incidentStudentId}
              onChange={(event) => setIncidentStudentId(event.target.value)}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px]"
            >
              {(classStudents[incidentModal.entry?.className] || []).map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">الشدة</span>
            <select
              value={incidentSeverity}
              onChange={(event) => setIncidentSeverity(event.target.value)}
              className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-[13px] text-[var(--ht-neutral-600)]">وصف الحادثة</span>
            <textarea
              value={incidentDescription}
              onChange={(event) => setIncidentDescription(event.target.value)}
              className="min-h-[110px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px]"
            />
          </label>
        </div>
      </ModalComponent>
    </main>
  );
}
