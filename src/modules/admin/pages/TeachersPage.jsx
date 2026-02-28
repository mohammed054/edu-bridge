import { useEffect, useMemo, useState } from 'react';
import {
  addTeacher,
  deleteAdminUser,
  fetchAdminOverview,
  resetAdminUserPassword,
  updateAdminUser,
  updateAdminUserStatus,
  updateTeacherAssignment,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  subject: '',
  classes: [],
};

export default function TeachersPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchAdminOverview(token);
      setTeachers(payload.teachers || []);
      setClasses(payload.classes || []);
      setSubjects(payload.availableSubjects || []);
      setForm((current) => ({
        ...current,
        subject: current.subject || payload.availableSubjects?.[0] || '',
      }));
    } catch (loadError) {
      setError(loadError.message || 'تعذر تحميل بيانات المعلمين.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleTeachers = useMemo(() => {
    const pattern = query.trim().toLowerCase();
    if (!pattern) {
      return teachers;
    }

    return teachers.filter((teacher) => {
      return (
        String(teacher.name || '').toLowerCase().includes(pattern) ||
        String(teacher.email || '').toLowerCase().includes(pattern) ||
        String(teacher.subject || '').toLowerCase().includes(pattern)
      );
    });
  }, [query, teachers]);

  const updateTeacherInState = (teacherId, patch) => {
    setTeachers((current) =>
      current.map((item) => (item.id === teacherId ? { ...item, ...patch } : item))
    );
  };

  const toggleTeacherClass = (teacherId, className) => {
    setTeachers((current) =>
      current.map((item) => {
        if (item.id !== teacherId) {
          return item;
        }

        const hasClass = (item.classes || []).includes(className);
        const nextClasses = hasClass
          ? (item.classes || []).filter((entry) => entry !== className)
          : [...(item.classes || []), className];

        return { ...item, classes: nextClasses };
      })
    );
  };

  const toggleFormClass = (className) => {
    setForm((current) => {
      const hasClass = current.classes.includes(className);
      return {
        ...current,
        classes: hasClass
          ? current.classes.filter((entry) => entry !== className)
          : [...current.classes, className],
      };
    });
  };

  const handleAddTeacher = async (event) => {
    event.preventDefault();

    if (!form.classes.length) {
      setError('اختر صفاً واحداً على الأقل للمعلم.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await addTeacher(token, {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        subject: form.subject,
        classes: form.classes,
      });

      setForm({
        ...emptyForm,
        subject: subjects[0] || '',
      });

      setSuccess('تمت إضافة المعلم بنجاح.');
      await loadOverview();
    } catch (saveError) {
      setError(saveError.message || 'تعذر إضافة المعلم.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTeacher = async (teacher) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await updateAdminUser(token, teacher.id, {
        fullName: teacher.name,
        email: teacher.email,
      });

      await updateTeacherAssignment(token, teacher.id, {
        subject: teacher.subject,
        classes: teacher.classes || [],
      });

      setSuccess('تم تحديث بيانات المعلم.');
      await loadOverview();
    } catch (saveError) {
      setError(saveError.message || 'تعذر تحديث المعلم.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (teacher) => {
    const newPassword = window.prompt(`إدخال كلمة المرور الجديدة للمعلم ${teacher.name}`, '');
    if (!newPassword) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await resetAdminUserPassword(token, teacher.id, newPassword);
      setSuccess('تمت إعادة تعيين كلمة المرور.');
    } catch (saveError) {
      setError(saveError.message || 'تعذر إعادة تعيين كلمة المرور.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (teacher) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updateAdminUserStatus(token, teacher.id, !teacher.isActive);
      setSuccess(teacher.isActive ? 'تم تعطيل الحساب.' : 'تم تفعيل الحساب.');
      updateTeacherInState(teacher.id, { isActive: !teacher.isActive });
    } catch (saveError) {
      setError(saveError.message || 'تعذر تحديث حالة الحساب.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`تأكيد حذف المعلم ${teacher.name}؟`)) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await deleteAdminUser(token, teacher.id);
      setSuccess('تم حذف المعلم.');
      setTeachers((current) => current.filter((item) => item.id !== teacher.id));
    } catch (saveError) {
      setError(saveError.message || 'تعذر حذف المعلم.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading title="إدارة المعلمين" subtitle="إضافة وتحديث المادة والصفوف وإدارة الحسابات." />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <h2 className="mb-3 text-base font-semibold text-text-primary">إضافة معلم جديد</h2>

        <form className="grid gap-3 lg:grid-cols-5" onSubmit={handleAddTeacher}>
          <input
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="الاسم الكامل"
            required
          />
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="البريد الإلكتروني"
            dir="ltr"
            required
          />
          <input
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="كلمة المرور"
            type="password"
            required
          />
          <select
            value={form.subject}
            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
            required
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <button type="submit" className="action-btn-primary" disabled={saving}>
            إضافة
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {classes.map((classItem) => {
            const active = form.classes.includes(classItem.name);
            return (
              <button
                key={`new-teacher-${classItem.id}`}
                type="button"
                onClick={() => toggleFormClass(classItem.name)}
                className={`action-btn rounded-full px-3 py-1 text-xs ${active ? 'border-transparent bg-primary text-white' : ''}`}
              >
                {classItem.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-text-primary">قائمة المعلمين</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="focus-ring min-w-[240px] rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="ابحث بالاسم أو البريد أو المادة"
          />
        </div>

        {loading ? (
          <div className="grid gap-3">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        ) : (
          <div className="space-y-3">
            {!visibleTeachers.length ? <p className="text-sm text-text-secondary">لا يوجد معلمون مطابقون.</p> : null}

            {visibleTeachers.map((teacher) => (
              <article key={teacher.id} className="rounded-sm border border-border bg-background p-3">
                <div className="grid gap-2 lg:grid-cols-[1.1fr_1.3fr_1fr_auto]">
                  <input
                    value={teacher.name || ''}
                    onChange={(event) => updateTeacherInState(teacher.id, { name: event.target.value })}
                    className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
                    placeholder="الاسم"
                  />
                  <input
                    value={teacher.email || ''}
                    onChange={(event) => updateTeacherInState(teacher.id, { email: event.target.value })}
                    className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
                    dir="ltr"
                    placeholder="البريد"
                  />
                  <select
                    value={teacher.subject || ''}
                    onChange={(event) => updateTeacherInState(teacher.id, { subject: event.target.value })}
                    className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
                  >
                    {subjects.map((subject) => (
                      <option key={`${teacher.id}-${subject}`} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" className="action-btn" onClick={() => handleSaveTeacher(teacher)} disabled={saving}>
                      حفظ
                    </button>
                    <button type="button" className="action-btn" onClick={() => handleResetPassword(teacher)} disabled={saving}>
                      إعادة كلمة المرور
                    </button>
                    <button type="button" className="action-btn" onClick={() => handleToggleStatus(teacher)} disabled={saving}>
                      {teacher.isActive ? 'تعطيل' : 'تفعيل'}
                    </button>
                    <button type="button" className="action-btn" onClick={() => handleDelete(teacher)} disabled={saving}>
                      حذف
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {classes.map((classItem) => {
                    const active = (teacher.classes || []).includes(classItem.name);
                    return (
                      <button
                        key={`${teacher.id}-${classItem.id}`}
                        type="button"
                        onClick={() => toggleTeacherClass(teacher.id, classItem.name)}
                        className={`action-btn rounded-full px-3 py-1 text-xs ${active ? 'border-transparent bg-primary text-white' : ''}`}
                      >
                        {classItem.name}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
