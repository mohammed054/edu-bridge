import { useEffect, useMemo, useState } from 'react';
import { fetchStudentProfile, fetchTeacherExams, updateTeacherExamMark } from '../api/api.js';
import { toUserMessage } from '../utils/error.js';
import { formatDate, formatDateTime, formatNumber, resolveAvatar } from '../utils/format.js';
import {
  addExamRecord,
  addHomework,
  addNote,
  addStars,
  buildClassAnalytics,
  listExams,
  listHomework,
  listNotes,
  listStars,
  setHomeworkCompletion,
} from '../utils/subjectStore.js';
import AppHeader from './AppHeader.jsx';
import ToggleGroup from './ToggleGroup.jsx';
import LineTrendChart from './charts/LineTrendChart.jsx';
import BarProgressChart from './charts/BarProgressChart.jsx';
import RadialProgressChart from './charts/RadialProgressChart.jsx';

const PANEL_OPTIONS = [
  { value: 'analytics', label: 'تحليلات الصف' },
  { value: 'exams', label: 'إدارة الاختبارات' },
  { value: 'homework', label: 'إدارة الواجبات' },
  { value: 'stars', label: 'نجوم ألف' },
  { value: 'students', label: 'عرض الطلاب' },
];

const clampScore = (value) => Math.max(0, Math.min(100, value));

