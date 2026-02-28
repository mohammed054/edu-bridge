import { useEffect, useMemo, useState } from 'react';

const defaultDraft = { subject: '', score: '' };

export default function TeacherExamPanel({
  classes = [],
  subjects = [],
  loading,
  saving,
  onRefresh,
  onSaveMark,
  onDeleteMark,
}) {
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [draft, setDraft] = useState(defaultDraft);

  const selectedClass = useMemo(
    () => classes.find((item) => item.name === selectedClassName) || classes[0] || null,
    [classes, selectedClassName]
  );
  const selectedStudent = useMemo(
    () => selectedClass?.students?.find((student) => student.id === selectedStudentId) || null,
    [selectedClass, selectedStudentId]
  );

  useEffect(() => {
    if (!classes.length) {
      setSelectedClassName('');
      return;
    }
    if (!selectedClassName) {
      setSelectedClassName(classes[0].name);
    }
  }, [classes, selectedClassName]);

  useEffect(() => {
    const students = selectedClass?.students || [];
    if (!students.length) {
      setSelectedStudentId('');
      return;
    }
    if (!students.some((item) => item.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedClass, selectedStudentId]);

  useEffect(() => {
    if (!draft.subject && subjects.length) {
      setDraft((current) => ({ ...current, subject: subjects[0] }));
    }
  }, [subjects, draft.subject]);

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedStudent || !draft.subject.trim()) {
      return;
    }

    const score = Number(draft.score);
    if (Number.isNaN(score)) {
      return;
    }

    await onSaveMark({ studentId: selectedStudent.id, subject: draft.subject.trim(), score });
    setDraft((current) => ({ ...current, score: '' }));
  };

  const handleDelete = async (subject) => {
    if (!selectedStudent || !subject) {
      return;
    }
    await onDeleteMark({ studentId: selectedStudent.id, subject });
  };

  return (
    <section className="card stack">
      <div className="row between">
        <h3 className="section-title">لوحة درجات الامتحانات</h3>
        <button className="btn btn-soft" onClick={onRefresh} disabled={loading || saving} type="button">
          تحديث
        </button>
      </div>

      {loading ? <p className="hint-text">جارٍ تحميل الصفوف والطلاب...</p> : null}
      {!loading && !classes.length ? <p className="hint-text">لا توجد صفوف مخصصة لهذا المعلم.</p> : null}

      {!loading && classes.length ? (
        <>
          <div className="filters-grid">
            <div className="stack tight">
              <label className="field-label" htmlFor="exam-class-select">
                الصف
              </label>
              <select
                id="exam-class-select"
                className="input"
                value={selectedClass?.name || ''}
                onChange={(event) => setSelectedClassName(event.target.value)}
              >
                {classes.map((classItem) => (
                  <option key={classItem.name} value={classItem.name}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="stack tight">
              <label className="field-label" htmlFor="exam-student-select">
                الطالب
              </label>
              <select
                id="exam-student-select"
                className="input"
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
              >
                {(selectedClass?.students || []).map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedStudent ? (
            <section className="stack">
              <article className="admin-item">
                <div>
                  <strong>{selectedStudent.name}</strong>
                  <p className="hint-text">{selectedStudent.classes?.join(', ') || '-'}</p>
                </div>
                <span className="chip">{selectedStudent.examMarks?.length || 0} درجات</span>
              </article>

              <form className="filters-grid filters-grid-wide" onSubmit={submit}>
                <div className="stack tight">
                  <label className="field-label" htmlFor="exam-subject">
                    المادة
                  </label>
                  {subjects.length ? (
                    <select
                      id="exam-subject"
                      className="input"
                      value={draft.subject}
                      onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
                    >
                      <option value="">اختر المادة</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="exam-subject"
                      className="input"
                      value={draft.subject}
                      onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
                      placeholder="اسم المادة"
                    />
                  )}
                </div>

                <div className="stack tight">
                  <label className="field-label" htmlFor="exam-score">
                    الدرجة
                  </label>
                  <input
                    id="exam-score"
                    className="input"
                    placeholder="0 - 100"
                    type="number"
                    min="0"
                    max="100"
                    value={draft.score}
                    onChange={(event) => setDraft((current) => ({ ...current, score: event.target.value }))}
                  />
                </div>

                <div className="stack tight">
                  <label className="field-label">&nbsp;</label>
                  <button className="btn btn-primary" disabled={saving} type="submit">
                    {saving ? 'جارٍ الحفظ...' : 'حفظ الدرجة'}
                  </button>
                </div>
              </form>

              <section className="stack">
                <h4 className="section-subtitle">الدرجات الحالية</h4>
                {!selectedStudent.examMarks?.length ? (
                  <p className="hint-text">لا توجد درجات مضافة بعد.</p>
                ) : (
                  selectedStudent.examMarks.map((mark) => (
                    <article className="admin-item" key={`${selectedStudent.id}-${mark.subject}`}>
                      <div className="row wrap">
                        <strong>{mark.subject}</strong>
                        <span className="chip">{mark.score}</span>
                      </div>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => handleDelete(mark.subject)}
                        disabled={saving}
                      >
                        حذف
                      </button>
                    </article>
                  ))
                )}
              </section>
            </section>
          ) : (
            <p className="hint-text">لا يوجد طلاب في الصف المحدد.</p>
          )}
        </>
      ) : null}
    </section>
  );
}
