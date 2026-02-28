import { useEffect, useMemo, useState } from 'react';
import {
  addStudent,
  deleteAdminUser,
  fetchAdminOverview,
  resetAdminUserPassword,
  updateAdminUser,
  updateAdminUserStatus,
} from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  className: '',
};

export default function StudentsPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await fetchAdminOverview(token);
      setStudents(payload.students || []);
      setClasses(payload.classes || []);

      setForm((current) => ({
        ...current,
        className: current.className || payload.classes?.[0]?.name || '',
      }));
    } catch (loadError) {
      setError(loadError.message || 'تعذر تحميل بيانات الطلاب.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleStudents = useMemo(() => {
    const pattern = query.trim().toLowerCase();
    if (!pattern) {
      return students;
    }

    return students.filter((student) => {
      return (
        String(student.name || '').toLowerCase().includes(pattern) ||
        String(student.email || '').toLowerCase().includes(pattern) ||
        String(student.className || student.classes?.[0] || '').toLowerCase().includes(pattern)
      );
    });
  }, [query, students]);

  const updateStudentInState = (studentId, patch) => {
    setStudents((current) =>
      current.map((item) => (item.id === studentId ? { ...item, ...patch } : item))
    );
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await addStudent(token, {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        className: form.className,
      });

      setForm({
        ...emptyForm,
        className: classes[0]?.name || form.className,
      });

      setSuccess('تمت إضافة الطالب بنجاح.');
      await loadOverview();
    } catch (saveError) {
      setError(saveError.message || 'تعذر إضافة الطالب.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStudent = async (student) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await updateAdminUser(token, student.id, {
        fullName: student.name,
        email: student.email,
        className: student.className || student.classes?.[0] || '',
      });

      setSuccess('تم تحديث بيانات الطالب.');
      await loadOverview();
    } catch (saveError) {
      setError(saveError.message || 'تعذر تحديث الطالب.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (student) => {
    const newPassword = window.prompt(`إدخال كلمة المرور الجديدة للطالب ${student.name}`, '');
    if (!newPassword) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await resetAdminUserPassword(token, student.id, newPassword);
      setSuccess('تمت إعادة تعيين كلمة المرور.');
    } catch (saveError) {
      setError(saveError.message || 'تعذر إعادة تعيين كلمة المرور.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (student) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updateAdminUserStatus(token, student.id, !student.isActive);
      setSuccess(student.isActive ? 'تم تعطيل الحساب.' : 'تم تفعيل الحساب.');
      updateStudentInState(student.id, { isActive: !student.isActive });
    } catch (saveError) {
      setError(saveError.message || 'تعذر تحديث حالة الحساب.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`تأكيد حذف الطالب ${student.name}؟`)) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await deleteAdminUser(token, student.id);
      setSuccess('تم حذف الطالب.');
      setStudents((current) => current.filter((item) => item.id !== student.id));
    } catch (saveError) {
      setError(saveError.message || 'تعذر حذف الطالب.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading title="إدارة الطلاب" subtitle="إضافة وتعديل ونقل وتعطيل وحذف الطلاب بشكل مباشر." />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="panel-card">
        <h2 className="mb-3 text-base font-semibold text-text-primary">إضافة طالب جديد</h2>

        <form className="grid gap-3 md:grid-cols-4" onSubmit={handleAddStudent}>
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
          <div className="flex gap-2">
            <select
              value={form.className}
              onChange={(event) => setForm((current) => ({ ...current, className: event.target.value }))}
              className="focus-ring w-full rounded-sm border border-border bg-white px-3 py-2 text-sm"
              required
            >
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.name}>
                  {classItem.name}
                </option>
              ))}
            </select>
            <button type="submit" className="action-btn-primary min-w-[96px]" disabled={saving}>
              إضافة
            </button>
          </div>
        </form>
      </section>

      <section className="panel-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-text-primary">قائمة الطلاب</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="focus-ring min-w-[240px] rounded-sm border border-border px-3 py-2 text-sm"
            placeholder="ابحث بالاسم أو البريد أو الصف"
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
            {!visibleStudents.length ? <p className="text-sm text-text-secondary">لا يوجد طلاب مطابقون.</p> : null}

            {visibleStudents.map((student) => (
              <article key={student.id} className="rounded-sm border border-border bg-background p-3">
                <div className="grid gap-2 lg:grid-cols-[1.2fr_1.5fr_1fr_auto]">
                  <input
                    value={student.name || ''}
                    onChange={(event) => updateStudentInState(student.id, { name: event.target.value })}
                    className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
                    placeholder="الاسم"
                  />
                  <input
                    value={student.email || ''}
                    onChange={(event) => updateStudentInState(student.id, { email: event.target.value })}
                    className="focus-ring rounded-sm border border-border px-3 py-2 text-sm"
                    dir="ltr"
                    placeholder="البريد"
                  />
                  <select
                    value={student.className || student.classes?.[0] || ''}
                    onChange={(event) =>
                      updateStudentInState(student.id, {
                        className: event.target.value,
                        classes: [event.target.value],
                      })
                    }
                    className="focus-ring rounded-sm border border-border bg-white px-3 py-2 text-sm"
                  >
                    {classes.map((classItem) => (
                      <option key={`${student.id}-${classItem.id}`} value={classItem.name}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" className="action-btn" onClick={() => handleSaveStudent(student)} disabled={saving}>
                      حفظ
                    </button>
                    <button type="button" className="action-btn" onClick={() => handleResetPassword(student)} disabled={saving}>
                      إعادة كلمة المرور
                    </button>
                    <button type="button" className="action-btn" onClick={() => handleToggleStatus(student)} disabled={saving}>
                      {student.isActive ? 'تعطيل' : 'تفعيل'}
                    </button>
                    <button type="button" className="action-btn" onClick={() => handleDelete(student)} disabled={saving}>
                      حذف
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
