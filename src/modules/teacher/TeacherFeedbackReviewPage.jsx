import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchTeacherFeedbackReviewQueue,
  reviewTeacherFeedbackDraft,
} from '../../api/api';
import { useAuth } from '../../core/auth/useAuth';
import { FEEDBACK_LABELS } from '../../constants/feedback';
import './teacherPortal.css';

const URGENCY_OPTIONS = ['', 'high', 'medium', 'low'];
const TONE_OPTIONS = ['constructive', 'supportive', 'formal'];
const TONE_LABELS = {
  constructive: 'بنبرة بناءة',
  supportive: 'بنبرة داعمة',
  formal: 'بنبرة رسمية',
};
const ACTION_LABELS = {
  accept: 'قبول',
  edit: 'تعديل وإرسال',
  reject: 'رفض',
  clarify: 'طلب إيضاح',
};

const asTrimmed = (value) => String(value || '').trim();

const statusBadgeClass = (status) => {
  const key = asTrimmed(status).toLowerCase();
  if (key === 'clarification_requested') {
    return 'bg-[var(--ht-amber-100)] text-[var(--ht-amber-600)]';
  }
  if (key === 'rejected') {
    return 'bg-[var(--ht-danger-100)] text-[var(--ht-danger-600)]';
  }
  if (key === 'reviewed') {
    return 'bg-[var(--ht-success-100)] text-[var(--ht-success-600)]';
  }
  return 'bg-[var(--ht-primary-100)] text-[var(--ht-primary-700)]';
};

const urgencyBadgeClass = (urgency) => {
  const key = asTrimmed(urgency).toLowerCase();
  if (key === 'high') return 'bg-[var(--ht-danger-100)] text-[var(--ht-danger-600)]';
  if (key === 'medium') return 'bg-[var(--ht-amber-100)] text-[var(--ht-amber-600)]';
  return 'bg-[var(--ht-success-100)] text-[var(--ht-success-600)]';
};

const getStatusLabel = (status) => {
  const key = asTrimmed(status).toLowerCase();
  if (key === 'clarification_requested') return 'تم طلب إيضاح';
  if (key === 'rejected') return 'مرفوض';
  if (key === 'reviewed') return 'مُراجَع';
  if (key === 'draft') return 'مسودة';
  return 'مُرسل';
};

const getUrgencyLabel = (urgency) => {
  const key = asTrimmed(urgency).toLowerCase();
  if (key === 'high') return 'عالية';
  if (key === 'medium') return 'متوسطة';
  return 'منخفضة';
};

const formatDetailValue = (value) => {
  if (!Array.isArray(value)) {
    return '-';
  }
  return value.map((item) => (asTrimmed(item).toLowerCase() === 'custom note' ? 'أخرى' : item)).join(', ');
};

