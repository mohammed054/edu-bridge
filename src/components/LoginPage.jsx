import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginBackground from '../assets/login-background.png';
import loginFloating from '../assets/login-floating.png';
import { useAuth } from '../hooks/useAuth.jsx';
import { toUserMessage } from '../utils/error.js';
import FloatingImage from './FloatingImage.jsx';
import LoginForm from './LoginForm.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const routeByRole = (role) => {
    if (role === 'admin') {
      return '/admin/dashboard';
    }
    if (role === 'teacher') {
      return '/teacher/dashboard';
    }
    return '/student/dashboard';
  };

  const handleLogin = async ({ role, identifier, password }) => {
    try {
      setLoading(true);
      setError('');
      const payload = await login({ role, identifier, password });
      navigate(routeByRole(payload?.user?.role || role), { replace: true });
    } catch (err) {
      setError(toUserMessage(err, 'تعذر تسجيل الدخول.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-center">
        <section className="flex w-full items-center lg:w-[45%]">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-panel sm:p-7">
            <div className="mb-6 space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900">منصة EduBridge AI</h1>
              <p className="text-sm text-slate-600">تسجيل دخول آمن للإدارة والمعلمين والطلاب</p>
            </div>

            <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
          </div>
        </section>

        <section className="w-full lg:w-[55%]">
          <FloatingImage backgroundSrc={loginBackground} floatingSrc={loginFloating} />
        </section>
      </div>
    </main>
  );
}
