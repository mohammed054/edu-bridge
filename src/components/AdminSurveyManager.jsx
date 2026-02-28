import { useMemo, useState } from 'react';

const createQuestion = () => ({
  questionId: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  prompt: '',
  type: 'text',
  optionsText: '',
});

const normalizeQuestions = (questions) =>
  questions
    .map((item) => ({
      questionId: item.questionId,
      prompt: item.prompt.trim(),
      type: item.type === 'multiple' ? 'multiple' : 'text',
      options:
        item.type === 'multiple'
          ? item.optionsText
              .split(',')
              .map((entry) => entry.trim())
              .filter(Boolean)
          : [],
    }))
    .filter((item) => item.prompt);

export default function AdminSurveyManager({
  users = { teachers: [], students: [] },
  surveys = [],
  loading,
  onCreate,
  onToggleActive,
  onDelete,
  onLoadResponses,
  selectedSurveyResponses,
  selectedSurveyId,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [audienceStudent, setAudienceStudent] = useState(true);
  const [audienceTeacher, setAudienceTeacher] = useState(false);
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [questions, setQuestions] = useState([createQuestion()]);

  const audience = useMemo(() => {
    const items = [];
    if (audienceStudent) items.push('student');
    if (audienceTeacher) items.push('teacher');
    return items;
  }, [audienceStudent, audienceTeacher]);

  const assignableUsers = useMemo(() => {
    const items = [];
    if (audienceStudent) {
      items.push(...(users.students || []).map((item) => ({ ...item, role: 'student' })));
    }
    if (audienceTeacher) {
      items.push(...(users.teachers || []).map((item) => ({ ...item, role: 'teacher' })));
    }
    return items;
  }, [audienceStudent, audienceTeacher, users.students, users.teachers]);

  const updateQuestion = (questionId, key, value) => {
    setQuestions((current) =>
      current.map((item) => (item.questionId === questionId ? { ...item, [key]: value } : item))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      audience,
      assignedUserIds,
      questions: normalizeQuestions(questions),
      isActive: true,
    };

    await onCreate(payload);
    setName('');
    setDescription('');
    setAudienceTeacher(false);
    setAudienceStudent(true);
    setAssignedUserIds([]);
    setQuestions([createQuestion()]);
  };

  return (
    <section className="stack">
      <section className="card stack">
        <h3 className="section-title">إنشاء استطلاع</h3>
        <form className="stack" onSubmit={handleSubmit}>
          <div className="filters-grid filters-grid-wide">
            <div className="stack tight">
              <label className="field-label" htmlFor="survey-name">
                الاسم
              </label>
              <input
                id="survey-name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="اسم الاستطلاع"
                required
              />
            </div>
            <div className="stack tight">
              <label className="field-label" htmlFor="survey-description">
                الوصف
              </label>
              <input
                id="survey-description"
                className="input"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="وصف مختصر"
              />
            </div>
          </div>

          <div className="row wrap">
            <label className="row">
              <input
                type="checkbox"
                checked={audienceStudent}
                onChange={(event) => setAudienceStudent(event.target.checked)}
              />
              <span>الطلاب</span>
            </label>
            <label className="row">
              <input
                type="checkbox"
                checked={audienceTeacher}
                onChange={(event) => setAudienceTeacher(event.target.checked)}
              />
              <span>المعلمون</span>
            </label>
          </div>

          <div className="stack tight">
            <label className="field-label" htmlFor="survey-assigned-users">
              تعيين لمستخدمين محددين (اختياري)
            </label>
            <select
              id="survey-assigned-users"
              className="input"
              multiple
              value={assignedUserIds}
              onChange={(event) => {
                const selected = [...event.target.selectedOptions].map((option) => option.value);
                setAssignedUserIds(selected);
              }}
            >
              {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role === 'student' ? 'طالب' : 'معلم'})
                </option>
              ))}
            </select>
            <p className="hint-text">إذا لم تحدد أحدًا، سيتم إرساله لكل الفئة المختارة.</p>
          </div>

          <section className="stack">
            <div className="row between">
              <h4 className="section-subtitle">الأسئلة</h4>
              <button className="btn btn-soft" type="button" onClick={() => setQuestions((current) => [...current, createQuestion()])}>
                إضافة سؤال
              </button>
            </div>
            {questions.map((question, index) => (
              <article className="admin-item stack" key={question.questionId}>
                <div className="row between">
                  <strong>سؤال {index + 1}</strong>
                  {questions.length > 1 ? (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() =>
                        setQuestions((current) => current.filter((item) => item.questionId !== question.questionId))
                      }
                    >
                      حذف
                    </button>
                  ) : null}
                </div>
                <input
                  className="input"
                  placeholder="نص السؤال"
                  value={question.prompt}
                  onChange={(event) => updateQuestion(question.questionId, 'prompt', event.target.value)}
                />
                <select
                  className="input"
                  value={question.type}
                  onChange={(event) => updateQuestion(question.questionId, 'type', event.target.value)}
                >
                  <option value="text">نص</option>
                  <option value="multiple">اختيار متعدد</option>
                </select>
                {question.type === 'multiple' ? (
                  <input
                    className="input"
                    placeholder="خيارات مفصولة بفاصلة، مثال: ممتاز, جيد, يحتاج تحسين"
                    value={question.optionsText}
                    onChange={(event) => updateQuestion(question.questionId, 'optionsText', event.target.value)}
                  />
                ) : null}
              </article>
            ))}
          </section>

          <button className="btn btn-primary" type="submit" disabled={loading || !audience.length}>
            {loading ? 'جارٍ الحفظ...' : 'حفظ الاستطلاع'}
          </button>
        </form>
      </section>

      <section className="card stack">
        <h3 className="section-title">إدارة الاستطلاعات</h3>
        {!surveys.length ? (
          <p className="hint-text">لا توجد استطلاعات مضافة.</p>
        ) : (
          surveys.map((survey) => (
            <article className="admin-item stack" key={survey.id}>
              <div className="row between">
                <div>
                  <strong>{survey.name}</strong>
                  <p className="hint-text">{survey.description || 'بدون وصف'}</p>
                </div>
                <div className="row wrap">
                  <span className="chip">{survey.isActive ? 'نشط' : 'متوقف'}</span>
                  <span className="chip">ردود: {survey.totalResponses || 0}</span>
                </div>
              </div>
              <div className="row wrap">
                <button className="btn btn-soft" type="button" onClick={() => onLoadResponses(survey.id)}>
                  عرض الردود
                </button>
                <button className="btn btn-soft" type="button" onClick={() => onToggleActive(survey)}>
                  {survey.isActive ? 'إيقاف' : 'تفعيل'}
                </button>
                <button className="btn btn-danger" type="button" onClick={() => onDelete(survey.id)}>
                  حذف
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {selectedSurveyResponses && selectedSurveyId ? (
        <section className="card stack">
          <h3 className="section-title">ردود الاستطلاع</h3>
          {!selectedSurveyResponses.responses?.length ? (
            <p className="hint-text">لا توجد ردود بعد.</p>
          ) : (
            selectedSurveyResponses.responses.map((response) => (
              <details className="feedback-accordion" key={response.id}>
                <summary className="feedback-summary">
                  <strong>{response.respondentName}</strong>
                  <span className="hint-text">{response.respondentRole === 'student' ? 'طالب' : 'معلم'}</span>
                </summary>
                <div className="feedback-content stack">
                  {(response.answers || []).map((answer, index) => (
                    <p key={`${response.id}-answer-${index}`} className="meta-line">
                      {answer.questionId}: {answer.textAnswer || (answer.selectedOptions || []).join('، ')}
                    </p>
                  ))}
                </div>
              </details>
            ))
          )}
        </section>
      ) : null}
    </section>
  );
}
