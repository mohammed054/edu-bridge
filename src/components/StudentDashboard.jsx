import { useEffect, useMemo, useState } from 'react';
import {
  fetchFeedbackList,
  fetchFeedbackOptions,
  fetchStudentProfile,
  submitStudentToAdminFeedback,
  submitStudentToTeacherFeedback,
} from '../api/api.js';
import { FEEDBACK_CATEGORIES } from '../constants/feedback.js';
import { HIKMAH_SUBJECTS } from '../constants/subjects.js';
import { toUserMessage } from '../utils/error.js';
import { formatDate, formatDateTime, formatNumber } from '../utils/format.js';
import { listExams, listHomework, listNotes, listStars } from '../utils/subjectStore.js';
import AppHeader from './AppHeader.jsx';
import FeedbackList from './FeedbackList.jsx';
import ToggleGroup from './ToggleGroup.jsx';
import LineTrendChart from './charts/LineTrendChart.jsx';
import BarProgressChart from './charts/BarProgressChart.jsx';
import RadialProgressChart from './charts/RadialProgressChart.jsx';

const SECTION_OPTIONS = [
  { value: 'subject', label: 'لوحة المادة' },
  { value: 'send', label: 'إرسال تغذية راجعة' },
  { value: 'history', label: 'سجل التغذية الراجعة' },
];

const FEEDBACK_TYPE_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'teacher_feedback,admin_feedback', label: 'وارد' },
  { value: 'student_to_teacher,student_to_admin', label: 'صادر' },
];

const SEND_TARGET_OPTIONS = [
  { value: 'teacher', label: 'إلى المعلم' },
  { value: 'admin', label: 'إلى الإدارة' },
];

const CATEGORY_OPTIONS = FEEDBACK_CATEGORIES.map((item) => ({
  value: item.key,
  label: item.label,
}));