export default function TeacherDashboard({ session, onLogout }) {
  const [classes, setClasses] = useState([]);
  const [subject, setSubject] = useState(session.user.subjects?.[0] || '');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [panel, setPanel] = useState('analytics');
  const [profile, setProfile] = useState(null);
  const [storeTick, setStoreTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [examTitle, setExamTitle] = useState('');
  const [examScore, setExamScore] = useState('');
  const [examFullMark, setExamFullMark] = useState('20');
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkDueDate, setHomeworkDueDate] = useState('');
  const [starValue, setStarValue] = useState('1');
  const [starNote, setStarNote] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [directMark, setDirectMark] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchTeacherExams(session.token);
      const nextClasses = payload.classes || [];
      const nextSubject = session.user.subjects?.[0] || payload.subjects?.[0] || '';
      setSubject(nextSubject);
      setClasses(nextClasses);

      if (!selectedClassName || !nextClasses.some((item) => item.name === selectedClassName)) {
        setSelectedClassName(nextClasses[0]?.name || '');
      }
    } catch (loadError) {
      setError(toUserMessage(loadError, 'تعذر تحميل بيانات المعلم.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedClass = useMemo(
    () => classes.find((item) => item.name === selectedClassName) || null,
    [classes, selectedClassName]
  );

  const students = selectedClass?.students || [];
  const selectedStudent = useMemo(
    () => students.find((item) => item.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  useEffect(() => {
    if (!students.length) {
      setSelectedStudentId('');
      return;
    }
    if (!students.some((item) => item.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const loadStudentProfile = async (studentId = selectedStudentId) => {
    if (!studentId) {
      setProfile(null);
      return;
    }
    try {
      const payload = await fetchStudentProfile(session.token, studentId, { subject });
      setProfile(payload);
    } catch (profileError) {
      setError(toUserMessage(profileError, 'تعذر تحميل ملف الطالب.'));
    }
  };

  useEffect(() => {
    if (!selectedStudentId) {
      setProfile(null);
      return;
    }
    loadStudentProfile(selectedStudentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId, subject]);

  const classAnalytics = useMemo(() => {
    const allMarks = students.flatMap((item) => item.examMarks || []);
    return buildClassAnalytics({
      className: selectedClassName,
      subject,
      students,
      examMarks: allMarks,
    });
  }, [selectedClassName, subject, students, storeTick]);

  const classExamTimeline = useMemo(() => {
    if (!selectedClassName || !subject) {
      return [];
    }

    const records = listExams({ className: selectedClassName, subject }).slice(0, 12).reverse();
    return records.map((item) => {
      const score = Number(item.score || 0);
      const fullMark = Math.max(Number(item.fullMark || 0), 1);
      const percentage = clampScore((score / fullMark) * 100);
      return {
        label: formatDate(item.createdAt),
        value: percentage,
      };
    });
  }, [selectedClassName, subject, storeTick]);

  const classPerformanceBars = useMemo(
    () => [
      {
        label: 'متوسط الدرجات',
        value: Number(classAnalytics.averageScore || 0),
        max: 100,
      },
      {
        label: 'أعلى درجة',
        value: Number(classAnalytics.highestScore || 0),
        max: 100,
      },
      {
        label: 'أقل درجة',
        value: Number(classAnalytics.lowestScore || 0),
        max: 100,
      },
      {
        label: 'مجموع نجوم ألف',
        value: Number(classAnalytics.starsTotal || 0),
        max: Math.max(Number(classAnalytics.studentsCount || 0) * 10, 10),
      },
    ],
    [classAnalytics]
  );
  const touchStore = () => setStoreTick((value) => value + 1);

  const classHomework = useMemo(
    () => listHomework({ className: selectedClassName, subject }),
    [selectedClassName, subject, saving, success, storeTick]
  );
  const studentHomework = useMemo(
    () =>
      classHomework.map((item) => ({
        ...item,
        done: (item.completedBy || []).some((entry) => entry.studentId === selectedStudentId && entry.done),
      })),
    [classHomework, selectedStudentId]
  );
  const studentExams = useMemo(
    () => listExams({ className: selectedClassName, subject, studentId: selectedStudentId }),
    [selectedClassName, subject, selectedStudentId, saving, success, storeTick]
  );
  const studentStars = useMemo(
    () => listStars({ className: selectedClassName, subject, studentId: selectedStudentId }),
    [selectedClassName, subject, selectedStudentId, saving, success, storeTick]
  );
  const studentNotes = useMemo(
    () => listNotes({ className: selectedClassName, subject, studentId: selectedStudentId }),
    [selectedClassName, subject, selectedStudentId, saving, success, storeTick]
  );

  const handleAddExam = async (event) => {
    event.preventDefault();
    if (!selectedStudent || !subject) {
      return;
    }

    const score = Number(examScore);
    const fullMark = Number(examFullMark);
    if (Number.isNaN(score) || Number.isNaN(fullMark) || fullMark <= 0) {
      setError('يرجى إدخال درجة صحيحة والدرجة الكاملة.');
      return;
    }

    const normalized = clampScore((score / fullMark) * 100);

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      addExamRecord({
        className: selectedClassName,
        subject,
        studentId: selectedStudent.id,
        title: examTitle || 'اختبار',
        score,
        fullMark,
        teacherId: session.user.id,
      });
      touchStore();

      await updateTeacherExamMark(session.token, {
        studentId: selectedStudent.id,
        subject,
        score: normalized,
      });

      setExamTitle('');
      setExamScore('');
      setSuccess('تمت إضافة الاختبار وتحديث الدرجة.');
      await Promise.all([loadData(), loadStudentProfile(selectedStudent.id)]);
    } catch (saveError) {
      setError(toUserMessage(saveError, 'تعذر حفظ الاختبار.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddHomework = (event) => {
    event.preventDefault();
    if (!homeworkTitle.trim()) {
      return;
    }
    addHomework({
      className: selectedClassName,
      subject,
      title: homeworkTitle,
      dueDate: homeworkDueDate,
      teacherId: session.user.id,
    });
    touchStore();
    setHomeworkTitle('');
    setHomeworkDueDate('');
    setSuccess('تمت إضافة الواجب.');
  };

  const handleHomeworkCompletion = (homeworkId, done) => {
    if (!selectedStudentId) {
      return;
    }
    setHomeworkCompletion({
      homeworkId,
      studentId: selectedStudentId,
      done,
    });
    touchStore();
    setSuccess('تم تحديث حالة الواجب.');
  };

  const handleAddStars = (event) => {
    event.preventDefault();
    if (!selectedStudentId) {
      return;
    }
    addStars({
      className: selectedClassName,
      subject,
      studentId: selectedStudentId,
      value: Number(starValue || 0),
      note: starNote,
      teacherId: session.user.id,
    });
    touchStore();
    setStarValue('1');
    setStarNote('');
    setSuccess('تمت إضافة نجوم ألف.');
  };

  const handleAddNote = (event) => {
    event.preventDefault();
    if (!selectedStudentId || !privateNote.trim()) {
      return;
    }
    addNote({
      className: selectedClassName,
      subject,
      studentId: selectedStudentId,
      text: privateNote,
      teacherId: session.user.id,
    });
    touchStore();
    setPrivateNote('');
    setSuccess('تم حفظ الملاحظة الخاصة.');
  };

  const handleDirectMarkUpdate = async (event) => {
    event.preventDefault();
    if (!selectedStudentId || !directMark) {
      return;
    }
    const score = clampScore(Number(directMark));
    if (Number.isNaN(score)) {
      setError('أدخل درجة صالحة.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await updateTeacherExamMark(session.token, { studentId: selectedStudentId, subject, score });
      setDirectMark('');
      setSuccess('تم تعديل درجة الطالب.');
      await Promise.all([loadData(), loadStudentProfile(selectedStudentId)]);
    } catch (saveError) {
      setError(toUserMessage(saveError, 'تعذر تعديل الدرجة.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="screen stack">
      <AppHeader
        session={session}
        onLogout={onLogout}
        title="منصة المعلم"
        subtitle={subject ? `المادة المعتمدة: ${subject}` : 'لا توجد مادة مخصصة'}
      />

      {error ? <p className="error-banner">{error}</p> : null}
      {success ? <p className="success-banner">{success}</p> : null}

      <section className="card hierarchy-strip">
        <strong>المسار الأكاديمي:</strong>
        <span className="chip">المادة: {subject || '-'}</span>
        <span className="hierarchy-arrow">←</span>
        <span className="chip">الصف: {selectedClassName || 'اختر صفاً'}</span>
        <span className="hierarchy-arrow">←</span>
        <span className="chip">الطالب: {selectedStudent?.name || 'اختر طالباً'}</span>
      </section>

      {!subject ? (
        <section className="card">
          <p className="error-text">لا يمكن الدخول دون مادة مخصصة. يرجى التواصل مع الإدارة.</p>
        </section>
      ) : null}

      <section className="card stack">
        <h3 className="section-title">الصفوف التي تدرّسها</h3>
        {loading ? (
          <p className="hint-text">جارٍ تحميل الصفوف...</p>
        ) : (
          <div className="card-grid">
            {classes.map((item) => (
              <button
                key={item.name}
                type="button"
                className={`selection-card ${selectedClassName === item.name ? 'active' : ''}`}
                onClick={() => setSelectedClassName(item.name)}
              >
                {item.name}
              </button>
            ))}
            {!classes.length ? <p className="hint-text">لا توجد صفوف مرتبطة بك حالياً.</p> : null}
          </div>
        )}
      </section>

      {selectedClassName ? (
        <>
          <section className="card stack">
            <h3 className="section-title">طلاب الصف</h3>
            <div className="student-card-grid">
              {students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className={`student-card ${selectedStudentId === student.id ? 'active' : ''}`}
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <img src={resolveAvatar(student)} alt={`الصورة الشخصية لـ ${student.name}`} className="avatar avatar-round" />
                  <div className="stack tight">
                    <strong>{student.name}</strong>
                    <span className="hint-text compact">{subject}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="card stack">
            <ToggleGroup options={PANEL_OPTIONS} value={panel} onChange={setPanel} />
          </section>
        </>
      ) : null}

      {panel === 'analytics' && selectedClassName ? (
        <section className="stack">
          <section className="subject-grid">
            <article className="metric-card">
              <h4 className="section-subtitle">عدد الطلاب</h4>
              <p className="metric-value">{formatNumber(classAnalytics.studentsCount)}</p>
            </article>
            <article className="metric-card">
              <h4 className="section-subtitle">متوسط الدرجات</h4>
              <p className="metric-value">{formatNumber(classAnalytics.averageScore)}</p>
            </article>
            <article className="metric-card">
              <h4 className="section-subtitle">أعلى درجة</h4>
              <p className="metric-value">{formatNumber(classAnalytics.highestScore)}</p>
            </article>
            <article className="metric-card">
              <h4 className="section-subtitle">أقل درجة</h4>
              <p className="metric-value">{formatNumber(classAnalytics.lowestScore)}</p>
            </article>
            <article className="metric-card">
              <h4 className="section-subtitle">نسبة إنجاز الواجبات</h4>
              <p className="metric-value">{formatNumber(classAnalytics.homeworkCompletionRate)}%</p>
            </article>
            <article className="metric-card">
              <h4 className="section-subtitle">مجموع نجوم ألف</h4>
              <p className="metric-value">{formatNumber(classAnalytics.starsTotal)}</p>
            </article>
          </section>

          <section className="charts-grid">
            <LineTrendChart
              title="الاتجاه الزمني لنتائج الاختبارات"
              labels={classExamTimeline.map((item) => item.label)}
              values={classExamTimeline.map((item) => item.value)}
            />
            <BarProgressChart title="مؤشرات الأداء" items={classPerformanceBars} />
            <RadialProgressChart
              title="إنجاز الواجبات"
              value={classAnalytics.homeworkCompletionRate}
              max={100}
              caption="نسبة إنجاز جميع الواجبات في الصف"
            />
          </section>

          <section className="card stack">
            <h4 className="section-subtitle">تنبيهات الصف</h4>
            {!classAnalytics.alerts.length ? (
              <p className="hint-text">لا توجد تنبيهات حالياً.</p>
            ) : (
              classAnalytics.alerts.map((item) => (
                <article key={item} className="list-card">
                  <span className="status-badge status-warning">تنبيه</span>
                  <p className="hint-text">{item}</p>
                </article>
              ))
            )}
          </section>
        </section>
      ) : null}

      {panel === 'exams' && selectedStudent ? (
        <section className="card stack">
          <h3 className="section-title">إضافة اختبار</h3>
          <form className="filters-grid filters-grid-wide" onSubmit={handleAddExam}>
            <input
              className="input"
              value={examTitle}
              onChange={(event) => setExamTitle(event.target.value)}
              placeholder="عنوان الاختبار"
            />
            <input
              className="input"
              type="number"
              min="0"
              value={examScore}
              onChange={(event) => setExamScore(event.target.value)}
              placeholder="درجة الطالب"
              required
            />
            <input
              className="input"
              type="number"
              min="1"
              value={examFullMark}
              onChange={(event) => setExamFullMark(event.target.value)}
              placeholder="الدرجة الكاملة (مثل 20)"
              required
            />
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'جارٍ الحفظ...' : 'حفظ الاختبار'}
            </button>
          </form>

          <section className="stack">
            <h4 className="section-subtitle">اختبارات الطالب</h4>
            {!studentExams.length ? (
              <p className="hint-text">لا توجد اختبارات مسجلة.</p>
            ) : (
              studentExams.map((item) => (
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
        </section>
      ) : null}

      {panel === 'homework' && selectedClassName ? (
        <section className="card stack">
          <h3 className="section-title">إدارة الواجبات</h3>
          <form className="filters-grid filters-grid-wide" onSubmit={handleAddHomework}>
            <input
              className="input"
              value={homeworkTitle}
              onChange={(event) => setHomeworkTitle(event.target.value)}
              placeholder="اسم الواجب"
              required
            />
            <input
              className="input"
              type="date"
              value={homeworkDueDate}
              onChange={(event) => setHomeworkDueDate(event.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              إضافة واجب
            </button>
          </form>

          {!studentHomework.length ? (
            <p className="hint-text">لا توجد واجبات حالياً.</p>
          ) : (
            studentHomework.map((item) => (
              <article key={item.id} className="list-card">
                <div>
                  <strong>{item.title}</strong>
                  <p className="hint-text">التسليم: {formatDate(item.dueDate)}</p>
                </div>
                <div className="row wrap">
                  <button className="btn btn-soft" type="button" onClick={() => handleHomeworkCompletion(item.id, true)}>
                    منجز
                  </button>
                  <button className="btn btn-soft" type="button" onClick={() => handleHomeworkCompletion(item.id, false)}>
                    غير منجز
                  </button>
                  <span className={`chip ${item.done ? '' : 'chip-soft'}`}>{item.done ? 'مكتمل' : 'غير مكتمل'}</span>
                </div>
              </article>
            ))
          )}
        </section>
      ) : null}

      {panel === 'stars' && selectedStudent ? (
        <section className="card stack">
          <h3 className="section-title">إضافة نجوم ألف</h3>
          <form className="filters-grid filters-grid-wide" onSubmit={handleAddStars}>
            <input
              className="input"
              type="number"
              min="1"
              value={starValue}
              onChange={(event) => setStarValue(event.target.value)}
              placeholder="عدد النجوم"
              required
            />
            <input
              className="input"
              value={starNote}
              onChange={(event) => setStarNote(event.target.value)}
              placeholder="ملاحظة"
            />
            <button className="btn btn-primary" type="submit">
              إضافة نجوم
            </button>
          </form>

          {!studentStars.length ? (
            <p className="hint-text">لا توجد نجوم مسجلة لهذا الطالب.</p>
          ) : (
            studentStars.map((item) => (
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
      ) : null}

      {panel === 'students' && selectedStudent ? (
        <section className="card stack">
          <h3 className="section-title">عرض الطالب</h3>
          <article className="list-card">
            <div>
              <strong>{selectedStudent.name}</strong>
              <p className="hint-text">{selectedClassName}</p>
            </div>
            <span className="chip">{subject}</span>
          </article>

          <section className="stack">
            <h4 className="section-subtitle">جميع درجات الطالب في المادة</h4>
            {(profile?.examMarks || []).length ? (
              profile.examMarks.map((mark) => (
                <article key={`${mark.subject}-${mark.updatedAt}`} className="list-card">
                  <strong>{mark.subject}</strong>
                  <span>{formatNumber(mark.score)}</span>
                </article>
              ))
            ) : (
              <p className="hint-text">لا توجد درجات محفوظة.</p>
            )}
          </section>

          <section className="stack">
            <h4 className="section-subtitle">الواجبات المنجزة / غير المنجزة</h4>
            {!studentHomework.length ? (
              <p className="hint-text">لا توجد واجبات مرتبطة.</p>
            ) : (
              studentHomework.map((item) => (
                <article key={item.id} className="list-card">
                  <strong>{item.title}</strong>
                  <span className={`chip ${item.done ? '' : 'chip-soft'}`}>{item.done ? 'منجز' : 'غير منجز'}</span>
                </article>
              ))
            )}
          </section>

          <section className="stack">
            <h4 className="section-subtitle">نجوم ألف</h4>
            <p className="metric-value">{formatNumber(studentStars.reduce((acc, item) => acc + Number(item.value || 0), 0))}</p>
          </section>

          <section className="stack">
            <h4 className="section-subtitle">ملاحظات خاصة</h4>
            <form className="stack" onSubmit={handleAddNote}>
              <textarea
                className="input textarea"
                value={privateNote}
                onChange={(event) => setPrivateNote(event.target.value)}
                placeholder="اكتب ملاحظة خاصة للطالب"
              />
              <button className="btn btn-soft" type="submit">
                حفظ الملاحظة
              </button>
            </form>
            {!studentNotes.length ? (
              <p className="hint-text">لا توجد ملاحظات خاصة.</p>
            ) : (
              studentNotes.map((item) => (
                <article key={item.id} className="list-card">
                  <p className="message-text">{item.text}</p>
                  <span className="hint-text">{formatDateTime(item.createdAt)}</span>
                </article>
              ))
            )}
          </section>

          <section className="stack">
            <h4 className="section-subtitle">إمكانية تعديل الدرجة</h4>
            <form className="row wrap" onSubmit={handleDirectMarkUpdate}>
              <input
                className="input exam-input"
                type="number"
                min="0"
                max="100"
                value={directMark}
                onChange={(event) => setDirectMark(event.target.value)}
                placeholder="درجة من 100"
              />
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'جارٍ التعديل...' : 'تعديل الدرجة'}
              </button>
            </form>
          </section>
        </section>
      ) : null}
    </main>
  );
}