export default function TeacherFeedbackReviewPage() {
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [queue, setQueue] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [filters, setFilters] = useState({
    className: '',
    urgency: '',
    category: '',
  });

  const [tone, setTone] = useState('constructive');
  const [composer, setComposer] = useState({
    message: '',
    note: '',
    clarificationRequest: '',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchTeacherFeedbackReviewQueue(token, filters);
      const items = payload?.queue || [];
      setQueue(items);
      if (items.length && !items.some((item) => item.id === selectedId)) {
        setSelectedId(items[0].id);
      }
      if (!items.length) {
        setSelectedId('');
      }
    } catch (loadError) {
      setError(loadError?.message || 'تعذر تحميل قائمة المراجعة.');
    } finally {
      setLoading(false);
    }
  }, [filters, selectedId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const classOptions = useMemo(
    () => [...new Set((queue || []).map((item) => item.className).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [queue]
  );

  const selectedDraft = useMemo(
    () => queue.find((item) => item.id === selectedId) || null,
    [queue, selectedId]
  );

  useEffect(() => {
    if (!selectedDraft) {
      setComposer({ message: '', note: '', clarificationRequest: '' });
      return;
    }
    setComposer({
      message: selectedDraft.message || selectedDraft.content || '',
      note: selectedDraft.reviewNote || '',
      clarificationRequest: selectedDraft.clarificationRequest || '',
    });
  }, [selectedDraft]);

  const runAction = async (action) => {
    if (!selectedDraft?.id) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        action,
        tone,
        message: composer.message,
        note: composer.note,
      };
      if (action === 'clarify') {
        payload.clarificationRequest = composer.clarificationRequest || composer.note;
      }

      await reviewTeacherFeedbackDraft(token, selectedDraft.id, payload);
      setSuccess(`تم تنفيذ إجراء ${ACTION_LABELS[action] || action} بنجاح.`);
      await load();
    } catch (saveError) {
      setError(saveError?.message || 'تعذر تنفيذ إجراء المراجعة.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main dir="rtl" className="ht-theme min-h-screen bg-[var(--ht-bg-base)]">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10">
        <header className="mb-6">
          <h1 className="ht-display text-[30px] font-semibold text-[var(--ht-neutral-900)]">مراجعة ملاحظات المعلم</h1>
          <p className="mt-1 text-[13px] text-[var(--ht-neutral-500)]">
            مراجعة مسودات الطالب المولدة بالذكاء الاصطناعي قبل إرسالها لولي الأمر.
          </p>
        </header>

        {error ? (
          <p className="mb-4 rounded-[6px] border border-[var(--ht-danger-100)] bg-[var(--ht-danger-100)] px-4 py-3 text-[13px] text-[var(--ht-danger-600)]">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mb-4 rounded-[6px] border border-[var(--ht-success-100)] bg-[var(--ht-success-100)] px-4 py-3 text-[13px] text-[var(--ht-success-600)]">
            {success}
          </p>
        ) : null}

        <section className="ht-surface mb-5 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">الصف</span>
              <select
                value={filters.className}
                onChange={(event) => setFilters((state) => ({ ...state, className: event.target.value }))}
                className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] bg-white px-3 text-[13px] text-[var(--ht-neutral-700)]"
              >
                <option value="">كل الصفوف</option>
                {classOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">درجة الأهمية</span>
              <select
                value={filters.urgency}
                onChange={(event) => setFilters((state) => ({ ...state, urgency: event.target.value }))}
                className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] bg-white px-3 text-[13px] text-[var(--ht-neutral-700)]"
              >
                {URGENCY_OPTIONS.map((item) => (
                  <option key={item || 'all'} value={item}>
                    {item ? getUrgencyLabel(item) : 'كل الدرجات'}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">الفئة</span>
              <select
                value={filters.category}
                onChange={(event) => setFilters((state) => ({ ...state, category: event.target.value }))}
                className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] bg-white px-3 text-[13px] text-[var(--ht-neutral-700)]"
              >
                <option value="">كل الفئات</option>
                {Object.entries(FEEDBACK_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-2">
            <h2 className="text-[16px] font-semibold text-[var(--ht-neutral-900)]">قائمة المسودات</h2>
            {loading ? (
              <div className="grid gap-2">
                <div className="skeleton h-20" />
                <div className="skeleton h-20" />
                <div className="skeleton h-20" />
              </div>
            ) : !queue.length ? (
              <div className="ht-surface p-4 text-[13px] text-[var(--ht-neutral-500)]">لا توجد مسودات قيد الانتظار.</div>
            ) : (
              queue.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`ht-interactive w-full rounded-[6px] border p-3 text-right ${item.id === selectedId ? 'border-[var(--ht-primary-600)] bg-[var(--ht-primary-050)]' : 'border-[var(--ht-border-subtle)] bg-[var(--ht-bg-base)] hover:bg-[var(--ht-bg-subtle)]'}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[var(--ht-neutral-900)]">{item.studentName || 'الطالب'}</p>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusBadgeClass(item.workflowStatus)}`}>
                      {getStatusLabel(item.workflowStatus)}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--ht-neutral-600)]">{item.className || '-'} · {item.subject || '-'}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${urgencyBadgeClass(item.urgency)}`}>
                      {getUrgencyLabel(item.urgency)}
                    </span>
                    <span className="text-[11px] text-[var(--ht-neutral-500)]">
                      {FEEDBACK_LABELS[item.category] || item.category || 'عام'}
                    </span>
                  </div>
                </button>
              ))
            )}
          </aside>

          <section className="space-y-4">
            {!selectedDraft ? (
              <article className="ht-surface p-5 text-[13px] text-[var(--ht-neutral-500)]">اختر مسودة من القائمة.</article>
            ) : (
              <>
                <article className="ht-surface p-5">
                  <h3 className="mb-3 text-[17px] font-semibold text-[var(--ht-neutral-900)]">لوحة مراجعة المسودة</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[6px] border border-[var(--ht-border-subtle)] bg-[var(--ht-bg-subtle)] p-3">
                      <p className="text-[12px] text-[var(--ht-neutral-500)]">الطالب</p>
                      <p className="text-[14px] text-[var(--ht-neutral-800)]">{selectedDraft.studentName || '-'}</p>
                    </div>
                    <div className="rounded-[6px] border border-[var(--ht-border-subtle)] bg-[var(--ht-bg-subtle)] p-3">
                      <p className="text-[12px] text-[var(--ht-neutral-500)]">الصف / المادة</p>
                      <p className="text-[14px] text-[var(--ht-neutral-800)]">{selectedDraft.className || '-'} · {selectedDraft.subject || '-'}</p>
                    </div>
                    <div className="rounded-[6px] border border-[var(--ht-border-subtle)] bg-[var(--ht-bg-subtle)] p-3">
                      <p className="text-[12px] text-[var(--ht-neutral-500)]">الفئة</p>
                      <p className="text-[14px] text-[var(--ht-neutral-800)]">{FEEDBACK_LABELS[selectedDraft.category] || selectedDraft.category || '-'}</p>
                    </div>
                    <div className="rounded-[6px] border border-[var(--ht-border-subtle)] bg-[var(--ht-bg-subtle)] p-3">
                      <p className="text-[12px] text-[var(--ht-neutral-500)]">درجة الأهمية</p>
                      <p className="text-[14px] text-[var(--ht-neutral-800)]">{getUrgencyLabel(selectedDraft.urgency)}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-[12px] font-medium text-[var(--ht-neutral-500)]">مدخلات الطالب الأصلية</p>
                    <div className="rounded-[6px] border border-[var(--ht-border-subtle)] p-3 text-[13px] leading-[1.8] text-[var(--ht-neutral-700)]">
                      <p>{selectedDraft.notes || 'لا توجد ملاحظة إضافية.'}</p>
                      {selectedDraft.categoryDetails && Object.keys(selectedDraft.categoryDetails).length ? (
                        <div className="mt-2">
                          {Object.entries(selectedDraft.categoryDetails).map(([key, value]) => (
                            <p key={key} className="text-[12px] text-[var(--ht-neutral-600)]">
                              {FEEDBACK_LABELS[key] || key}: {formatDetailValue(value)}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>

                <article className="ht-surface p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-[17px] font-semibold text-[var(--ht-neutral-900)]">محرر الرسالة</h3>
                    <p className="text-[12px] text-[var(--ht-neutral-500)]">
                      {selectedDraft.aiLabel || 'مسودة مولدة بالذكاء الاصطناعي'} {selectedDraft.aiUpdatedAt ? `· ${new Date(selectedDraft.aiUpdatedAt).toLocaleString('ar-EG')}` : ''}
                    </p>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTone(item)}
                        className={`ht-interactive rounded-[4px] border px-3 py-1.5 text-[12px] ${tone === item ? 'border-[var(--ht-primary-600)] bg-[var(--ht-primary-050)] text-[var(--ht-primary-700)]' : 'border-[var(--ht-border-default)] text-[var(--ht-neutral-600)]'}`}
                      >
                        {TONE_LABELS[item] || item}
                      </button>
                    ))}
                  </div>

                  <label className="mb-3 block">
                    <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">الرسالة (قابلة للتعديل)</span>
                    <textarea
                      value={composer.message}
                      onChange={(event) => setComposer((state) => ({ ...state, message: event.target.value }))}
                      className="min-h-[150px] w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 py-2 text-[13px] text-[var(--ht-neutral-700)]"
                    />
                  </label>

                  <label className="mb-3 block">
                    <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">ملاحظة المراجعة</span>
                    <input
                      value={composer.note}
                      onChange={(event) => setComposer((state) => ({ ...state, note: event.target.value }))}
                      className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px] text-[var(--ht-neutral-700)]"
                      placeholder="ملاحظة اختيارية لسجل الإجراء"
                    />
                  </label>

                  <label className="mb-4 block">
                    <span className="mb-1 block text-[12px] text-[var(--ht-neutral-500)]">طلب إيضاح</span>
                    <input
                      value={composer.clarificationRequest}
                      onChange={(event) => setComposer((state) => ({ ...state, clarificationRequest: event.target.value }))}
                      className="h-10 w-full rounded-[4px] border border-[var(--ht-border-default)] px-3 text-[13px] text-[var(--ht-neutral-700)]"
                      placeholder="مطلوب عند طلب الإيضاح"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => runAction('accept')}
                      className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-success-600)] bg-[var(--ht-success-600)] px-4 text-[13px] text-white disabled:opacity-60"
                    >
                      قبول
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => runAction('edit')}
                      className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-primary-600)] bg-[var(--ht-primary-600)] px-4 text-[13px] text-white disabled:opacity-60"
                    >
                      تعديل وإرسال
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => runAction('reject')}
                      className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-danger-600)] px-4 text-[13px] text-[var(--ht-danger-600)] disabled:opacity-60"
                    >
                      رفض
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => runAction('clarify')}
                      className="ht-interactive inline-flex h-10 items-center justify-center rounded-[4px] border border-[var(--ht-border-default)] px-4 text-[13px] text-[var(--ht-neutral-700)] disabled:opacity-60"
                    >
                      طلب إيضاح
                    </button>
                  </div>
                </article>
              </>
            )}
          </section>
        </section>

        <p className="mt-4 text-[12px] text-[var(--ht-neutral-500)]">
          مسجل الدخول: {user?.name || 'المعلم'}.
        </p>
      </div>
    </main>
  );
}
