import { useMemo, useState } from 'react';

const ROLE_OPTIONS = [
  { key: 'student', label: 'طالب', sample: 'stum00000001@moe.sch.ae' },
  { key: 'teacher', label: 'معلم', sample: 'tum00000001@privatemoe.gov.ae' },
  { key: 'admin', label: 'إدارة', sample: 'admin' },
];

const TEST_HINTS = {
  admin: 'للاختبار: اسم المستخدم admin وكلمة المرور psps26',
  teacher: 'للاختبار: كلمة المرور teacheruser1',
  student: 'للطالب: أي كلمة مرور مقبولة حالياً',
};

const validate = ({ role, identifier, password }) => {
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase();

  if (!normalizedIdentifier) {
    return 'يرجى إدخال المعرّف.';
  }

  if (!password.trim()) {
    return 'يرجى إدخال كلمة المرور.';
  }

  if (role === 'admin' && normalizedIdentifier !== 'admin') {
    return 'معرّف الإدارة هو admin فقط.';
  }

  if (role === 'student' && !normalizedIdentifier.startsWith('stum')) {
    return 'يجب أن يبدأ معرّف الطالب بـ stum.';
  }

  if (role === 'teacher' && !normalizedIdentifier.startsWith('tum')) {
    return 'يجب أن يبدأ معرّف المعلم بـ tum.';
  }

  return '';
};

export default function LoginForm({ onSubmit, loading = false, error = '' }) {
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('stum00000001@moe.sch.ae');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [validationError, setValidationError] = useState('');

  const selected = useMemo(
    () => ROLE_OPTIONS.find((item) => item.key === role) || ROLE_OPTIONS[0],
    [role]
  );

  const switchRole = (nextRole) => {
    setRole(nextRole);
    const target = ROLE_OPTIONS.find((item) => item.key === nextRole);
    setIdentifier(target?.sample || '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError('');

    const formError = validate({ role, identifier, password });
    if (formError) {
      setValidationError(formError);
      return;
    }

    await onSubmit({
      role,
      identifier: String(identifier || '').trim().toLowerCase(),
      password,
      rememberMe,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="نوع تسجيل الدخول">
        {ROLE_OPTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={role === item.key}
            onClick={() => switchRole(item.key)}
            className={`focus-ring rounded-xl border px-4 py-2 text-sm font-bold transition ${
              role === item.key
                ? 'border-school-blue bg-school-blue text-white shadow-soft'
                : 'border-slate-300 bg-white text-slate-700 hover:border-school-blue/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700">
          {role === 'admin' ? 'اسم المستخدم' : 'المعرّف'}
        </label>

        <input
          id="identifier"
          name="identifier"
          aria-label="معرّف الدخول"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value.replace(/\s+/g, ''))}
          className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
          placeholder={selected.sample}
          autoComplete="username"
          required
        />
        <p className="text-xs text-slate-500">{TEST_HINTS[role]}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          aria-label="كلمة المرور"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
          placeholder="أدخل كلمة المرور"
          autoComplete="current-password"
          required
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          className="focus-ring h-4 w-4 rounded border-slate-300 text-school-blue"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
        />
        تذكرني
      </label>

      {validationError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {validationError}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="focus-ring w-full rounded-xl bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
      </button>
    </form>
  );
}
