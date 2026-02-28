import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginBackground from '../../assets/login-background.png';
import loginFloating from '../../assets/login-floating.png';
import FloatingImage from '../../components/FloatingImage';
import { resolveHomePath } from '../../core/auth/routeHelpers';
import { useAuth } from '../../core/auth/useAuth';

const portals = [
  { key: 'student', label: 'Student' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'admin', label: 'Admin' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [portal, setPortal] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled = useMemo(
    () => isLoading || isSubmitting || !identifier.trim() || !password.trim(),
    [isLoading, isSubmitting, identifier, password]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const nextSession = await login({ identifier, password, portal });
      navigate(resolveHomePath(nextSession?.user?.role), { replace: true });
    } catch (submitError) {
      setError(submitError?.message || 'تعذر تسجيل الدخول.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-white [font-family:'IBM_Plex_Arabic',_'Segoe_UI',sans-serif]"
      style={{ fontFamily: "'IBM Plex Arabic', 'Segoe UI', sans-serif" }}
    >
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[520px_1fr]">
        <section className="relative flex items-center justify-center bg-white px-8 py-10 sm:px-12">
          <div className="w-full max-w-[360px]">
            <h1
              className="mb-2 text-[34px] font-semibold leading-[1.3] text-[#111]"
              style={{ fontFamily: "'Noto Naskh Arabic', 'Amiri', serif" }}
            >
              تسجيل الدخول
            </h1>
            <p className="mb-8 text-[13px] text-[#777]">بوابة Hikmah School الرسمية</p>

            <div className="mb-6 grid grid-cols-3 gap-1 rounded-[6px] border border-[#E5E7EB] bg-[#FAFAFA] p-1">
              {portals.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPortal(item.key)}
                  className={`h-9 rounded-[4px] text-[12px] font-medium transition-colors duration-150 ${
                    portal === item.key ? 'bg-white text-[#111] shadow-sm' : 'text-[#666] hover:bg-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[13px] text-[#555]">
                  {portal === 'admin' ? 'اسم المستخدم' : 'البريد الإلكتروني'}
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  autoComplete="username"
                  dir="ltr"
                  className="h-11 w-full rounded-[4px] border border-[#E5E7EB] px-3 text-[14px] text-[#111] outline-none transition-colors duration-150 focus:border-[#1A3A6B]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[13px] text-[#555]">كلمة المرور</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  dir="ltr"
                  className="h-11 w-full rounded-[4px] border border-[#E5E7EB] px-3 text-[14px] text-[#111] outline-none transition-colors duration-150 focus:border-[#1A3A6B]"
                />
              </label>

              {error ? (
                <p className="rounded-[4px] border border-[#F3D4D2] bg-[#FDECEA] px-3 py-2 text-[12px] text-[#8B1A1A]">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={disabled}
                className="h-11 w-full rounded-[4px] border border-[#1A3A6B] bg-[#1A3A6B] text-[14px] font-medium text-white transition duration-150 hover:bg-[#0D2449] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-[#F7F7F5] lg:block">
          <div className="absolute inset-8 overflow-hidden rounded-[6px] border border-[#E5E7EB] bg-white">
            <FloatingImage backgroundSrc={loginBackground} floatingSrc={loginFloating} />
          </div>
        </section>
      </div>
    </main>
  );
}
