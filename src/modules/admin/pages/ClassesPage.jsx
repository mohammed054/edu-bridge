import { useEffect, useMemo, useState } from 'react';
import {
  addClass,
  fetchAdminOverview,
  removeClass,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const emptyForm = {
  name: '',
  grade: '',
  section: '',
};

export default function ClassesPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const overviewPayload = await fetchAdminOverview(token);
      setClasses(overviewPayload.classes || []);
      setTeachers(overviewPayload.teachers || []);
      setStudents(overviewPayload.students || []);
    } catch (loadError) {
      setError(loadError.message || 'تعذر تحميل بيانات الصفوف.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(() => {
    return classes.map((classItem) => {
      const className = classItem.name;
      const assignedTeachers = teachers.filter((teacher) => (teacher.classes || []).includes(className));
      const studentsCount = students.filter((student) =>
        (student.className || student.classes?.[0] || '') === className
      ).length;

      return {
        ...classItem,
        studentsCount,
        teachers: assignedTeachers,
      };
    });
  }, [classes, teachers, students]);

  const handleAddClass = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('اسم الصف مطلوب.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await addClass(token, {
        name: form.name,
        grade: form.grade,
        section: form.section,
      });
      setForm(emptyForm);
      setSuccess('تمت إضافة الصف بنجاح.');
      await loadData();
    } catch (saveError) {
      setError(saveError.message || 'تعذر إضافة الصف.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async (classItem) => {
    if (!window.confirm(`تأكيد حذف الصف ${classItem.name}؟`)) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await removeClass(token, classItem.id);
      setSuccess('تم حذف الصف بنجاح.');
      await loadData();
    } catch (saveError) {
      setError(saveError.message || 'تعذر حذف الصف.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading title="إدارة الصفوف" subtitle="إنشاء الصفوف ومتابعة التوزيع والأداء العام." />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <h2 className="mb-3 text-base font-semibold text-text-primary">إضافة صف جديد</h2>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={handleAddClass}>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="اسم الصف"
            required
          />
          <input
            value={form.grade}
            onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value }))}
            className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="المرحلة/الصف الدراسي (اختياري)"
          />
          <input
            value={form.section}
            onChange={(event) => setForm((current) => ({ ...current, section: event.target.value }))}
            className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="الشعبة (اختياري)"
          />
          <button type="submit" className="action-btn-primary" disabled={saving}>
            إضافة
          </button>
        </form>
      </section>

      <section className="panel-card">
        <h2 className="mb-3 text-base font-semibold text-text-primary">قائمة الصفوف</h2>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="skeleton h-[186px]" />
            <div className="skeleton h-[186px]" />
            <div className="skeleton h-[186px]" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((classItem) => (
              <article key={classItem.id} className="panel-card-hover">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">{classItem.name}</h3>
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {Number(classItem.studentsCount || 0).toLocaleString('en-US')} طالب
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="caption-premium">
                    المعلمون: {Number((classItem.teachers || []).length).toLocaleString('en-US')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(classItem.teachers || []).slice(0, 4).map((teacher) => (
                      <span
                        key={`${classItem.id}-${teacher.id}`}
                        className="rounded-full border border-border bg-background px-2 py-1 text-xs font-semibold text-text-secondary"
                      >
                        {teacher.name}
                      </span>
                    ))}
                    {classItem.teachers?.length > 4 ? (
                      <span className="rounded-full border border-border bg-background px-2 py-1 text-xs font-semibold text-text-secondary">
                        +{Number(classItem.teachers.length - 4).toLocaleString('en-US')}
                      </span>
                    ) : null}
                  </div>

                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => handleDeleteClass(classItem)}
                    disabled={saving}
                  >
                    حذف الصف
                  </button>
                </div>
              </article>
            ))}

            {!cards.length ? (
              <p className="text-sm text-text-secondary">لا توجد صفوف مضافة حتى الآن.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
