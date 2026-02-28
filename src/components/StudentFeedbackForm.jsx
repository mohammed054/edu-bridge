import { useEffect, useMemo, useState } from 'react';
import { FEEDBACK_CATEGORIES } from '../constants/feedback.js';

const TABS = [
  { id: 'teacher', label: 'إلى المعلم' },
  { id: 'admin', label: 'إلى الإدارة' },
];

const emptyDetails = {
  academic: [],
  behavior: [],
  misc: [],
};

export default function StudentFeedbackForm({
  classes = [],
  admins = [],
  subjects = [],
  loading,
  onSendToTeacher,
  onSendToAdmin,
}) {
  const [activeTab, setActiveTab] = useState('teacher');
  const [className, setClassName] = useState(classes[0]?.name || '');
  const [teacherId, setTeacherId] = useState('');
  const [adminId, setAdminId] = useState(admins[0]?.id || '');
  const [subject, setSubject] = useState(subjects[0] || '');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState(emptyDetails);

  const selectedClass = useMemo(
    () => classes.find((item) => item.name === className) || classes[0] || null,
    [classes, className]
  );

  const teacherOptions = selectedClass?.teachers || [];

  useEffect(() => {
    if (!classes.length) {
      return;
    }
    if (!className) {
      setClassName(classes[0].name);
    }
  }, [classes, className]);

  useEffect(() => {
    if (!teacherOptions.length) {
      setTeacherId('');
      return;
    }
    if (!teacherOptions.some((teacher) => teacher.id === teacherId)) {
      setTeacherId(teacherOptions[0].id);
    }
  }, [teacherOptions, teacherId]);

  useEffect(() => {
    if (!admins.length) {
      setAdminId('');
      return;
    }
    if (!admins.some((admin) => admin.id === adminId)) {
      setAdminId(admins[0].id);
    }
  }, [admins, adminId]);

  useEffect(() => {
    if (!subject && subjects.length) {
      setSubject(subjects[0]);
    }
  }, [subjects, subject]);

  const toggleCategory = (categoryKey) => {
    setCategories((current) =>
      current.includes(categoryKey)
        ? current.filter((item) => item !== categoryKey)
        : [...current, categoryKey]
    );
  };

  const toggleDetail = (categoryKey, option) => {
    setCategoryDetails((current) => {
      const values = current[categoryKey] || [];
      return {
        ...current,
        [categoryKey]: values.includes(option)
          ? values.filter((item) => item !== option)
          : [...values, option],
      };
    });
  };

  const clearForm = () => {
    setContent('');
    setNotes('');
    setCategories([]);
    setCategoryDetails(emptyDetails);
  };

  const submitTeacher = async (event) => {
    event.preventDefault();
    if (!teacherId || !content.trim() || !subject || !categories.length) {
      return;
    }

    await onSendToTeacher({
      teacherId,
      className: selectedClass?.name || '',
      subject,
      categories,
      categoryDetails,
      notes: notes.trim(),
      content: content.trim(),
    });

    clearForm();
  };

  const submitAdmin = async (event) => {
    event.preventDefault();
    if (!content.trim() || !subject || !categories.length) {
      return;
    }

    await onSendToAdmin({
      adminId: adminId || undefined,
      className: selectedClass?.name || '',
      subject,
      categories,
      categoryDetails,
      notes: notes.trim(),
      content: content.trim(),
    });

    clearForm();
  };

  return (
    <section className="card stack">
      <h3 className="section-title">إرسال تغذية راجعة</h3>

      <div className="tabs-row">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-soft'}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="stack tight">
        <label className="field-label" htmlFor="student-feedback-subject">
          المادة
        </label>
        {subjects.length ? (
          <select
            id="student-feedback-subject"
            className="input"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          >
            <option value="">اختر المادة</option>
            {subjects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="student-feedback-subject"
            className="input"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="اكتب اسم المادة"
          />
        )}
      </div>

      <section className="stack">
        <h4 className="section-subtitle">فئات التغذية الراجعة</h4>
        {FEEDBACK_CATEGORIES.map((category) => (
          <details key={category.key} className="feedback-accordion">
            <summary className="feedback-summary">
              <label className="row">
                <input
                  type="checkbox"
                  checked={categories.includes(category.key)}
                  onChange={() => toggleCategory(category.key)}
                />
                <strong>{category.label}</strong>
              </label>
              <span className="hint-text">{(categoryDetails[category.key] || []).length}</span>
            </summary>

            <div className="feedback-content stack">
              {category.options.map((option) => (
                <label className="tag-item" key={`${category.key}-${option}`}>
                  <input
                    type="checkbox"
                    checked={(categoryDetails[category.key] || []).includes(option)}
                    onChange={() => toggleDetail(category.key, option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </details>
        ))}
      </section>

      {activeTab === 'teacher' ? (
        <form className="stack" onSubmit={submitTeacher}>
          <label className="field-label" htmlFor="student-feedback-class">
            الصف
          </label>
          <select
            id="student-feedback-class"
            className="input"
            value={selectedClass?.name || ''}
            onChange={(event) => {
              const nextClass = event.target.value;
              setClassName(nextClass);
              const nextTeachers = classes.find((item) => item.name === nextClass)?.teachers || [];
              setTeacherId(nextTeachers[0]?.id || '');
            }}
          >
            {classes.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="student-feedback-teacher">
            المعلم
          </label>
          <select
            id="student-feedback-teacher"
            className="input"
            value={teacherId}
            onChange={(event) => setTeacherId(event.target.value)}
          >
            <option value="">اختر المعلم</option>
            {teacherOptions.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="student-feedback-content-teacher">
            الرسالة
          </label>
          <textarea
            id="student-feedback-content-teacher"
            className="input textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="اكتب التغذية الراجعة..."
            required
          />

          <label className="field-label" htmlFor="student-feedback-notes-teacher">
            ملاحظات إضافية
          </label>
          <textarea
            id="student-feedback-notes-teacher"
            className="input textarea small"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="ملاحظات اختيارية..."
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || !teacherId || !subject || !categories.length}
          >
            {loading ? 'جارٍ الإرسال...' : 'إرسال إلى المعلم'}
          </button>
        </form>
      ) : (
        <form className="stack" onSubmit={submitAdmin}>
          <label className="field-label" htmlFor="student-feedback-admin">
            الإدارة
          </label>
          <select
            id="student-feedback-admin"
            className="input"
            value={adminId}
            onChange={(event) => setAdminId(event.target.value)}
          >
            <option value="">الإدارة الافتراضية</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>

          <label className="field-label" htmlFor="student-feedback-content-admin">
            الرسالة
          </label>
          <textarea
            id="student-feedback-content-admin"
            className="input textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="اكتب التغذية الراجعة..."
            required
          />

          <label className="field-label" htmlFor="student-feedback-notes-admin">
            ملاحظات إضافية
          </label>
          <textarea
            id="student-feedback-notes-admin"
            className="input textarea small"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="ملاحظات اختيارية..."
          />

          <button className="btn btn-primary" type="submit" disabled={loading || !subject || !categories.length}>
            {loading ? 'جارٍ الإرسال...' : 'إرسال إلى الإدارة'}
          </button>
        </form>
      )}
    </section>
  );
}
