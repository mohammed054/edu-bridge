import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/useAuth';

const roleContent = {
  teacher: {
    title: 'Teacher Workspace',
    text: 'This area is limited to teacher accounts. Admin pages remain protected.',
  },
  student: {
    title: 'Student Workspace',
    text: 'This area is limited to student accounts. Admin pages remain protected.',
  },
};

export default function RoleHomePage({ role }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const content = roleContent[role] || roleContent.student;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <section className="mx-auto mt-12 w-full max-w-2xl space-y-4 rounded-lg border border-border bg-surface p-8 shadow-md">
        <h1 className="h2-premium">{content.title}</h1>
        <p className="body-premium text-text-secondary">{content.text}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="premium-transition pressable inline-flex rounded-sm border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:border-primary hover:text-primary"
        >
          Logout
        </button>
      </section>
    </main>
  );
}
