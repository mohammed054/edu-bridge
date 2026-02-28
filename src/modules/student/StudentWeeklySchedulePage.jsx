import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStudentWeeklySchedule } from '../../api/api';
import { useAuth } from '../../core/auth/useAuth';
import './studentPortal.css';

const DAY_LABELS = { 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة' };

const SUBJECT_ACCENTS = ['#2C7BE5', '#00C853', '#FFB300', '#D32F2F', '#8B5CF6', '#F97316', '#14B8A6', '#EC4899'];

export default function StudentWeeklySchedulePage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [payload, setPayload] = useState({ className: '', entries: [], schoolDays: [1,2,3,4,5] });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetchStudentWeeklySchedule(token);
        if (!active) return;
        setPayload({
          className: res.className || '',
          entries:   res.entries   || [],
          schoolDays: res.schoolDays || [1,2,3,4,5],
        });
      } catch (e) {
        if (active) setError(e?.message || 'تعذّر تحميل الجدول الأسبوعي.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [token]);

  const slots = useMemo(() => {
    const vals = [...new Set((payload.entries || []).map((e) => `${e.startTime}-${e.endTime}`))];
    return vals.sort((a, b) => String(a).localeCompare(String(b)));
  }, [payload.entries]);

  const entryMap = useMemo(() => {
    const map = {};
    (payload.entries || []).forEach((e) => {
      map[`${e.dayOfWeek}-${e.startTime}-${e.endTime}`] = e;
    });
    return map;
  }, [payload.entries]);

  const subjectAccentMap = useMemo(() => {
    const map = {};
    let idx = 0;
    (payload.entries || []).forEach((e) => {
      if (e.subject && !map[e.subject]) {
        map[e.subject] = SUBJECT_ACCENTS[idx % SUBJECT_ACCENTS.length];
        idx++;
      }
    });
    return map;
  }, [payload.entries]);

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-8">

        <header className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="h2-premium">الجدول الأسبوعي</h1>
            <p className="caption-premium mt-1">{payload.className ? `الصف ${payload.className}` : 'البوابة الأكاديمية'}</p>
          </div>
          <button type="button" onClick={() => navigate('/student')} className="action-btn focus-ring pressable">
            ← العودة للبوابة
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-sm border border-danger/30 bg-red-50 px-4 py-3 text-[13px] text-danger">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map((k) => <div key={k} className="skeleton h-16" />)}
          </div>
        ) : !payload.entries.length ? (
          <div className="surface-card p-16 text-center">
            <p className="h3-premium mb-2">لم يتم تحديد الجدول بعد</p>
            <p className="caption-premium">سيظهر الجدول هنا عند إعداده من قِبل المدرسة.</p>
          </div>
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-right">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide w-28">الوقت</th>
                    {payload.schoolDays.map((day) => (
                      <th key={day} className="px-4 py-3 text-[13px] font-semibold text-text-primary">
                        {DAY_LABELS[day] || day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot, rowIdx) => {
                    const [startTime, endTime] = slot.split('-');
                    return (
                      <tr key={slot} className={`border-b border-border last:border-0 ${rowIdx % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                        <td className="px-4 py-3 text-[12px] font-semibold text-text-secondary whitespace-nowrap">
                          {startTime} – {endTime}
                        </td>
                        {payload.schoolDays.map((day) => {
                          const entry = entryMap[`${day}-${startTime}-${endTime}`];
                          const accent = entry ? (subjectAccentMap[entry.subject] || '#2C7BE5') : null;
                          return (
                            <td key={`${day}-${slot}`} className="px-2 py-2">
                              {entry ? (
                                <div
                                  className="rounded-sm border border-border bg-surface p-2.5 premium-transition hover:shadow-sm"
                                  style={{ borderRightWidth: 3, borderRightColor: accent }}
                                >
                                  <p className="text-[13px] font-semibold text-text-primary leading-snug">{entry.subject}</p>
                                  {entry.teacherName && <p className="text-[11px] text-text-secondary mt-0.5">{entry.teacherName}</p>}
                                  {entry.room && <p className="text-[11px] text-text-secondary">{entry.room}</p>}
                                </div>
                              ) : (
                                <div className="rounded-sm bg-slate-50 border border-border h-[58px]" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
