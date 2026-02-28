import { useEffect, useMemo, useState } from 'react';
import {
  addClass,
  addStudent,
  addTeacher,
  createAdminSurvey,
  deleteAdminSurvey,
  fetchAdminSurveyResponses,
  fetchAdminSurveys,
  fetchAdminOverview,
  fetchAdminReports,
  removeClass,
  removeStudent,
  removeTeacher,
  updateAdminSurvey,
  updateStudentAssignment,
  updateTeacherAssignment,
} from '../api/api.js';
import { FEEDBACK_CATEGORY_LABEL_BY_KEY } from '../constants/feedback.js';
import { HIKMAH_SUBJECTS } from '../constants/subjects.js';
import { toUserMessage } from '../utils/error.js';
import { formatNumber, resolveAvatar } from '../utils/format.js';
import AddClassForm from './AddClassForm.jsx';
import AddUserForm from './AddUserForm.jsx';
import AppHeader from './AppHeader.jsx';
import AdminSurveyManager from './AdminSurveyManager.jsx';
import BarProgressChart from './charts/BarProgressChart.jsx';
import RadialProgressChart from './charts/RadialProgressChart.jsx';
import ToggleGroup from './ToggleGroup.jsx';

const TAB_OPTIONS = [
  { value: 'manage', label: 'إدارة المستخدمين' },
  { value: 'analytics', label: 'تحليلات النظام' },
  { value: 'surveys', label: 'إدارة الاستطلاعات' },
  { value: 'settings', label: 'إعدادات النظام' },
];

const createTeacherDrafts = (teachers = []) =>
  teachers.reduce((acc, teacher) => {
    acc[teacher.id] = {
      classes: teacher.classes || [],
      subject: teacher.subject || teacher.subjects?.[0] || '',
    };
    return acc;
  }, {});

const createStudentDrafts = (students = []) =>
  students.reduce((acc, student) => {
    acc[student.id] = {
      className: student.className || student.classes?.[0] || '',
    };
    return acc;
  }, {});

