import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFeedbackList, fetchStudentProfile } from '../api/api.js';
import { SUBJECTS } from '../constants/subjects.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { toUserMessage } from '../utils/error.js';
import { formatNumber } from '../utils/format.js';
import tileImageA from '../assets/teacher.png';
import tileImageB from '../assets/login-floating.png';
import Header from './Header.jsx';
import NotificationsPanel from './NotificationsPanel.jsx';
import SubjectTile from './SubjectTile.jsx';

const buildSubjectCards = ({ profile, notifications }) => {
  const derivedSubjects = new Set(SUBJECTS);

  (profile?.examMarks || []).forEach((item) => item.subject && derivedSubjects.add(item.subject));
  (profile?.homework || []).forEach((item) => item.subject && derivedSubjects.add(item.subject));
  (profile?.feedbackReceived || []).forEach((item) => item.subject && derivedSubjects.add(item.subject));

  const allSubjects = [...derivedSubjects].filter(Boolean);

  return allSubjects.map((subjectName, index) => ({
    id: subjectName,
    name: subjectName,
    imageUrl: index % 2 === 0 ? tileImageA : tileImageB,
    notificationsCount: notifications.filter((item) => item.subject === subjectName).length,
  }));
};

const buildNotifications = (feedbackList = []) =>
  feedbackList.slice(0, 12).map((item) => ({
    id: item.id || item._id,
    subject: item.subject || '',
    title:
      item.senderRole === 'teacher'
        ? 'رسالة جديدة من المعلم'
        : item.senderRole === 'admin'
          ? 'رسالة جديدة من الإدارة'
          : 'إشعار جديد',
    message: item.content || item.message || '',
    createdAt: item.createdAt || item.timestamp,
  }));

export default function Dashboard() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const user = session?.user;

  useEffect(() => {
    if (!session?.token || !user?.id || user.role !== 'student') {
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [profilePayload, feedbackPayload] = await Promise.all([
          fetchStudentProfile(session.token, user.id),
          fetchFeedbackList(session.token, {
            studentId: user.id,
            limit: 40,
          }),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profilePayload);
        setFeedbackItems(feedbackPayload.feedbacks || []);
      } catch (err) {
        if (mounted) {
          setError(toUserMessage(err, 'تعذر تحميل لوحة الطالب.'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [session?.token, user?.id, user?.role]);

  const notifications = useMemo(() => buildNotifications(feedbackItems), [feedbackItems]);

  const subjectCards = useMemo(
    () => buildSubjectCards({ profile, notifications }),
    [profile, notifications]
  );

  if (!user) {
    return null;
  }

  if (user.role !== 'student') {
    return (
      <main className="min-h-screen bg-white p-6" dir="rtl">
        <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h1 className="text-xl font-bold text-slate-900">تم تسجيل الدخول بنجاح</h1>
          <p className="text-sm text-slate-600">واجهة هذه المرحلة مخصصة للطالب. يمكنك تسجيل الخروج أو المتابعة لاحقاً.</p>
          <button
            type="button"
            onClick={logout}
            className="focus-ring rounded-lg bg-school-blue px-4 py-2 text-sm font-bold text-white"
          >
            تسجيل الخروج
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Header
          user={user}
          notificationsCount={notifications.length}
          onLogout={logout}
          onOpenProfile={() => {
            document.getElementById('profile-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          onOpenSettings={() => setInfoMessage('صفحة الإعدادات ستكون متاحة قريباً.')}
        />

        {infoMessage ? (
          <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">{infoMessage}</p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        ) : null}

        <section id="profile-section" className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <p className="text-xs text-slate-500">عدد المواد</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatNumber(subjectCards.length)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <p className="text-xs text-slate-500">عدد التنبيهات</p>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatNumber(notifications.length)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <p className="text-xs text-slate-500">الصف الدراسي</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{user.classes?.[0] || 'غير محدد'}</p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">المواد الدراسية</h3>

            {loading ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                جاري تحميل المواد...
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {subjectCards.map((subject) => (
                  <SubjectTile
                    key={subject.id}
                    subject={subject}
                    onOpen={(next) => navigate(`/subject/${encodeURIComponent(next.id)}`)}
                  />
                ))}
              </div>
            )}
          </div>

          <NotificationsPanel items={notifications} />
        </section>
      </div>
    </main>
  );
}
