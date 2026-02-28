import { useMemo, useState } from 'react';
import { importUsers } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const emptyPayload = {
  students: [],
  teachers: [],
};

const toText = (value) => JSON.stringify(value, null, 2);

const normalizePayload = (input) => {
  const payload = input && typeof input === 'object' ? input : {};
  return {
    students: Array.isArray(payload.students) ? payload.students : [],
    teachers: Array.isArray(payload.teachers) ? payload.teachers : [],
  };
};

const parseJsonSafe = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return { parsed, error: '' };
  } catch {
    return { parsed: null, error: 'ملف JSON غير صالح.' };
  }
};

const runClientValidation = (payload) => {
  const errors = [];
  const seenEmails = new Set();
  let skipped = 0;

  payload.students.forEach((student, index) => {
    const email = String(student?.email || '').trim().toLowerCase();
    const className = String(student?.className || '').trim();
    const name = String(student?.fullName || '').trim();

    if (!name) {
      skipped += 1;
      errors.push(`طالب رقم ${index + 1}: الاسم الكامل مطلوب.`);
    }
    if (!email) {
      skipped += 1;
      errors.push(`طالب رقم ${index + 1}: البريد الإلكتروني مطلوب.`);
    } else if (seenEmails.has(email)) {
      skipped += 1;
      errors.push(`طالب رقم ${index + 1}: البريد الإلكتروني مكرر داخل الملف.`);
    } else {
      seenEmails.add(email);
    }
    if (!className) {
      skipped += 1;
      errors.push(`طالب رقم ${index + 1}: يجب تحديد صف واحد عبر className.`);
    }
  });

  payload.teachers.forEach((teacher, index) => {
    const email = String(teacher?.email || '').trim().toLowerCase();
    const subject = String(teacher?.subject || '').trim();
    const classes = Array.isArray(teacher?.classes) ? teacher.classes.filter(Boolean) : [];
    const name = String(teacher?.fullName || '').trim();

    if (!name) {
      skipped += 1;
      errors.push(`معلم رقم ${index + 1}: الاسم الكامل مطلوب.`);
    }
    if (!email) {
      skipped += 1;
      errors.push(`معلم رقم ${index + 1}: البريد الإلكتروني مطلوب.`);
    } else if (seenEmails.has(email)) {
      skipped += 1;
      errors.push(`معلم رقم ${index + 1}: البريد الإلكتروني مكرر داخل الملف.`);
    } else {
      seenEmails.add(email);
    }
    if (!subject) {
      skipped += 1;
      errors.push(`معلم رقم ${index + 1}: المادة مطلوبة ويجب أن تكون مادة واحدة.`);
    }
    if (!classes.length) {
      skipped += 1;
      errors.push(`معلم رقم ${index + 1}: يجب تحديد صف واحد على الأقل داخل classes[].`);
    }
  });

  return {
    errors,
    skipped,
    validCount: payload.students.length + payload.teachers.length - skipped,
  };
};

