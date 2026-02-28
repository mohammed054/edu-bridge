import { useEffect, useMemo, useState } from 'react';
import { fetchAdminOverview } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

export default function SubjectsPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await fetchAdminOverview(token);
        if (!active) {
          return;
        }
        setSubjects(payload.availableSubjects || []);
        setTeachers(payload.teachers || []);
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'تعذر تحميل بيانات المواد.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [token]);

  const rows = useMemo(() => {
    return subjects.map((subjectName) => {
      const subjectTeachers = teachers.filter((teacher) => teacher.subject === subjectName);
      const classesSet = new Set();
      subjectTeachers.forEach((teacher) => {
        (teacher.classes || []).forEach((className) => classesSet.add(className));
      });

      return {
        name: subjectName,
        teachersCount: subjectTeachers.length,
        classesCount: classesSet.size,
      };
    });
  }, [subjects, teachers]);

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="إدارة المواد"
        subtitle="متابعة توزيع المواد على المعلمين والصفوف."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <section className="panel-card">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="skeleton h-[120px]" />
            <div className="skeleton h-[120px]" />
            <div className="skeleton h-[120px]" />
            <div className="skeleton h-[120px]" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {rows.map((subject) => (
              <article key={subject.name} className="panel-card-hover">
                <h2 className="text-lg font-semibold text-text-primary">{subject.name}</h2>
                <div className="mt-2 space-y-1">
                  <p className="caption-premium">
                    الصفوف: {Number(subject.classesCount || 0).toLocaleString('en-US')}
                  </p>
                  <p className="caption-premium">
                    المعلمون: {Number(subject.teachersCount || 0).toLocaleString('en-US')}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