export default function StudentDashboard({ session, onLogout }) {
  const [section, setSection] = useState('subject');
  const [subject, setSubject] = useState(HIKMAH_SUBJECTS[0]);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [storeTick, setStoreTick] = useState(0);
  const [options, setOptions] = useState({ classes: [], admins: [], subjects: [] });
  const [sendTarget, setSendTarget] = useState('teacher');
  const [teacherId, setTeacherId] = useState('');
  const [adminId, setAdminId] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const studentClass = session.user.classes?.[0] || '';
  const availableSubjects = useMemo(
    () => [...new Set([...(options.subjects || []), ...HIKMAH_SUBJECTS])],
    [options.subjects]
  );

  const classData = useMemo(
    () => (options.classes || []).find((item) => item.name === studentClass) || null,
    [options.classes, studentClass]
  );

  const teacherOptions = classData?.teachers || [];
  const adminOptions = options.admins || [];

  const loadOptions = async () => {
    try {
      const payload = await fetchFeedbackOptions(session.token);
      setOptions({
        classes: payload.classes || [],
        admins: payload.admins || [],
        subjects: payload.subjects || [],
      });
      if (!subject && payload.subjects?.length) {
        setSubject(payload.subjects[0]);
      }
      if (!adminId && payload.admins?.length) {
        setAdminId(payload.admins[0].id);
      }
    } catch (optionsError) {
      setError(toUserMessage(optionsError, 'تعذر تحميل خيارات الطالب.'));
    }
  };

  const loadProfile = async (nextSubject = subject) => {
    try {
      setLoadingProfile(true);
      const payload = await fetchStudentProfile(session.token, session.user.id, {
        subject: nextSubject,
      });
      setProfile(payload);
    } catch (profileError) {
      setError(toUserMessage(profileError, 'تعذر تحميل بيانات المادة.'));
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadFeedbacks = async (type = feedbackTypeFilter) => {
    try {
      setLoadingFeedbacks(true);
      const payload = await fetchFeedbackList(session.token, {
        studentId: session.user.id,
        subject,
        feedbackType: type,
      });
      setFeedbacks(payload.feedbacks || []);
    } catch (feedbackError) {
      setError(toUserMessage(feedbackError, 'تعذر تحميل السجل.'));
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    loadOptions();
    loadProfile(subject);
    loadFeedbacks(feedbackTypeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onStorage = () => setStoreTick((value) => value + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    loadProfile(subject);
    loadFeedbacks(feedbackTypeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  useEffect(() => {
    if (!teacherOptions.length) {
      setTeacherId('');
      return;
    }
    if (!teacherOptions.some((item) => item.id === teacherId)) {
      setTeacherId(teacherOptions[0].id);
    }
  }, [teacherOptions, teacherId]);

  useEffect(() => {
    if (!adminOptions.length) {
      setAdminId('');
      return;
    }
    if (!adminOptions.some((item) => item.id === adminId)) {
      setAdminId(adminOptions[0].id);
    }
  }, [adminOptions, adminId]);

  const localHomework = useMemo(
    () => listHomework({ className: studentClass, subject }),
    [studentClass, subject, storeTick]
  );
  const localExams = useMemo(
    () => listExams({ className: studentClass, subject, studentId: session.user.id }),
    [studentClass, subject, session.user.id, storeTick]
  );
  const localStars = useMemo(
    () => listStars({ className: studentClass, subject, studentId: session.user.id }),
    [studentClass, subject, session.user.id, storeTick]
  );
  const localNotes = useMemo(
    () => listNotes({ className: studentClass, subject, studentId: session.user.id }),
    [studentClass, subject, session.user.id, storeTick]
  );

  const starsTotal = localStars.reduce((acc, item) => acc + Number(item.value || 0), 0);
  const subjectMarks = profile?.examMarks || [];
  const teacherNotes = (profile?.feedbackReceived || []).filter((item) => item.subject === subject);
  const completedHomeworkCount = localHomework.filter((item) =>
    (item.completedBy || []).some((entry) => entry.studentId === session.user.id && entry.done)
  ).length;
  const homeworkCompletionRate = localHomework.length
    ? (completedHomeworkCount / localHomework.length) * 100
    : 0;

  const examTrend = useMemo(
    () =>
      localExams
        .slice(0, 10)
        .reverse()
        .map((item) => ({
          label: formatDate(item.createdAt),
          value: Number(item.fullMark) > 0 ? (Number(item.score || 0) / Number(item.fullMark || 1)) * 100 : 0,
        })),
    [localExams]
  );

  const subjectPerformanceBars = useMemo(
    () => [
      { label: 'نتيجة المادة', value: Number(subjectMarks[0]?.score || 0), max: 100 },
      { label: 'إنجاز الواجبات', value: Number(homeworkCompletionRate || 0), max: 100 },
      { label: 'نجوم ألف', value: Number(starsTotal || 0), max: Math.max(localStars.length * 5, 10) },
    ],
    [homeworkCompletionRate, localStars.length, starsTotal, subjectMarks]
  );

  const sendFeedback = async (event) => {
    event.preventDefault();
    if (!category) {
      setError('يجب اختيار فئة التغذية الراجعة أولاً.');
      return;
    }

    try {
      setSending(true);
      setError('');
      setSuccess('');

      if (sendTarget === 'teacher') {
        if (!teacherId) {
          setError('لا يوجد معلم متاح لهذا الصف.');
          return;
        }
        await submitStudentToTeacherFeedback(session.token, {
          teacherId,
          className: studentClass,
          subject,
          categories: [category],
          content: message.trim(),
        });
      } else {
        await submitStudentToAdminFeedback(session.token, {
          adminId: adminId || undefined,
          className: studentClass,
          subject,
          categories: [category],
          content: message.trim(),
        });
      }

      setMessage('');
      setCategory('');
      setSuccess('تم إرسال التغذية الراجعة بنجاح.');
      await loadFeedbacks(feedbackTypeFilter);
    } catch (sendError) {
      setError(toUserMessage(sendError, 'تعذر إرسال التغذية الراجعة.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="screen stack">
      <AppHeader
        session={session}
        onLogout={onLogout}
        title="منصة الطالب"
        subtitle={studentClass ? `الصف الحالي: ${studentClass}` : 'لا يوجد صف محدد'}
        actions={<ToggleGroup options={SECTION_OPTIONS} value={section} onChange={setSection} />}
      />

      {error ? <p className="error-banner">{error}</p> : null}
      {success ? <p className="success-banner">{success}</p> : null}

      <section className="card hierarchy-strip">
        <strong>المسار الأكاديمي:</strong>
        <span className="chip">المادة: {subject || '-'}</span>
        <span className="hierarchy-arrow">←</span>
        <span className="chip">الصف: {studentClass || 'غير محدد'}</span>
        <span className="hierarchy-arrow">←</span>
        <span className="chip">الطالب: {session.user.name || 'الطالب'}</span>
      </section>

      <section className="card stack">
        <div className="row between wrap-gap">
          <h3 className="section-title">اختيار المادة</h3>
          <span className="hint-text">يمكنك اختيار مادة واحدة في كل مرة</span>
        </div>
        <ToggleGroup
          options={availableSubjects.map((item) => ({ value: item, label: item }))}
          value={subject}
          onChange={setSubject}
          className="horizontal-scroll"
        />
      </section>

      {section === 'subject' ? (
        <section className="stack">
          {loadingProfile ? (
            <section className="card">
              <p className="hint-text">جارٍ تحميل لوحة المادة...</p>
            </section>
          ) : (
            <>
              <section className="subject-grid">
                <article className="metric-card">
                  <h4 className="section-subtitle">الدرجات</h4>
                  <p className="metric-value">{formatNumber(subjectMarks[0]?.score || 0)}</p>
                  <p className="hint-text">أحدث درجة في المادة</p>
                </article>
                <article className="metric-card">
                  <h4 className="section-subtitle">الواجبات</h4>
                  <p className="metric-value">{formatNumber(localHomework.length)}</p>
                  <p className="hint-text">واجبات مسجلة</p>
                </article>
                <article className="metric-card">
                  <h4 className="section-subtitle">الاختبارات</h4>
                  <p className="metric-value">{formatNumber(localExams.length)}</p>
                  <p className="hint-text">اختبارات المادة</p>
                </article>
                <article className="metric-card">
                  <h4 className="section-subtitle">نجوم ألف</h4>
                  <p className="metric-value">{formatNumber(starsTotal)}</p>
                  <p className="hint-text">إجمالي النجوم</p>
                </article>
              </section>

              <section className="charts-grid">
                <LineTrendChart
                  title="الاتجاه الزمني للاختبارات"
                  labels={examTrend.map((item) => item.label)}
                  values={examTrend.map((item) => item.value)}
                />
                <BarProgressChart title="مؤشرات المادة" items={subjectPerformanceBars} />
                <RadialProgressChart
                  title="إنجاز واجبات المادة"
                  value={homeworkCompletionRate}
                  max={100}
                  caption="نسبة الواجبات المنجزة في المادة الحالية"
                />
              </section>

              <section className="card stack">
                <h3 className="section-title">تفاصيل الواجبات</h3>
                {!localHomework.length ? (
                  <p className="hint-text">لا توجد واجبات مسجلة لهذه المادة.</p>
                ) : (
                  localHomework.map((item) => {
                    const done = (item.completedBy || []).some(
                      (entry) => entry.studentId === session.user.id && entry.done
                    );
                    return (
                      <article key={item.id} className="list-card">
                        <div>
                          <strong>{item.title}</strong>
                          <p className="hint-text">التسليم: {formatDate(item.dueDate)}</p>
                        </div>
                        <span className={`chip ${done ? '' : 'chip-soft'}`}>{done ? 'منجز' : 'غير منجز'}</span>
                      </article>
                    );
                  })
                )}
              </section>

              <section className="card stack">
                <h3 className="section-title">الاختبارات</h3>
                {!localExams.length ? (
                  <p className="hint-text">لا توجد اختبارات مسجلة في هذه المادة.</p>
                ) : (
                  localExams.map((item) => (
                    <article key={item.id} className="list-card">
                      <div>
                        <strong>{item.title || 'اختبار'}</strong>
                        <p className="hint-text">{formatDateTime(item.createdAt)}</p>
                      </div>
                      <strong>
                        {formatNumber(item.score)} / {formatNumber(item.fullMark)}
                      </strong>
                    </article>
                  ))
                )}
              </section>

              <section className="card stack">
                <h3 className="section-title">نجوم ألف</h3>
                {!localStars.length ? (
                  <p className="hint-text">لا توجد نجوم مضافة لهذه المادة.</p>
                ) : (
                  localStars.map((item) => (
                    <article key={item.id} className="list-card">
                      <div>
                        <strong>{formatNumber(item.value)} نجمة</strong>
                        <p className="hint-text">{item.note || 'بدون ملاحظة'}</p>
                      </div>
                      <span className="hint-text">{formatDateTime(item.createdAt)}</span>
                    </article>
                  ))
                )}
              </section>

              <section className="card stack">
                <h3 className="section-title">ملاحظات المعلم</h3>
                {!teacherNotes.length && !localNotes.length ? (
                  <p className="hint-text">لا توجد ملاحظات حالياً.</p>
                ) : (
                  <>
                    {localNotes.map((item) => (
                      <article key={item.id} className="list-card">
                        <p className="message-text">{item.text}</p>
                        <span className="hint-text">{formatDateTime(item.createdAt)}</span>
                      </article>
                    ))}
                    {teacherNotes.map((item) => (
                      <article key={item.id} className="list-card">
                        <p className="message-text">{item.content}</p>
                        <span className="hint-text">{formatDateTime(item.createdAt)}</span>
                      </article>
                    ))}
                  </>
                )}
              </section>
            </>
          )}
        </section>
      ) : null}

      {section === 'send' ? (
        <section className="card stack">
          <h3 className="section-title">إرسال تغذية راجعة</h3>
          <ToggleGroup options={SEND_TARGET_OPTIONS} value={sendTarget} onChange={setSendTarget} />

          {sendTarget === 'teacher' ? (
            <div className="card-grid">
              {teacherOptions.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  className={`selection-card ${teacherId === teacher.id ? 'active' : ''}`}
                  onClick={() => setTeacherId(teacher.id)}
                >
                  {teacher.name}
                </button>
              ))}
              {!teacherOptions.length ? <p className="hint-text">لا يوجد معلم متاح.</p> : null}
            </div>
          ) : (
            <div className="card-grid">
              {adminOptions.map((admin) => (
                <button
                  key={admin.id}
                  type="button"
                  className={`selection-card ${adminId === admin.id ? 'active' : ''}`}
                  onClick={() => setAdminId(admin.id)}
                >
                  {admin.name}
                </button>
              ))}
            </div>
          )}

          <form className="stack" onSubmit={sendFeedback}>
            <div className="stack tight">
              <label className="field-label">الفئة</label>
              <ToggleGroup options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
            </div>

            <div className="stack tight">
              <label className="field-label" htmlFor="feedback-message">
                الرسالة (اختيارية)
              </label>
              <textarea
                id="feedback-message"
                className="input textarea"
                placeholder="اكتب رسالتك هنا إذا رغبت..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={sending || !category}>
              {sending ? 'جارٍ الإرسال...' : 'إرسال'}
            </button>
          </form>
        </section>
      ) : null}

      {section === 'history' ? (
        <section className="stack">
          <section className="card stack">
            <h3 className="section-title">تصفية السجل</h3>
            <ToggleGroup
              options={FEEDBACK_TYPE_OPTIONS}
              value={feedbackTypeFilter}
              onChange={(value) => {
                setFeedbackTypeFilter(value);
                loadFeedbacks(value);
              }}
            />
          </section>
          {loadingFeedbacks ? (
            <section className="card">
              <p className="hint-text">جارٍ تحميل السجل...</p>
            </section>
          ) : (
            <FeedbackList feedbacks={feedbacks} role="student" />
          )}
        </section>
      ) : null}
    </main>
  );
}