export default function ImportUsersPage() {
  const { token } = useAuth();

  const [payload, setPayload] = useState(emptyPayload);
  const [rawJson, setRawJson] = useState(toText(emptyPayload));
  const [fileName, setFileName] = useState('');
  const [autoCreateClasses, setAutoCreateClasses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dryRunSummary, setDryRunSummary] = useState(null);
  const [finalSummary, setFinalSummary] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const clientValidation = useMemo(() => runClientValidation(payload), [payload]);

  const handleRawInput = (value) => {
    setRawJson(value);
    setSuccess('');
    setFinalSummary(null);

    const { parsed, error: parseError } = parseJsonSafe(value);
    if (parseError) {
      setError(parseError);
      return;
    }

    setError('');
    setPayload(normalizePayload(parsed));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    setFileName(file.name);
    handleRawInput(text);
  };

  const handleDryRun = async () => {
    if (error) {
      return;
    }

    try {
      setLoading(true);
      setSuccess('');
      setFinalSummary(null);
      const result = await importUsers(token, payload, {
        dryRun: true,
        autoCreateClasses,
      });
      setDryRunSummary(result);
      setSuccess('تم التحقق من الملف بنجاح. راجع النتائج ثم أكد الاستيراد.');
    } catch (runError) {
      setError(runError.message || 'تعذر التحقق من الملف.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await importUsers(token, payload, {
        autoCreateClasses,
      });
      setFinalSummary(result);
      setShowConfirm(false);
      setSuccess('تم استيراد المستخدمين بنجاح.');
    } catch (importError) {
      setError(importError.message || 'تعذر استيراد المستخدمين.');
    } finally {
      setLoading(false);
    }
  };

  const canConfirm = !error && (dryRunSummary || clientValidation.errors.length === 0);

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="استيراد المستخدمين"
        subtitle="رفع ملف JSON، معاينة البيانات، التحقق المسبق، ثم تأكيد الاستيراد."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="action-btn cursor-pointer">
            رفع ملف JSON
            <input type="file" accept="application/json,.json" className="hidden" onChange={handleFileUpload} />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={autoCreateClasses}
              onChange={(event) => setAutoCreateClasses(event.target.checked)}
            />
            إنشاء الصفوف غير الموجودة تلقائياً
          </label>

          {fileName ? <span className="caption-premium">الملف: {fileName}</span> : null}
        </div>

        <label className="space-y-2">
          <span className="caption-premium font-semibold text-text-primary">بيانات JSON</span>
          <textarea
            value={rawJson}
            onChange={(event) => handleRawInput(event.target.value)}
            className="focus-ring min-h-[220px] w-full rounded-sm border border-border bg-white px-3 py-2 text-sm"
            dir="ltr"
            spellCheck={false}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="action-btn" onClick={handleDryRun} disabled={loading || Boolean(error)}>
            تحقق قبل الاستيراد
          </button>
          <button
            type="button"
            className="action-btn-primary"
            onClick={() => setShowConfirm(true)}
            disabled={loading || !canConfirm}
          >
            تأكيد الاستيراد
          </button>
        </div>
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-base font-semibold text-text-primary">معاينة البيانات</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-sm border border-border bg-background px-3 py-2">
            <p className="caption-premium">عدد الطلاب</p>
            <p className="text-lg font-semibold text-text-primary">
              {Number(payload.students.length).toLocaleString('en-US')}
            </p>
          </article>
          <article className="rounded-sm border border-border bg-background px-3 py-2">
            <p className="caption-premium">عدد المعلمين</p>
            <p className="text-lg font-semibold text-text-primary">
              {Number(payload.teachers.length).toLocaleString('en-US')}
            </p>
          </article>
          <article className="rounded-sm border border-border bg-background px-3 py-2">
            <p className="caption-premium">صالح مبدئياً</p>
            <p className="text-lg font-semibold text-text-primary">
              {Number(Math.max(0, clientValidation.validCount)).toLocaleString('en-US')}
            </p>
          </article>
        </div>

        {clientValidation.errors.length ? (
          <div className="rounded-sm border border-warning/25 bg-warning/10 p-3">
            <p className="mb-2 text-sm font-semibold text-warning">ملاحظات التحقق المحلي</p>
            <ul className="space-y-1 text-sm text-text-secondary">
              {clientValidation.errors.slice(0, 12).map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            {clientValidation.errors.length > 12 ? (
              <p className="mt-2 text-xs text-text-secondary">
                +{Number(clientValidation.errors.length - 12).toLocaleString('en-US')} ملاحظة إضافية
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {dryRunSummary ? (
        <section className="panel-card space-y-2">
          <h2 className="text-base font-semibold text-text-primary">نتيجة التحقق من الخادم</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <article className="rounded-sm border border-border bg-background px-3 py-2">
              <p className="caption-premium">طلاب جاهزون</p>
              <p className="text-lg font-semibold text-text-primary">
                {Number(dryRunSummary.importedStudents || 0).toLocaleString('en-US')}
              </p>
            </article>
            <article className="rounded-sm border border-border bg-background px-3 py-2">
              <p className="caption-premium">معلمون جاهزون</p>
              <p className="text-lg font-semibold text-text-primary">
                {Number(dryRunSummary.importedTeachers || 0).toLocaleString('en-US')}
              </p>
            </article>
            <article className="rounded-sm border border-border bg-background px-3 py-2">
              <p className="caption-premium">تم تخطيهم</p>
              <p className="text-lg font-semibold text-text-primary">
                {Number(dryRunSummary.skipped || 0).toLocaleString('en-US')}
              </p>
            </article>
            <article className="rounded-sm border border-border bg-background px-3 py-2">
              <p className="caption-premium">أخطاء</p>
              <p className="text-lg font-semibold text-text-primary">
                {Number((dryRunSummary.errors || []).length).toLocaleString('en-US')}
              </p>
            </article>
          </div>

          {(dryRunSummary.errors || []).length ? (
            <div className="rounded-sm border border-warning/25 bg-warning/10 p-3">
              <p className="mb-2 text-sm font-semibold text-warning">أسباب السجلات المتخطاة</p>
              <ul className="space-y-1 text-sm text-text-secondary">
                {(dryRunSummary.errors || []).slice(0, 12).map((item) => (
                  <li key={`${item.role}-${item.index}-${item.email}-${item.code}`}>
                    - [{item.role}] #{item.index} {item.email || ''}: {item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {finalSummary ? (
        <section className="panel-card space-y-2">
          <h2 className="text-base font-semibold text-text-primary">ملخص الاستيراد النهائي</h2>
          <div className="grid gap-3 md:grid-cols-4">
            <article className="rounded-sm border border-border bg-background px-3 py-2">
              <p className="caption-premium">طلاب مستوردون</p>
              <p className="text-lg font-semibold text-text-primary">
                {Number(finalSummary.importedStudents || 0).toLocaleString('en-US')}
              </p>
            </article>
            <article className="rounded-sm border border-border bg-background px-3 py-2">
              <p className="caption-premium">معلمون مستوردون</p>
              <p className="text-lg font-semibold text-text-primary">
                {Number(finalSummary.importedTeachers || 0).toLocaleString('en-US')}
              </p>
            </article>
            <article className="rounded-sm border border-border bg-background px-3 py-2">
              <p className="caption-premium">تم تخطيهم</p>
              <p className="text-lg font-semibold text-text-primary">
                {Number(finalSummary.skipped || 0).toLocaleString('en-US')}
              </p>
            </article>
            <article className="rounded-sm border border-border bg-background px-3 py-2">
              <p className="caption-premium">مكررون</p>
              <p className="text-lg font-semibold text-text-primary">
                {Number(finalSummary.skippedDuplicates || 0).toLocaleString('en-US')}
              </p>
            </article>
          </div>

          {(finalSummary.errors || []).length ? (
            <div className="rounded-sm border border-warning/25 bg-warning/10 p-3">
              <p className="mb-2 text-sm font-semibold text-warning">تفاصيل السجلات المتخطاة</p>
              <ul className="space-y-1 text-sm text-text-secondary">
                {(finalSummary.errors || []).slice(0, 12).map((item) => (
                  <li key={`${item.role}-${item.index}-${item.email}-${item.code}`}>
                    - [{item.role}] #{item.index} {item.email || ''}: {item.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
          <div className="animate-fadeUp w-full max-w-lg rounded-md border border-border bg-surface p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary">تأكيد استيراد المستخدمين</h3>
            <p className="mt-2 text-sm text-text-secondary">
              سيتم إنشاء الحسابات الصالحة فقط، وتخطي السجلات غير المطابقة للقواعد.
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
                الطلاب: {Number(payload.students.length).toLocaleString('en-US')}
              </p>
              <p className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
                المعلمون: {Number(payload.teachers.length).toLocaleString('en-US')}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="action-btn" onClick={() => setShowConfirm(false)}>
                إلغاء
              </button>
              <button
                type="button"
                className="action-btn-primary"
                onClick={handleConfirmImport}
                disabled={loading}
              >
                {loading ? 'جارٍ الاستيراد...' : 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
