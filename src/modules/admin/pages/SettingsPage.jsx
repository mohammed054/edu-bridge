import { useEffect, useState } from 'react';
import PageHeading from '../components/PageHeading';

const STORAGE_KEY = 'edu_bridge_admin_settings';

const defaultSettings = {
  schoolName: 'مدرسة حكمة',
  schoolEmail: 'info@hikmah.school',
  sessionTimeoutMinutes: 120,
};

const loadSettings = () => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...defaultSettings,
      ...parsed,
    };
  } catch {
    return defaultSettings;
  }
};

const saveSettings = (settings) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleSave = (event) => {
    event.preventDefault();
    if (!settings.schoolName.trim()) {
      setError('اسم المدرسة مطلوب.');
      return;
    }
    if (!settings.schoolEmail.trim()) {
      setError('البريد الرسمي مطلوب.');
      return;
    }

    saveSettings(settings);
    setError('');
    setSuccess('تم حفظ الإعدادات.');
  };

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="الإعدادات"
        subtitle="إعدادات المدرسة الأساسية وسياسات الجلسة."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {success ? <p className="rounded-sm border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel-card">
          <h2 className="mb-3 text-base font-semibold text-text-primary">معلومات المدرسة</h2>
          <form className="space-y-3" onSubmit={handleSave}>
            <label className="space-y-1">
              <span className="caption-premium">اسم المدرسة</span>
              <input
                value={settings.schoolName}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, schoolName: event.target.value }))
                }
                className="focus-ring w-full rounded-sm border border-border px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1">
              <span className="caption-premium">البريد الرسمي</span>
              <input
                value={settings.schoolEmail}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, schoolEmail: event.target.value }))
                }
                className="focus-ring w-full rounded-sm border border-border px-3 py-2 text-sm"
                dir="ltr"
              />
            </label>

            <label className="space-y-1">
              <span className="caption-premium">مهلة انتهاء الجلسة (دقائق)</span>
              <input
                type="number"
                min={15}
                max={720}
                value={settings.sessionTimeoutMinutes}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    sessionTimeoutMinutes: Number(event.target.value || 120),
                  }))
                }
                className="focus-ring w-full rounded-sm border border-border px-3 py-2 text-sm"
              />
            </label>

            <button type="submit" className="action-btn-primary">
              حفظ الإعدادات
            </button>
          </form>
        </article>

        <article className="panel-card">
          <h2 className="mb-3 text-base font-semibold text-text-primary">حالة الأمان</h2>
          <div className="space-y-2">
            <div className="rounded-sm border border-border bg-background p-3">
              <p className="text-sm font-semibold text-text-primary">JWT مفعّل</p>
              <p className="text-xs text-text-secondary">التحقق من التوكن إجباري على جميع المسارات المحمية.</p>
            </div>
            <div className="rounded-sm border border-border bg-background p-3">
              <p className="text-sm font-semibold text-text-primary">التحكم في الأدوار</p>
              <p className="text-xs text-text-secondary">التحقق الخلفي يمنع تغيير الدور عبر الطلبات اليدوية.</p>
            </div>
            <div className="rounded-sm border border-border bg-background p-3">
              <p className="text-sm font-semibold text-text-primary">تعطيل الحسابات</p>
              <p className="text-xs text-text-secondary">الحسابات غير النشطة تُمنع من تسجيل الدخول والوصول للمسارات.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
