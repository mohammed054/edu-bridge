import { useEffect, useMemo, useState } from 'react';
import {
  createAdminSurvey,
  deleteAdminSurvey,
  fetchAdminSurveys,
  updateAdminSurvey,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'اختيار من متعدد' },
  { value: 'rating', label: 'تقييم رقمي (1-5)' },
  { value: 'text', label: 'نص مفتوح' },
];

const createId = () => `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

const createQuestion = () => ({
  id: createId(),
  type: 'multiple_choice',
  questionText: '',
  required: true,
  options: ['', ''],
});

const emptyForm = {
  title: '',
  description: '',
  audience: ['student'],
  questions: [createQuestion()],
};

const normalizeQuestionOptions = (options = []) =>
  options.map((item) => String(item || '').trim()).filter(Boolean);

const validateForm = (form) => {
  const errors = [];

  if (!String(form.title || '').trim()) {
    errors.push('عنوان الاستبيان مطلوب.');
  }

  if (!Array.isArray(form.audience) || !form.audience.length) {
    errors.push('اختر فئة واحدة على الأقل (طالب أو معلم).');
  }

  if (!Array.isArray(form.questions) || !form.questions.length) {
    errors.push('أضف سؤالاً واحداً على الأقل.');
  }

  form.questions.forEach((question, index) => {
    if (!String(question.questionText || '').trim()) {
      errors.push(`السؤال ${index + 1}: نص السؤال مطلوب.`);
    }

    if (question.type === 'multiple_choice') {
      const options = normalizeQuestionOptions(question.options);
      const uniqueOptions = new Set(options);

      if (options.length < 2) {
        errors.push(`السؤال ${index + 1}: يجب إضافة خيارين على الأقل.`);
      }

      if (uniqueOptions.size !== options.length) {
        errors.push(`السؤال ${index + 1}: يوجد خيارات مكررة.`);
      }
    }
  });

  return errors;
};

const mapSurveyToForm = (survey) => ({
  title: survey.title || survey.name || '',
  description: survey.description || '',
  audience: Array.isArray(survey.audience) && survey.audience.length ? survey.audience : ['student'],
  questions: (survey.questions || []).map((question) => ({
    id: question.questionId || createId(),
    type: question.type || 'text',
    questionText: question.questionText || question.prompt || '',
    required: Boolean(question.required),
    options: question.type === 'multiple_choice' ? question.options || ['', ''] : [],
  })),
});

export default function SurveyBuilderPage() {
  const { token } = useAuth();

  const [surveys, setSurveys] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingSurveyId, setEditingSurveyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validationErrors = useMemo(() => validateForm(form), [form]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchAdminSurveys(token);
      setSurveys(payload.surveys || []);
    } catch (loadError) {
      setError(loadError.message || 'تعذر تحميل الاستبيانات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setQuestion = (questionId, patch) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((item) =>
        item.id === questionId ? { ...item, ...patch } : item
      ),
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, createQuestion()],
    }));
  };

  const removeQuestion = (questionId) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter((item) => item.id !== questionId),
    }));
  };

  const addOption = (questionId) => {
    const question = form.questions.find((item) => item.id === questionId);
    if (!question || question.type !== 'multiple_choice') {
      return;
    }

    setQuestion(questionId, { options: [...question.options, ''] });
  };

  const setOption = (questionId, optionIndex, value) => {
    const question = form.questions.find((item) => item.id === questionId);
    if (!question) {
      return;
    }

    const nextOptions = [...(question.options || [])];
    nextOptions[optionIndex] = value;
    setQuestion(questionId, { options: nextOptions });
  };

  const removeOption = (questionId, optionIndex) => {
    const question = form.questions.find((item) => item.id === questionId);
    if (!question) {
      return;
    }

    const nextOptions = (question.options || []).filter((_, index) => index !== optionIndex);
    setQuestion(questionId, { options: nextOptions });
  };

  const resetBuilder = () => {
    setForm(emptyForm);
    setEditingSurveyId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validationErrors.length) {
      setError(validationErrors[0]);
      return;
    }

    const body = {
      title: form.title,
      description: form.description,
      audience: form.audience,
      questions: form.questions.map((question, index) => ({
        questionId: `q_${index + 1}`,
        type: question.type,
        questionText: String(question.questionText || '').trim(),
        required: Boolean(question.required),
        options:
          question.type === 'multiple_choice'
            ? normalizeQuestionOptions(question.options)
            : [],
      })),
    };

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (editingSurveyId) {
        await updateAdminSurvey(token, editingSurveyId, body);
        setSuccess('تم تحديث الاستبيان بنجاح.');
      } else {
        await createAdminSurvey(token, body);
        setSuccess('تم إنشاء الاستبيان بنجاح.');
      }

      resetBuilder();
      await loadSurveys();
    } catch (saveError) {
      setError(saveError.message || 'تعذر حفظ الاستبيان.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSurvey = (survey) => {
    setError('');
    setSuccess('');
    setEditingSurveyId(survey.id);
    setForm(mapSurveyToForm(survey));
  };

  const handleDeleteSurvey = async (survey) => {
    if (!window.confirm(`تأكيد حذف الاستبيان "${survey.title || survey.name}"؟`)) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await deleteAdminSurvey(token, survey.id);
      setSuccess('تم حذف الاستبيان.');

      if (editingSurveyId === survey.id) {
        resetBuilder();
      }

      await loadSurveys();
    } catch (deleteError) {
      setError(deleteError.message || 'تعذر حذف الاستبيان.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAudience = (role) => {
    setForm((current) => {
      const hasRole = current.audience.includes(role);
      const nextAudience = hasRole
        ? current.audience.filter((item) => item !== role)
        : [...current.audience, role];

      return {
        ...current,
        audience: nextAudience,
      };
    });
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="إدارة الاستبيانات"
        subtitle="بناء أسئلة ديناميكية متعددة الأنواع مع تحقق كامل قبل الحفظ."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <h2 className="mb-3 text-base font-semibold text-text-primary">
          {editingSurveyId ? 'تعديل استبيان' : 'إنشاء استبيان جديد'}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
              placeholder="عنوان الاستبيان"
              required
            />
            <input
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
              placeholder="وصف مختصر (اختياري)"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleAudience('student')}
              className={`action-btn rounded-full px-3 py-1 text-xs ${
                form.audience.includes('student') ? 'border-transparent bg-primary text-white' : ''
              }`}
            >
              الطلاب
            </button>
            <button
              type="button"
              onClick={() => toggleAudience('teacher')}
              className={`action-btn rounded-full px-3 py-1 text-xs ${
                form.audience.includes('teacher') ? 'border-transparent bg-primary text-white' : ''
              }`}
            >
              المعلمون
            </button>
          </div>

          <div className="space-y-3">
            {form.questions.map((question, index) => (
              <article key={question.id} className="animate-fadeUp rounded-sm border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary">السؤال {index + 1}</p>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => removeQuestion(question.id)}
                    disabled={form.questions.length === 1}
                  >
                    حذف السؤال
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-[1fr_190px_auto]">
                  <input
                    value={question.questionText}
                    onChange={(event) =>
                      setQuestion(question.id, { questionText: event.target.value })
                    }
                    className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
                    placeholder="نص السؤال"
                    required
                  />

                  <select
                    value={question.type}
                    onChange={(event) => {
                      const nextType = event.target.value;
                      setQuestion(question.id, {
                        type: nextType,
                        options: nextType === 'multiple_choice' ? ['', ''] : [],
                      });
                    }}
                    className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={`${question.id}-${type.value}`} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  <label className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(event) =>
                        setQuestion(question.id, { required: event.target.checked })
                      }
                    />
                    إلزامي
                  </label>
                </div>

                {question.type === 'multiple_choice' ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-text-secondary">الخيارات</p>
                    {(question.options || []).map((option, optionIndex) => (
                      <div key={`${question.id}-option-${optionIndex}`} className="flex gap-2">
                        <input
                          value={option}
                          onChange={(event) =>
                            setOption(question.id, optionIndex, event.target.value)
                          }
                          className="focus-ring w-full rounded-sm border border-border px-3 py-2 text-sm"
                          placeholder={`الخيار ${optionIndex + 1}`}
                        />
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => removeOption(question.id, optionIndex)}
                          disabled={(question.options || []).length <= 2}
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                    <button type="button" className="action-btn" onClick={() => addOption(question.id)}>
                      إضافة خيار
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="action-btn" onClick={addQuestion}>
              إضافة سؤال
            </button>
            <button type="submit" className="action-btn-primary" disabled={saving}>
              {saving ? 'جارٍ الحفظ...' : editingSurveyId ? 'حفظ التعديلات' : 'إنشاء الاستبيان'}
            </button>
            {editingSurveyId ? (
              <button type="button" className="action-btn" onClick={resetBuilder}>
                إلغاء التعديل
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel-card">
        <h2 className="mb-3 text-base font-semibold text-text-primary">الاستبيانات الحالية</h2>

        {loading ? (
          <div className="grid gap-3">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        ) : (
          <div className="space-y-2">
            {surveys.map((survey) => (
              <article
                key={survey.id}
                className="rounded-sm border border-border bg-background p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{survey.title || survey.name}</p>
                    <p className="text-xs text-text-secondary">
                      أسئلة: {Number((survey.questions || []).length).toLocaleString('en-US')} | ردود:{' '}
                      {Number(survey.totalResponses || 0).toLocaleString('en-US')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" className="action-btn" onClick={() => handleEditSurvey(survey)}>
                      تعديل
                    </button>
                    <button type="button" className="action-btn" onClick={() => handleDeleteSurvey(survey)}>
                      حذف
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {!surveys.length ? <p className="text-sm text-text-secondary">لا توجد استبيانات حتى الآن.</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}
