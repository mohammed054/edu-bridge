import { useEffect, useMemo, useState } from 'react';
import {
  createAdminSurvey,
  deleteAdminSurvey,
  exportSurveyRawData,
  fetchAdminSurveys,
  fetchSurveyLifecycle,
  updateAdminSurvey,
  updateSurveyLifecycle,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const QUESTION_TYPES = ['multiple_choice', 'rating', 'text'];

const createQuestion = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
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

const downloadCsv = (csvText, filename) => {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

export default function SurveyBuilderPage() {
  const { token } = useAuth();

  const [surveys, setSurveys] = useState([]);
  const [lifecycleRows, setLifecycleRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingSurveyId, setEditingSurveyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLifecycleId, setSelectedLifecycleId] = useState('');
  const [targetGradesInput, setTargetGradesInput] = useState('');
  const [targetClassesInput, setTargetClassesInput] = useState('');
  const [deadlineInput, setDeadlineInput] = useState('');
  const [autoCloseAtDeadline, setAutoCloseAtDeadline] = useState(true);
  const [previewEnabled, setPreviewEnabled] = useState(true);

  const selectedLifecycle = useMemo(
    () => lifecycleRows.find((item) => item.id === selectedLifecycleId) || null,
    [lifecycleRows, selectedLifecycleId]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [surveyPayload, lifecyclePayload] = await Promise.all([
        fetchAdminSurveys(token),
        fetchSurveyLifecycle(token),
      ]);
      setSurveys(surveyPayload.surveys || []);
      setLifecycleRows(lifecyclePayload.rows || []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load survey data.');
      setSurveys([]);
      setLifecycleRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!selectedLifecycle) return;
    setDeadlineInput(selectedLifecycle.deadlineAt ? selectedLifecycle.deadlineAt.slice(0, 16) : '');
    setTargetGradesInput((selectedLifecycle.targetGrades || []).join(', '));
    setTargetClassesInput((selectedLifecycle.targetClasses || []).join(', '));
    setAutoCloseAtDeadline(selectedLifecycle.autoCloseAtDeadline !== false);
    setPreviewEnabled(selectedLifecycle.previewEnabled !== false);
  }, [selectedLifecycle]);

  const setQuestion = (id, patch) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingSurveyId('');
  };

  const handleSaveSurvey = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Survey title is required.');
      return;
    }
    if (!form.questions.length) {
      setError('Add at least one question.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      audience: form.audience,
      questions: form.questions.map((question, index) => ({
        questionId: `q_${index + 1}`,
        type: question.type,
        questionText: question.questionText.trim(),
        required: question.required === true,
        options:
          question.type === 'multiple_choice'
            ? (question.options || []).map((item) => String(item || '').trim()).filter(Boolean)
            : [],
      })),
    };

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (editingSurveyId) {
        await updateAdminSurvey(token, editingSurveyId, payload);
        setSuccess('Survey updated.');
      } else {
        await createAdminSurvey(token, payload);
        setSuccess('Survey created.');
      }
      resetForm();
      await loadData();
    } catch (saveError) {
      setError(saveError.message || 'Failed to save survey.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSurvey = (survey) => {
    setError('');
    setSuccess('');
    setEditingSurveyId(survey.id);
    setForm({
      title: survey.title || survey.name || '',
      description: survey.description || '',
      audience: Array.isArray(survey.audience) && survey.audience.length ? survey.audience : ['student'],
      questions: (survey.questions || []).map((item) => ({
        id: item.questionId || `${Date.now()}-${Math.random()}`,
        type: item.type || 'text',
        questionText: item.questionText || item.prompt || '',
        required: item.required === true,
        options: item.type === 'multiple_choice' ? item.options || ['', ''] : [],
      })),
    });
  };

  const handleDeleteSurvey = async (survey) => {
    if (!window.confirm(`Delete survey "${survey.title || survey.name}"?`)) return;
    try {
      setSaving(true);
      setError('');
      await deleteAdminSurvey(token, survey.id);
      setSuccess('Survey deleted.');
      if (editingSurveyId === survey.id) resetForm();
      await loadData();
    } catch (saveError) {
      setError(saveError.message || 'Failed to delete survey.');
    } finally {
      setSaving(false);
    }
  };

  const patchLifecycle = async (surveyId, body, message) => {
    try {
      setSaving(true);
      setError('');
      await updateSurveyLifecycle(token, surveyId, body);
      setSuccess(message || 'Survey lifecycle updated.');
      await loadData();
    } catch (saveError) {
      setError(saveError.message || 'Failed to update survey lifecycle.');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyLifecycleSettings = async () => {
    if (!selectedLifecycleId) {
      setError('Select a survey lifecycle row first.');
      return;
    }

    await patchLifecycle(
      selectedLifecycleId,
      {
        deadlineAt: deadlineInput ? new Date(deadlineInput).toISOString() : null,
        autoCloseAtDeadline,
        previewEnabled,
        targetGrades: targetGradesInput.split(',').map((item) => item.trim()).filter(Boolean),
        targetClasses: targetClassesInput.split(',').map((item) => item.trim()).filter(Boolean),
      },
      'Lifecycle settings updated.'
    );
  };

  const handleExportRaw = async (surveyId, title) => {
    try {
      setError('');
      const csv = await exportSurveyRawData(token, surveyId);
      const base = String(title || 'survey').replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
      downloadCsv(csv, `${base}-raw-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (saveError) {
      setError(saveError.message || 'Failed to export raw survey data.');
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="Survey Builder and Lifecycle"
        subtitle="Builder + publish lifecycle, targeting, participation metrics, and raw response exports."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card space-y-4">
        <h2 className="text-base font-semibold text-text-primary">{editingSurveyId ? 'Edit Survey' : 'Create Survey'}</h2>
        <form className="space-y-3" onSubmit={handleSaveSurvey}>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Survey title" />
            <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Description" />
          </div>

          <div className="flex flex-wrap gap-2">
            {['student', 'teacher'].map((role) => {
              const active = form.audience.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  className={`action-btn rounded-full px-3 py-1 text-xs ${active ? 'border-transparent bg-primary text-white' : ''}`}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      audience: active
                        ? current.audience.filter((item) => item !== role)
                        : [...current.audience, role],
                    }))
                  }
                >
                  {role}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {form.questions.map((question, index) => (
              <article key={question.id} className="rounded-sm border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-text-primary">Question {index + 1}</p>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        questions: current.questions.length <= 1 ? current.questions : current.questions.filter((item) => item.id !== question.id),
                      }))
                    }
                  >
                    Delete
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
                  <input value={question.questionText} onChange={(event) => setQuestion(question.id, { questionText: event.target.value })} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Question text" />
                  <select value={question.type} onChange={(event) => setQuestion(question.id, { type: event.target.value, options: event.target.value === 'multiple_choice' ? ['', ''] : [] })} className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm">
                    {QUESTION_TYPES.map((type) => <option key={`${question.id}-${type}`} value={type}>{type}</option>)}
                  </select>
                  <label className="inline-flex items-center gap-2 rounded-sm border border-border bg-white px-3 py-2 text-sm">
                    <input type="checkbox" checked={question.required} onChange={(event) => setQuestion(question.id, { required: event.target.checked })} />
                    Required
                  </label>
                </div>

                {question.type === 'multiple_choice' ? (
                  <div className="mt-2 space-y-2">
                    {(question.options || []).map((option, optionIndex) => (
                      <div key={`${question.id}-option-${optionIndex}`} className="flex gap-2">
                        <input value={option} onChange={(event) => setQuestion(question.id, { options: (question.options || []).map((item, index2) => (index2 === optionIndex ? event.target.value : item)) })} className="focus-ring w-full rounded-sm border border-border px-3 py-2 text-sm" placeholder={`Option ${optionIndex + 1}`} />
                        <button type="button" className="action-btn" onClick={() => setQuestion(question.id, { options: (question.options || []).length <= 2 ? question.options : question.options.filter((_, index2) => index2 !== optionIndex) })}>Delete</button>
                      </div>
                    ))}
                    <button type="button" className="action-btn" onClick={() => setQuestion(question.id, { options: [...(question.options || []), ''] })}>
                      Add option
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="action-btn" onClick={() => setForm((current) => ({ ...current, questions: [...current.questions, createQuestion()] }))}>
              Add Question
            </button>
            <button type="submit" className="action-btn-primary" disabled={saving}>
              {editingSurveyId ? 'Update Survey' : 'Create Survey'}
            </button>
            {editingSurveyId ? <button type="button" className="action-btn" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="panel-card">
        <h2 className="mb-3 text-base font-semibold text-text-primary">Surveys</h2>
        {loading ? (
          <div className="grid gap-2"><div className="skeleton h-12" /><div className="skeleton h-12" /></div>
        ) : (
          <div className="space-y-2">
            {surveys.map((survey) => (
              <article key={survey.id} className="rounded-sm border border-border bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{survey.title || survey.name}</p>
                    <p className="text-xs text-text-secondary">Questions: {(survey.questions || []).length} | Responses: {Number(survey.totalResponses || 0)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="action-btn" onClick={() => handleEditSurvey(survey)}>Edit</button>
                    <button type="button" className="action-btn" onClick={() => handleDeleteSurvey(survey)}>Delete</button>
                  </div>
                </div>
              </article>
            ))}
            {!surveys.length ? <p className="text-sm text-text-secondary">No surveys found.</p> : null}
          </div>
        )}
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Survey Lifecycle Console</h2>
        {loading ? (
          <div className="grid gap-2"><div className="skeleton h-12" /><div className="skeleton h-12" /></div>
        ) : (
          <div className="space-y-2">
            {(lifecycleRows || []).map((row) => (
              <article key={row.id} className="rounded-sm border border-border bg-background p-3">
                <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto_auto_auto_auto]">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{row.title}</p>
                    <p className="text-xs text-text-secondary">status: {row.publishStatus} | responses: {Number(row.responses || 0)} | audience: {(row.audience || []).join(', ') || '-'}</p>
                    <p className="text-xs text-text-secondary">deadline: {row.deadlineAt ? new Date(row.deadlineAt).toLocaleString('en-US') : '-'}</p>
                  </div>
                  <button type="button" className="action-btn px-2 py-1 text-[11px]" onClick={() => setSelectedLifecycleId(row.id)}>Configure</button>
                  <button type="button" className="action-btn px-2 py-1 text-[11px]" onClick={() => patchLifecycle(row.id, { action: 'publish' }, 'Survey published.')}>Publish</button>
                  <button type="button" className="action-btn px-2 py-1 text-[11px]" onClick={() => patchLifecycle(row.id, { action: 'unpublish' }, 'Survey unpublished.')}>Unpublish</button>
                  <button type="button" className="action-btn px-2 py-1 text-[11px]" onClick={() => patchLifecycle(row.id, { action: 'close' }, 'Survey closed.')}>Close</button>
                  <button type="button" className="action-btn px-2 py-1 text-[11px]" onClick={() => handleExportRaw(row.id, row.title)}>Export Raw</button>
                </div>
              </article>
            ))}
            {!lifecycleRows.length ? <p className="text-sm text-text-secondary">No lifecycle rows found.</p> : null}
          </div>
        )}

        {selectedLifecycle ? (
          <article className="rounded-sm border border-border bg-background p-3">
            <h3 className="text-sm font-semibold text-text-primary">Lifecycle Settings for {selectedLifecycle.title}</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input type="datetime-local" value={deadlineInput} onChange={(event) => setDeadlineInput(event.target.value)} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" />
              <input value={targetGradesInput} onChange={(event) => setTargetGradesInput(event.target.value)} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Target grades (comma separated)" />
              <input value={targetClassesInput} onChange={(event) => setTargetClassesInput(event.target.value)} className="focus-ring rounded-sm border border-border px-3 py-2 text-sm" placeholder="Target classes (comma separated)" />
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={autoCloseAtDeadline} onChange={(event) => setAutoCloseAtDeadline(event.target.checked)} />
                  Auto close at deadline
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={previewEnabled} onChange={(event) => setPreviewEnabled(event.target.checked)} />
                  Preview enabled
                </label>
              </div>
            </div>
            <button type="button" className="action-btn-primary mt-3" onClick={handleApplyLifecycleSettings} disabled={saving}>
              Save Lifecycle Settings
            </button>
          </article>
        ) : null}
      </section>
    </div>
  );
}