export default function AdminDashboard({ session, onLogout }) {
  const [tab, setTab] = useState('manage');
  const [overview, setOverview] = useState({ classes: [], teachers: [], students: [], availableSubjects: [] });
  const [reports, setReports] = useState(null);
  const [teacherDrafts, setTeacherDrafts] = useState({});
  const [studentDrafts, setStudentDrafts] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settingRequireCategory, setSettingRequireCategory] = useState(true);
  const [settingShowAlerts, setSettingShowAlerts] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState('');
  const [selectedSurveyResponses, setSelectedSurveyResponses] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [overviewPayload, reportsPayload, surveysPayload] = await Promise.all([
        fetchAdminOverview(session.token),
        fetchAdminReports(session.token),
        fetchAdminSurveys(session.token),
      ]);
      setOverview(overviewPayload);
      setReports(reportsPayload);
      setSurveys(surveysPayload.surveys || []);
      setTeacherDrafts(createTeacherDrafts(overviewPayload.teachers || []));
      setStudentDrafts(createStudentDrafts(overviewPayload.students || []));
    } catch (loadError) {
      setError(toUserMessage(loadError, 'تعذر تحميل بيانات الإدارة.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableSubjects = useMemo(
    () => [...new Set([...(overview.availableSubjects || []), ...HIKMAH_SUBJECTS])],
    [overview.availableSubjects]
  );

  const adminTotalsBars = useMemo(
    () => [
      { label: 'عدد الصفوف', value: Number(reports?.totals?.classes || 0), max: 20 },
      { label: 'عدد المعلمين', value: Number(reports?.totals?.teachers || 0), max: 40 },
      { label: 'عدد الطلاب', value: Number(reports?.totals?.students || 0), max: 500 },
      { label: 'إجمالي التغذية الراجعة', value: Number(reports?.totals?.feedbacks || 0), max: 1000 },
    ],
    [reports]
  );

  const feedbackPerStudentRate = useMemo(() => {
    const students = Number(reports?.totals?.students || 0);
    const feedbacks = Number(reports?.totals?.feedbacks || 0);
    if (!students) {
      return 0;
    }
    return Math.min((feedbacks / students) * 100, 100);
  }, [reports]);

  const withSave = async (task, successMessage) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await task();
      setSuccess(successMessage);
      await loadAll();
    } catch (taskError) {
      setError(toUserMessage(taskError, 'تعذر تنفيذ الإجراء.'));
    } finally {
      setSaving(false);
    }
  };

  const handleTeacherDraftClasses = (teacherId, className) => {
    setTeacherDrafts((current) => {
      const classes = current[teacherId]?.classes || [];
      const nextClasses = classes.includes(className)
        ? classes.filter((item) => item !== className)
        : [...classes, className];
      return {
        ...current,
        [teacherId]: {
          ...(current[teacherId] || {}),
          classes: nextClasses,
        },
      };
    });
  };

  const handleTeacherDraftSubject = (teacherId, subject) => {
    setTeacherDrafts((current) => ({
      ...current,
      [teacherId]: {
        ...(current[teacherId] || {}),
        subject,
      },
    }));
  };

  const handleStudentDraftClass = (studentId, className) => {
    setStudentDrafts((current) => ({
      ...current,
      [studentId]: {
        className,
      },
    }));
  };

  const saveTeacherAssignment = async (teacherId) => {
    const draft = teacherDrafts[teacherId] || { classes: [], subject: '' };
    await withSave(
      () =>
        updateTeacherAssignment(session.token, teacherId, {
          classes: draft.classes || [],
          subject: draft.subject || '',
        }),
      'تم تحديث تعيين المعلم.'
    );
  };

  const saveStudentAssignment = async (studentId) => {
    const draft = studentDrafts[studentId] || { className: '' };
    await withSave(
      () =>
        updateStudentAssignment(session.token, studentId, {
          className: draft.className || '',
        }),
      'تم تحديث صف الطالب.'
    );
  };

  const deleteTeacherItem = async (teacherId, name) => {
    if (!window.confirm(`تأكيد حذف المعلم ${name}؟`)) {
      return;
    }
    await withSave(() => removeTeacher(session.token, teacherId), 'تم حذف المعلم.');
  };

  const deleteStudentItem = async (studentId, name) => {
    if (!window.confirm(`تأكيد حذف الطالب ${name}؟`)) {
      return;
    }
    await withSave(() => removeStudent(session.token, studentId), 'تم حذف الطالب.');
  };

  const deleteClassItem = async (classId, className) => {
    if (!window.confirm(`تأكيد حذف الصف ${className}؟`)) {
      return;
    }
    await withSave(() => removeClass(session.token, classId), 'تم حذف الصف.');
  };

  const createSurveyItem = async (payload) => {
    await withSave(() => createAdminSurvey(session.token, payload), 'تم إنشاء الاستطلاع.');
  };

  const toggleSurveyActive = async (survey) => {
    await withSave(
      () => updateAdminSurvey(session.token, survey.id, { isActive: !survey.isActive }),
      survey.isActive ? 'تم إيقاف الاستطلاع.' : 'تم تفعيل الاستطلاع.'
    );
  };

  const deleteSurveyItem = async (surveyId) => {
    if (!window.confirm('تأكيد حذف الاستطلاع؟')) {
      return;
    }
    await withSave(() => deleteAdminSurvey(session.token, surveyId), 'تم حذف الاستطلاع.');
  };

  const loadSurveyResponses = async (surveyId) => {
    try {
      setError('');
      setSelectedSurveyId(surveyId);
      const payload = await fetchAdminSurveyResponses(session.token, surveyId);
      setSelectedSurveyResponses(payload);
    } catch (responseError) {
      setError(toUserMessage(responseError, 'تعذر تحميل ردود الاستطلاع.'));
    }
  };

  return (
    <main className="screen stack">
      <AppHeader
        session={session}
        onLogout={onLogout}
        title="منصة الإدارة"
        subtitle="التحكم الكامل بالمستخدمين والتحليلات والإعدادات"
        actions={<ToggleGroup options={TAB_OPTIONS} value={tab} onChange={setTab} />}
      />

      {error ? <p className="error-banner">{error}</p> : null}
      {success ? <p className="success-banner">{success}</p> : null}

      {loading ? (
        <section className="card">
          <p className="hint-text">جارٍ تحميل بيانات الإدارة...</p>
        </section>
      ) : null}

      {tab === 'manage' ? (
        <section className="stack">
          <section className="admin-grid">
            <AddClassForm onSubmit={(payload) => withSave(() => addClass(session.token, payload), 'تمت إضافة الصف.')} loading={saving} />
            <AddUserForm
              role="teacher"
              classes={overview.classes}
              subjects={availableSubjects}
              onSubmit={(payload) => withSave(() => addTeacher(session.token, payload), 'تمت إضافة المعلم.')}
              loading={saving}
            />
            <AddUserForm
              role="student"
              classes={overview.classes}
              onSubmit={(payload) => withSave(() => addStudent(session.token, payload), 'تمت إضافة الطالب.')}
              loading={saving}
            />
          </section>

          <section className="card stack">
            <h3 className="section-title">الصفوف</h3>
            {!overview.classes.length ? (
              <p className="hint-text">لا توجد صفوف حالياً.</p>
            ) : (
              <div className="card-grid">
                {overview.classes.map((classItem) => (
                  <article key={classItem.id} className="selection-card active static">
                    <strong>{classItem.name}</strong>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteClassItem(classItem.id, classItem.name)}
                      type="button"
                    >
                      حذف
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card stack">
            <h3 className="section-title">المعلمون</h3>
            {!overview.teachers.length ? (
              <p className="hint-text">لا يوجد معلمون حالياً.</p>
            ) : (
              overview.teachers.map((teacher) => (
                <article key={teacher.id} className="admin-item stack">
                  <div className="row between wrap-gap">
                    <div className="row">
                      <img src={resolveAvatar(teacher)} alt={`الصورة الشخصية لـ ${teacher.name}`} className="avatar avatar-round" />
                      <div className="stack tight">
                        <strong>{teacher.name}</strong>
                        <span className="hint-text compact">{teacher.email}</span>
                      </div>
                    </div>
                    <button className="btn btn-danger" type="button" onClick={() => deleteTeacherItem(teacher.id, teacher.name)}>
                      حذف
                    </button>
                  </div>

                  <div className="stack">
                    <p className="field-label">المادة (مادة واحدة)</p>
                    <ToggleGroup
                      options={availableSubjects.map((subject) => ({ value: subject, label: subject }))}
                      value={teacherDrafts[teacher.id]?.subject || ''}
                      onChange={(value) => handleTeacherDraftSubject(teacher.id, value)}
                    />
                  </div>

                  <div className="stack">
                    <p className="field-label">الصفوف التي يدرسها</p>
                    <div className="card-grid">
                      {overview.classes.map((classItem) => {
                        const selected = (teacherDrafts[teacher.id]?.classes || []).includes(classItem.name);
                        return (
                          <button
                            key={`${teacher.id}-${classItem.id}`}
                            type="button"
                            className={`selection-card ${selected ? 'active' : ''}`}
                            onClick={() => handleTeacherDraftClasses(teacher.id, classItem.name)}
                          >
                            {classItem.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button className="btn btn-soft" type="button" disabled={saving} onClick={() => saveTeacherAssignment(teacher.id)}>
                    حفظ تعيين المعلم
                  </button>
                </article>
              ))
            )}
          </section>

          <section className="card stack">
            <h3 className="section-title">الطلاب</h3>
            {!overview.students.length ? (
              <p className="hint-text">لا يوجد طلاب حالياً.</p>
            ) : (
              overview.students.map((student) => (
                <article key={student.id} className="admin-item stack">
                  <div className="row between wrap-gap">
                    <div className="row">
                      <img src={resolveAvatar(student)} alt={`الصورة الشخصية لـ ${student.name}`} className="avatar avatar-round" />
                      <div className="stack tight">
                        <strong>{student.name}</strong>
                        <span className="hint-text compact">{student.email}</span>
                      </div>
                    </div>
                    <button className="btn btn-danger" type="button" onClick={() => deleteStudentItem(student.id, student.name)}>
                      حذف
                    </button>
                  </div>

                  <div className="stack">
                    <p className="field-label">تعيين الصف (صف واحد فقط)</p>
                    <div className="card-grid">
                      {overview.classes.map((classItem) => {
                        const selected = studentDrafts[student.id]?.className === classItem.name;
                        return (
                          <button
                            key={`${student.id}-${classItem.id}`}
                            type="button"
                            className={`selection-card ${selected ? 'active' : ''}`}
                            onClick={() => handleStudentDraftClass(student.id, classItem.name)}
                          >
                            {classItem.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button className="btn btn-soft" type="button" disabled={saving} onClick={() => saveStudentAssignment(student.id)}>
                    حفظ صف الطالب
                  </button>
                </article>
              ))
            )}
          </section>
        </section>
      ) : null}

      {tab === 'analytics' ? (
        <section className="stack">
          <section className="subject-grid">
            <article className="metric-card">
              <h4 className="section-subtitle">إجمالي الصفوف</h4>
              <p className="metric-value">{formatNumber(reports?.totals?.classes || 0)}</p>
            </article>
            <article className="metric-card">
              <h4 className="section-subtitle">إجمالي المعلمين</h4>
              <p className="metric-value">{formatNumber(reports?.totals?.teachers || 0)}</p>
            </article>
            <article className="metric-card">
              <h4 className="section-subtitle">إجمالي الطلاب</h4>
              <p className="metric-value">{formatNumber(reports?.totals?.students || 0)}</p>
            </article>
            <article className="metric-card">
              <h4 className="section-subtitle">إجمالي التغذية الراجعة</h4>
              <p className="metric-value">{formatNumber(reports?.totals?.feedbacks || 0)}</p>
            </article>
          </section>

          <section className="charts-grid">
            <BarProgressChart title="المؤشرات المؤسسية" items={adminTotalsBars} />
            <RadialProgressChart
              title="معدل التفاعل"
              value={feedbackPerStudentRate}
              max={100}
              caption="نسبة التغذية الراجعة مقارنة بعدد الطلاب"
            />
          </section>

          <section className="card stack">
            <h3 className="section-title">تحليل الفئات</h3>
            {!reports?.categoryBreakdown ? (
              <p className="hint-text">لا توجد بيانات.</p>
            ) : (
              Object.entries(reports.categoryBreakdown).map(([key, value]) => (
                <article key={key} className="list-card">
                  <strong>{FEEDBACK_CATEGORY_LABEL_BY_KEY[key] || key}</strong>
                  <span>{formatNumber(value)}</span>
                </article>
              ))
            )}
          </section>

          <section className="card stack">
            <h3 className="section-title">أكثر الصفوف نشاطاً</h3>
            {!reports?.feedbackTotalsByClass?.length ? (
              <p className="hint-text">لا توجد بيانات حالياً.</p>
            ) : (
              reports.feedbackTotalsByClass.map((item) => (
                <article key={item.className} className="list-card">
                  <strong>{item.className}</strong>
                  <span>{formatNumber(item.total)}</span>
                </article>
              ))
            )}
          </section>
        </section>
      ) : null}

      {tab === 'surveys' ? (
        <AdminSurveyManager
          users={{ teachers: overview.teachers || [], students: overview.students || [] }}
          surveys={surveys}
          loading={saving || loading}
          onCreate={createSurveyItem}
          onToggleActive={toggleSurveyActive}
          onDelete={deleteSurveyItem}
          onLoadResponses={loadSurveyResponses}
          selectedSurveyResponses={selectedSurveyResponses}
          selectedSurveyId={selectedSurveyId}
        />
      ) : null}

      {tab === 'settings' ? (
        <section className="card stack">
          <h3 className="section-title">إعدادات النظام</h3>
          <label className="list-card">
            <strong>إلزام اختيار فئة قبل الإرسال</strong>
            <input
              type="checkbox"
              checked={settingRequireCategory}
              onChange={(event) => setSettingRequireCategory(event.target.checked)}
            />
          </label>
          <label className="list-card">
            <strong>عرض تنبيهات التحليلات</strong>
            <input
              type="checkbox"
              checked={settingShowAlerts}
              onChange={(event) => setSettingShowAlerts(event.target.checked)}
            />
          </label>
          <p className="hint-text">
            الإعدادات الحالية تعمل على الواجهة مباشرة، ويمكن ربطها لاحقاً بتخزين دائم على الخادم.
          </p>
        </section>
      ) : null}
    </main>
  );
}

