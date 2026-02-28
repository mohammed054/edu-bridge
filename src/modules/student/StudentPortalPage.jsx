import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStudentPortal, fetchStudentWeeklySchedule } from '../../api/api';
import { useAuth } from '../../core/auth/useAuth';
import SubjectPage from './components/SubjectPage';
import { resolveSubjectImage } from './utils/subjectVisuals';
import { formatDate, formatNumber } from './utils/format';
import './studentPortal.css';

/* ─── Constants ─── */
const CATEGORY_MAP = { academic: 'أكاديمي', moral: 'سلوك', behavior: 'سلوك', idfk: 'أخرى' };
const mapCat = (v) => CATEGORY_MAP[String(v || '').trim().toLowerCase()] || v || 'أخرى';

const ACCENTS = ['#2C7BE5', '#00C853', '#FFB300', '#D32F2F', '#8B5CF6', '#F97316', '#14B8A6'];
const DIRECTION_AR = { improving: 'في تحسّن', declining: 'يحتاج متابعة', stable: 'مستقر' };
const RISK_AR = { low: { label: 'منخفض', color: '#00C853' }, medium: { label: 'متوسط', color: '#FFB300' }, high: { label: 'مرتفع', color: '#D32F2F' } };
const ENGAGE_AR = { active: 'نشط ومتفاعل', moderate: 'متوسط', low: 'يحتاج اهتماماً' };
const CATCOLOR = { أكاديمي: { bg: '#EFF6FF', c: '#2C7BE5' }, سلوك: { bg: '#FFFBEB', c: '#D97706' }, واجبات: { bg: '#F0FDF4', c: '#00C853' }, أخرى: { bg: '#F8FAFC', c: '#475569' } };
const DAY_LABELS = { 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة' };
const SUBJECT_ACCENTS = ['#2C7BE5', '#00C853', '#FFB300', '#D32F2F', '#8B5CF6', '#F97316', '#14B8A6', '#EC4899'];

const SUBJECT_ORDER = [
  'الرياضيات',
  'الفيزياء',
  'اللغة الانجليزية',
  'اللغة الإنجليزية',
  'اللغة العربية',
  'الكيمياء',
  'الأحياء',
  'التربية الإسلامية',
  'الدراسات الاجتماعية',
];

function sortSubjects(subjects) {
  return [...subjects].sort((a, b) => {
    const ai = SUBJECT_ORDER.findIndex((n) => a.name?.includes(n) || n.includes(a.name || ''));
    const bi = SUBJECT_ORDER.findIndex((n) => b.name?.includes(n) || n.includes(b.name || ''));
    const ar = ai === -1 ? 999 : ai;
    const br = bi === -1 ? 999 : bi;
    return ar - br;
  });
}
const TAB = {
  dashboard: 'dashboard',
  grades: 'grades',
  schedule: 'schedule',
  ai: 'ai',
  notes: 'notes',
  profile: 'profile',
};

const TABS = [
  { id: TAB.dashboard, label: 'الرئيسية', icon: '🏠' },
  { id: TAB.grades, label: 'الدرجات', icon: '📊' },
  { id: TAB.schedule, label: 'الجدول الأسبوعي', icon: '📅' },
  { id: TAB.ai, label: 'التحليل الذكي', icon: '🤖' },
  { id: TAB.notes, label: 'الملاحظات', icon: '📝' },
  { id: TAB.profile, label: 'ملفي', icon: '👤' },
];

/* ─── Icons ─── */
function Icon({ d, size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: size, height: size, flexShrink: 0 }} aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const BellIcon = () => <Icon d="M12 3a4 4 0 0 0-4 4v2.2c0 .8-.2 1.6-.7 2.3L6 13.4v1.1h12v-1.1l-1.3-1.9a4.2 4.2 0 0 1-.7-2.3V7a4 4 0 0 0-4-4Zm-2 14a2 2 0 0 0 4 0" />;
const ChevLeft = () => <Icon d="m15 18-6-6 6-6" />;
const ChevRight = () => <Icon d="m9 18 6-6-6-6" />;
const LogoutIcon = () => <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />;

/* ════════════════════════════════════════
   ANIMATED COUNTER
════════════════════════════════════════ */
function AnimatedNumber({ value, decimals = 0, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    const duration = 900;
    const start = performance.now();
    const startVal = 0;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startVal + (target - startVal) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{formatNumber ? (decimals > 0 ? Number(display).toFixed(decimals) : Math.round(display)) : Math.round(display)}{suffix}</>;
}

/* ════════════════════════════════════════
   PREMIUM TOP NAV
════════════════════════════════════════ */
function TopNav({ studentName, avatarUrl, notifCount, onLogout }) {
  return (
    <nav className="premium-topnav">
      <div className="premium-topnav-inner">
        <div className="nav-identity">
          {avatarUrl ? (
            <img src={avatarUrl} alt={studentName} className="nav-avatar" />
          ) : (
            <div className="nav-avatar-placeholder">{studentName?.[0] || 'ط'}</div>
          )}
          <div className="nav-student-info">
            <span className="nav-student-name">{studentName}</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="nav-actions">
          <button type="button" aria-label="الإشعارات" className="nav-action-btn relative">
            <BellIcon />
            {notifCount > 0 && (
              <span className="nav-badge">{notifCount > 9 ? '9+' : notifCount}</span>
            )}
          </button>
          <button type="button" onClick={onLogout} className="nav-action-btn nav-logout">
            <LogoutIcon />
            <span className="nav-logout-label">خروج</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════
   HORIZONTAL TAB BAR  — rendered below welcome card
════════════════════════════════════════ */
function TabBar({ activeTab, onTabChange }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const nudge = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * -160, behavior: 'smooth' });
  };

  return (
    <div className="tabbar-wrap">
      {/* Left arrow (in RTL = scroll right through content) */}
      {canScrollLeft && (
        <button type="button" className="tabbar-scroll-arrow tabbar-scroll-arrow-start" onClick={() => nudge(-1)} aria-label="تمرير يساراً">
          <ChevRight />
        </button>
      )}

      <div ref={scrollRef} className="tabbar-inner" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`tabbar-tab ${activeTab === t.id ? 'tabbar-tab-active' : ''}`}
          >
            <span className="tabbar-icon">{t.icon}</span>
            <span>{t.label}</span>
            {activeTab === t.id && <span className="tabbar-underline" />}
          </button>
        ))}
      </div>

      {/* Right arrow (more content hint) */}
      {canScrollRight && (
        <button type="button" className="tabbar-scroll-arrow tabbar-scroll-arrow-end" onClick={() => nudge(1)} aria-label="تمرير يميناً">
          <ChevLeft />
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   PREMIUM SUBJECT CAROUSEL  — drag to scroll
════════════════════════════════════════ */
function PremiumCarousel({ subjects, onSelect }) {
  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const rafRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
    velocity.current = 0;
    lastX.current = e.pageX;
    lastTime.current = Date.now();
    trackRef.current.style.cursor = 'grabbing';
    cancelAnimationFrame(rafRef.current);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const now = Date.now();
    const dt = now - lastTime.current || 1;
    const dx = e.pageX - lastX.current;
    velocity.current = dx / dt;
    lastX.current = e.pageX;
    lastTime.current = now;
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const stopDrag = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
    // Inertia — guard against unmounted ref on every tick
    let vel = velocity.current * 16;
    const inertia = () => {
      if (!trackRef.current) return;
      vel *= 0.93;
      if (Math.abs(vel) < 0.5) return;
      trackRef.current.scrollLeft -= vel;
      rafRef.current = requestAnimationFrame(inertia);
    };
    rafRef.current = requestAnimationFrame(inertia);
  }, []);

  const scrollBy = (dir) => {
    trackRef.current?.scrollBy({ left: dir * -280, behavior: 'smooth' });
  };

  return (
    <div className="carousel-wrapper">
      {/* Prev arrow */}
      <button type="button" className="carousel-arrow carousel-arrow-start" onClick={() => scrollBy(-1)} aria-label="السابق">
        <ChevRight />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        className="carousel-track"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {subjects.map((subject, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <button
              key={subject.id}
              type="button"
              draggable={false}
              className="carousel-card"
              onClick={() => onSelect(subject.id)}
              style={{ '--accent': accent }}
            >
              <div className="carousel-card-accent-bar" style={{ background: accent }} />
              <div className="carousel-card-img-zone">
                <img
                  src={subject.image}
                  alt={subject.name}
                  draggable={false}
                  className="carousel-card-img"
                />
              </div>
              <div className="carousel-card-info">
                <p className="carousel-card-name">{subject.name}</p>
                <p className="carousel-card-teacher">{subject.teacher}</p>
                <p className="carousel-card-cta" style={{ color: accent }}>عرض المادة ←</p>
              </div>
              <div className="carousel-card-hover-glow" style={{ '--accent': accent }} />
            </button>
          );
        })}
      </div>

      {/* Next arrow */}
      <button type="button" className="carousel-arrow carousel-arrow-end" onClick={() => scrollBy(1)} aria-label="التالي">
        <ChevLeft />
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   SUMMARY CARDS  (2 meaningful ones)
════════════════════════════════════════ */
function SummaryCards({ subjects, feedback, onTabChange }) {
  const totalHW = subjects.reduce((a, s) => a + (s.homework?.length || 0), 0);
  const doneHW  = subjects.reduce((a, s) => a + (s.homework || []).filter((h) => h.status === 'مكتمل').length, 0);
  const latest  = feedback[0] || null;
  const s = latest ? (CATCOLOR[latest.category] || CATCOLOR['أخرى']) : null;

  return (
    <div className="summary-cards-row">
      {/* Homework card */}
      <div className="summary-card">
        <div className="summary-card-header">
          <div className="summary-card-icon" style={{ background: '#F0FDF4', color: '#00C853' }}>📝</div>
          <div>
            <p className="summary-card-title">الواجبات</p>
            <p className="summary-card-sub">
              {doneHW > 0 ? `${doneHW} مكتمل من ${totalHW}` : `${totalHW} واجب`}
            </p>
          </div>
        </div>
        {totalHW > 0 && (
          <div className="summary-progress-track">
            <div
              className="summary-progress-fill"
              style={{ width: `${totalHW ? (doneHW / totalHW) * 100 : 0}%`, background: '#00C853' }}
            />
          </div>
        )}
      </div>

      {/* Latest feedback card */}
      <button
        type="button"
        className="summary-card summary-card-clickable"
        onClick={() => onTabChange(TAB.notes)}
      >
        <div className="summary-card-header">
          <div className="summary-card-icon" style={{ background: '#FFF7ED', color: '#F97316' }}>🔔</div>
          <div>
            <p className="summary-card-title">الملاحظات</p>
            <p className="summary-card-sub">{feedback.length} ملاحظة — اضغط للعرض</p>
          </div>
        </div>
        {latest ? (
          <div className="summary-feedback-preview">
            <div className="summary-feedback-top">
              <span className="summary-feedback-subject">{latest.subjectName}</span>
              <span className="summary-feedback-badge" style={{ background: s.bg, color: s.c }}>{latest.category}</span>
              <span className="summary-feedback-date">{formatDate(latest.date)}</span>
            </div>
            <p className="summary-feedback-text clamp-2">{latest.preview}</p>
          </div>
        ) : (
          <p className="summary-empty-hint">لا توجد ملاحظات حالياً</p>
        )}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   WELCOME CARD
════════════════════════════════════════ */
function WelcomeCard({ studentName, className, avatarUrl }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';

  return (
    <div className="welcome-card">
      <div className="welcome-card-bg" />
      <div className="welcome-card-content">
        <div>
          <p className="welcome-greeting">{greeting}،</p>
          <h1 className="welcome-name">{studentName}</h1>
          {className && <p className="welcome-class">الصف {className}</p>}
          <p className="welcome-subtitle">مرحباً بك في بوابتك الأكاديمية المتكاملة</p>
        </div>
        <div className="welcome-avatar-wrap">
          {avatarUrl ? (
            <img src={avatarUrl} alt={studentName} className="welcome-avatar" />
          ) : (
            <div className="welcome-avatar-placeholder">{studentName?.[0] || 'ط'}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   DASHBOARD TAB
════════════════════════════════════════ */
function DashboardTab({ portalData, subjects, onSelectSubject, onTabChange }) {
  const feedback = portalData?.recentFeedback || [];
  const snap = portalData?.weeklySnapshot;
  const recentNotes = feedback.slice(0, 3);

  return (
    <div className="tab-content fade-in-up">

      {/* 2-card summary row */}
      <SummaryCards subjects={subjects} feedback={feedback} onTabChange={onTabChange} />

      {/* Subjects */}
      <section className="section-block">
        <div className="section-header">
          <h2 className="section-title-premium">المواد الدراسية</h2>
          <p className="section-subtitle-premium">اسحب أو اضغط للاستعراض ←</p>
        </div>
        {subjects.length > 0 ? (
          <PremiumCarousel subjects={subjects} onSelect={onSelectSubject} />
        ) : (
          <div className="empty-card">
            <p className="empty-title">لا توجد مواد مخصصة</p>
          </div>
        )}
      </section>

      {/* Bottom row: notes + AI entry */}
      <div className="dashboard-bottom-grid">
        {/* Recent notes */}
        <div className="section-block">
          <div className="section-header">
            <h3 className="section-title-sm">آخر الملاحظات</h3>
            {feedback.length > 0 && (
              <button type="button" className="view-all-btn" onClick={() => onTabChange(TAB.notes)}>
                عرض الكل ({feedback.length})
              </button>
            )}
          </div>
          {!recentNotes.length ? (
            <div className="empty-card-sm"><p className="empty-hint">لا توجد ملاحظات حالياً</p></div>
          ) : (
            <div className="notes-list">
              {recentNotes.map((item) => {
                const s = CATCOLOR[item.category] || CATCOLOR['أخرى'];
                return (
                  <div key={item.id} className="note-row">
                    <div className="note-dot" style={{ background: s.c }} />
                    <div className="note-body">
                      <div className="note-header">
                        <span className="note-subject">{item.subjectName}</span>
                        <span className="note-badge" style={{ background: s.bg, color: s.c }}>{item.category}</span>
                      </div>
                      <p className="note-preview clamp-2">{item.preview}</p>
                    </div>
                    <span className="note-date">{formatDate(item.date)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Analysis card */}
        {snap && (
          <div className="ai-entry-card" onClick={() => onTabChange(TAB.ai)}>
            <div className="ai-entry-icon">🤖</div>
            <div className="ai-entry-info">
              <p className="ai-entry-title">التحليل الذكي للأداء</p>
              <p className="ai-entry-sub">
                {DIRECTION_AR[snap.academicDirection] || '—'}
                {snap.riskStatus && ` · متابعة ${(RISK_AR[snap.riskStatus] || {}).label || ''}`}
              </p>
            </div>
            <div className="ai-entry-arrow"><ChevLeft /></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   GRADES TAB  — subject pill selector
════════════════════════════════════════ */
function GradesTab({ subjects }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const subject = subjects[selectedIdx];

  const avgGrade = useMemo(() => {
    if (!subject) return 0;
    const g = subject.grades || [];
    const s = g.reduce((a, r) => a + Number(r.score || 0), 0);
    const o = g.reduce((a, r) => a + Number(r.outOf || 0), 0);
    return o ? (s / o) * 100 : 0;
  }, [subject, selectedIdx]);

  const badge = avgGrade >= 90 ? { label: 'ممتاز', color: '#00C853', bg: '#F0FDF4' }
    : avgGrade >= 80 ? { label: 'جيد جداً', color: '#2C7BE5', bg: '#EFF6FF' }
    : avgGrade >= 70 ? { label: 'جيد', color: '#FFB300', bg: '#FFFBEB' }
    : avgGrade >= 60 ? { label: 'مقبول', color: '#F97316', bg: '#FFF7ED' }
    : { label: 'يحتاج تحسين', color: '#D32F2F', bg: '#FEF2F2' };

  if (!subjects.length) {
    return (
      <div className="tab-content fade-in-up">
        <div className="empty-card"><p className="empty-title">لا توجد مواد</p></div>
      </div>
    );
  }

  const grades = subject?.grades || [];
  const exams = grades.filter((g) => g.type === 'exam' || !g.type);
  const assignments = grades.filter((g) => g.type === 'assignment');
  const quizzes = grades.filter((g) => g.type === 'quiz');

  return (
    <div className="tab-content fade-in-up">
      <div className="tab-page-header">
        <h2 className="tab-page-title">الدرجات</h2>
        <p className="tab-page-sub">استعرض درجاتك في جميع المواد</p>
      </div>

      {/* Subject pills */}
      <div className="subject-pills-scroll">
        {subjects.map((s, i) => {
          const acc = ACCENTS[i % ACCENTS.length];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedIdx(i)}
              className={`subject-pill ${selectedIdx === i ? 'subject-pill-active' : ''}`}
              style={selectedIdx === i ? { background: acc, borderColor: acc, color: '#fff' } : {}}
            >
              <img src={s.image} alt="" className="subject-pill-img" />
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Grade display */}
      {subject && (
        <div className="grades-display fade-in-up" key={subject.id}>
          {/* Subject header */}
          <div className="grade-subject-header">
            <div className="grade-subject-left">
              <img src={subject.image} alt={subject.name} className="grade-subject-img" />
              <div>
                <h3 className="grade-subject-name">{subject.name}</h3>
                <p className="grade-subject-teacher">{subject.teacher}</p>
              </div>
            </div>
            <div className="grade-subject-right">
              <span className="grade-badge" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
              <p className="grade-avg" style={{ color: ACCENTS[selectedIdx % ACCENTS.length] }}>
                {formatNumber(avgGrade, 1)}٪
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="grade-progress-wrap">
            <div className="grade-progress-track">
              <div
                className="grade-progress-fill"
                style={{
                  width: `${avgGrade}%`,
                  background: ACCENTS[selectedIdx % ACCENTS.length],
                }}
              />
            </div>
          </div>

          {/* Grades table */}
          {grades.length === 0 ? (
            <div className="empty-card-sm"><p className="empty-hint">لا توجد درجات مسجلة</p></div>
          ) : (
            <div className="grades-table-wrap">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>التقييم</th>
                    <th>الدرجة</th>
                    <th>من أصل</th>
                    <th>النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g, idx) => {
                    const pct = g.outOf ? (Number(g.score) / Number(g.outOf)) * 100 : 0;
                    const gc = pct >= 90 ? '#00C853' : pct >= 70 ? '#2C7BE5' : pct >= 50 ? '#FFB300' : '#D32F2F';
                    return (
                      <tr key={idx} className="grade-row">
                        <td className="grade-cell-name">{g.name || g.label || `تقييم ${idx + 1}`}</td>
                        <td className="grade-cell-score" style={{ color: gc }}>{g.score}</td>
                        <td className="grade-cell-out">{g.outOf}</td>
                        <td>
                          <span className="grade-pct-badge" style={{ background: `${gc}15`, color: gc }}>
                            {formatNumber(pct, 1)}٪
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   SCHEDULE TAB  — inline fetch
════════════════════════════════════════ */
function ScheduleTab({ token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState({ className: '', entries: [], schoolDays: [1, 2, 3, 4, 5] });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true); setError('');
        const res = await fetchStudentWeeklySchedule(token);
        if (!active) return;
        setPayload({ className: res.className || '', entries: res.entries || [], schoolDays: res.schoolDays || [1, 2, 3, 4, 5] });
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
    (payload.entries || []).forEach((e) => { map[`${e.dayOfWeek}-${e.startTime}-${e.endTime}`] = e; });
    return map;
  }, [payload.entries]);

  const subjectAccentMap = useMemo(() => {
    const map = {};
    let idx = 0;
    (payload.entries || []).forEach((e) => { if (e.subject && !map[e.subject]) { map[e.subject] = SUBJECT_ACCENTS[idx % SUBJECT_ACCENTS.length]; idx++; } });
    return map;
  }, [payload.entries]);

  return (
    <div className="tab-content fade-in-up">
      <div className="tab-page-header">
        <h2 className="tab-page-title">الجدول الأسبوعي</h2>
        {payload.className && <p className="tab-page-sub">الصف {payload.className}</p>}
      </div>

      {error && <div className="error-banner-premium">{error}</div>}

      {loading ? (
        <div className="sched-skeleton">
          {[1, 2, 3, 4].map((k) => <div key={k} className="skeleton-row" />)}
        </div>
      ) : !payload.entries.length ? (
        <div className="empty-card">
          <div className="empty-icon">📅</div>
          <p className="empty-title">لم يتم تحديد الجدول بعد</p>
          <p className="empty-hint">سيظهر الجدول هنا عند إعداده من قِبل المدرسة.</p>
        </div>
      ) : (
        <div className="schedule-card">
          <div className="schedule-table-wrap">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th className="sched-time-col">الوقت</th>
                  {payload.schoolDays.map((day) => (
                    <th key={day} className="sched-day-col">{DAY_LABELS[day] || day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, rowIdx) => {
                  const [startTime, endTime] = slot.split('-');
                  return (
                    <tr key={slot} className={`sched-row ${rowIdx % 2 === 0 ? '' : 'sched-row-alt'}`}>
                      <td className="sched-time">{startTime} – {endTime}</td>
                      {payload.schoolDays.map((day) => {
                        const entry = entryMap[`${day}-${startTime}-${endTime}`];
                        const accent = entry ? (subjectAccentMap[entry.subject] || '#2C7BE5') : null;
                        return (
                          <td key={`${day}-${slot}`} className="sched-cell">
                            {entry ? (
                              <div className="sched-entry" style={{ borderRightColor: accent }}>
                                <p className="sched-entry-subject">{entry.subject}</p>
                                {entry.teacherName && <p className="sched-entry-teacher">{entry.teacherName}</p>}
                                {entry.room && <p className="sched-entry-room">{entry.room}</p>}
                              </div>
                            ) : (
                              <div className="sched-empty-cell" />
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
  );
}

/* ════════════════════════════════════════
   AI ANALYSIS TAB
════════════════════════════════════════ */
function RingGauge({ pct = 0, color = '#2C7BE5', size = 80, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
}

function AITab({ snap, subjects, portalData }) {
  if (!snap) {
    return (
      <div className="tab-content fade-in-up">
        <div className="empty-card">
          <div className="empty-icon">🤖</div>
          <p className="empty-title">لا توجد بيانات تحليل متاحة</p>
          <p className="empty-hint">يظهر التحليل الذكي بعد اكتمال بيانات الطالب.</p>
        </div>
      </div>
    );
  }

  const risk = RISK_AR[snap.riskStatus] || { label: snap.riskStatus || '—', color: '#475569' };
  const engage = ENGAGE_AR[snap.parentEngagementStatus] || snap.parentEngagementStatus || '—';
  const engageColor = { active: '#00C853', moderate: '#FFB300', low: '#D32F2F' }[snap.parentEngagementStatus] || '#64748B';
  const engagePct = { active: 88, moderate: 55, low: 20 }[snap.parentEngagementStatus] || 50;
  const riskPct = { low: 25, medium: 60, high: 90 }[snap.riskStatus] || 50;

  const subjectStats = (subjects || []).map((s) => {
    const grades = s.grades || [];
    const total = grades.reduce((a, r) => a + Number(r.score || 0), 0);
    const outOf = grades.reduce((a, r) => a + Number(r.outOf || 0), 0);
    const avg = outOf ? (total / outOf) * 100 : null;
    return { ...s, avg };
  }).filter((s) => s.avg !== null).sort((a, b) => b.avg - a.avg);

  const allGrades = (subjects || []).flatMap((s) => s.grades || []);
  const totalScore = allGrades.reduce((a, r) => a + Number(r.score || 0), 0);
  const totalOut = allGrades.reduce((a, r) => a + Number(r.outOf || 0), 0);
  const overallAvg = totalOut ? (totalScore / totalOut) * 100 : 0;

  const allFeedback = portalData?.recentFeedback || [];

  const dirMap = { improving: { label: 'في تحسّن ↑', bg: '#F0FDF4', color: '#00C853' }, declining: { label: 'يحتاج متابعة ↓', bg: '#FEF2F2', color: '#D32F2F' }, stable: { label: 'مستقر →', bg: '#F8FAFC', color: '#64748B' } };
  const dir = dirMap[snap.academicDirection] || dirMap.stable;

  return (
    <div className="tab-content fade-in-up">
      <div className="tab-page-header">
        <h2 className="tab-page-title">🤖 التحليل الذكي للأداء</h2>
        <p className="tab-page-sub">تقرير مدعوم بالذكاء الاصطناعي</p>
      </div>

      {/* KPI row */}
      <div className="ai-kpi-row">
        <div className="ai-kpi-card">
          <p className="ai-kpi-value" style={{ color: '#2C7BE5' }}>{formatNumber(overallAvg, 1)}٪</p>
          <p className="ai-kpi-label">المتوسط العام</p>
        </div>
        <div className="ai-kpi-card">
          <p className="ai-kpi-value" style={{ color: dir.color }}>{dir.label}</p>
          <p className="ai-kpi-label">الاتجاه الأكاديمي</p>
        </div>
        <div className="ai-kpi-card">
          <p className="ai-kpi-value" style={{ color: risk.color }}>{risk.label}</p>
          <p className="ai-kpi-label">مستوى المتابعة</p>
        </div>
        <div className="ai-kpi-card">
          <p className="ai-kpi-value" style={{ color: engageColor }}>{engage}</p>
          <p className="ai-kpi-label">تواصل ولي الأمر</p>
        </div>
      </div>

      <div className="ai-main-grid">
        {/* Left */}
        <div className="ai-left-col">
          {subjectStats.length > 0 && (
            <div className="ai-block">
              <h3 className="ai-block-title">📊 الأداء حسب المادة</h3>
              <div className="ai-bars-list">
                {subjectStats.map((s, i) => {
                  const accent = ACCENTS[i % ACCENTS.length];
                  const pct = s.avg ?? 0;
                  const gLabel = pct >= 90 ? 'ممتاز' : pct >= 80 ? 'جيد جداً' : pct >= 70 ? 'جيد' : pct >= 60 ? 'مقبول' : 'يحتاج تحسين';
                  return (
                    <div key={s.id} className="ai-bar-row">
                      <img src={s.image} alt={s.name} className="ai-bar-img" />
                      <div className="ai-bar-info">
                        <div className="ai-bar-header">
                          <span className="ai-bar-name">{s.name}</span>
                          <div className="ai-bar-meta">
                            <span className="ai-bar-badge" style={{ background: `${accent}18`, color: accent }}>{gLabel}</span>
                            <span className="ai-bar-pct" style={{ color: accent }}>{formatNumber(pct, 1)}٪</span>
                          </div>
                        </div>
                        <div className="ai-bar-track">
                          <div className="ai-bar-fill grade-fill" style={{ width: `${pct}%`, background: accent }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {snap.attendancePattern && (
            <div className="ai-block" style={{ borderTop: '2px solid #2C7BE5' }}>
              <h3 className="ai-block-title">📅 الحضور والغياب</h3>
              <p className="ai-block-text">{snap.attendancePattern}</p>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="ai-right-col">
          <div className="ai-block">
            <h3 className="ai-block-title">📡 مؤشرات المتابعة</h3>
            <div className="ai-gauges">
              <div className="ai-gauge-row">
                <RingGauge pct={riskPct} color={risk.color} size={72} stroke={6} />
                <div>
                  <p className="ai-gauge-label">مستوى المتابعة المطلوب</p>
                  <p className="ai-gauge-value" style={{ color: risk.color }}>{risk.label}</p>
                </div>
              </div>
              <div className="ai-gauge-divider" />
              <div className="ai-gauge-row">
                <RingGauge pct={engagePct} color={engageColor} size={72} stroke={6} />
                <div>
                  <p className="ai-gauge-label">تواصل ولي الأمر</p>
                  <p className="ai-gauge-value" style={{ color: engageColor }}>{engage}</p>
                </div>
              </div>
            </div>
          </div>

          {subjectStats.length > 0 && (
            <div className="ai-block">
              <h3 className="ai-block-title">🏆 أفضل المواد أداءً</h3>
              <div className="ai-top-subjects">
                {subjectStats.slice(0, 4).map((s, i) => {
                  const medals = ['🥇', '🥈', '🥉', '🎖'];
                  return (
                    <div key={s.id} className="ai-top-row">
                      <span className="ai-top-medal">{medals[i] || '•'}</span>
                      <span className="ai-top-name">{s.name}</span>
                      <span className="ai-top-pct" style={{ color: ACCENTS[i % ACCENTS.length] }}>{formatNumber(s.avg, 1)}٪</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   NOTES TAB
════════════════════════════════════════ */
function NotesTab({ feedback }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div className="tab-content fade-in-up">
      <div className="tab-page-header">
        <h2 className="tab-page-title">الملاحظات</h2>
        <span className="tab-count-badge">{feedback.length}</span>
      </div>

      {!feedback.length ? (
        <div className="empty-card">
          <div className="empty-icon">📝</div>
          <p className="empty-title">لا توجد ملاحظات</p>
          <p className="empty-hint">ستظهر ملاحظات المعلمين هنا.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {feedback.map((item) => {
            const s = CATCOLOR[item.category] || CATCOLOR['أخرى'];
            const isOpen = expanded[item.id];
            const isLong = (item.preview || '').length > 120;
            return (
              <div key={item.id} className="note-card">
                <div className="note-card-header">
                  <div>
                    <p className="note-card-subject">{item.subjectName}</p>
                    <p className="note-card-date">{formatDate(item.date)}</p>
                  </div>
                  <span className="note-card-badge" style={{ background: s.bg, color: s.c }}>{item.category}</span>
                </div>
                <p className={`note-card-text ${isOpen || !isLong ? '' : 'clamp-3'}`}>{item.preview}</p>
                {isLong && (
                  <button type="button" className="note-expand-btn" onClick={() => toggle(item.id)}>
                    {isOpen ? 'إخفاء' : 'قراءة المزيد'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   PROFILE TAB
════════════════════════════════════════ */
function ProfileTab({ portalData, subjects, user, avatarUrl, studentName, className, onTabChange }) {
  const allGrades = subjects.flatMap((s) => s.grades || []);
  const totalScore = allGrades.reduce((a, r) => a + Number(r.score || 0), 0);
  const totalOut = allGrades.reduce((a, r) => a + Number(r.outOf || 0), 0);
  const overallAvg = totalOut ? (totalScore / totalOut) * 100 : 0;
  const feedback = portalData?.recentFeedback || [];

  return (
    <div className="tab-content fade-in-up">
      <div className="tab-page-header">
        <h2 className="tab-page-title">ملفي الشخصي</h2>
      </div>

      <div className="profile-layout">
        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt={studentName} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">{studentName?.[0] || 'ط'}</div>
            )}
          </div>
          <h3 className="profile-name">{studentName}</h3>
          {className && <p className="profile-class">الصف {className}</p>}
          {user?.email && <p className="profile-email">{user.email}</p>}
        </div>

        {/* Stats */}
        <div className="profile-stats-col">
          <div className="profile-stat-card">
            <span className="profile-stat-icon">📊</span>
            <div>
              <p className="profile-stat-value" style={{ color: '#2C7BE5' }}>{formatNumber(overallAvg, 1)}٪</p>
              <p className="profile-stat-label">المتوسط الأكاديمي</p>
            </div>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">📚</span>
            <div>
              <p className="profile-stat-value" style={{ color: '#8B5CF6' }}>{subjects.length}</p>
              <p className="profile-stat-label">المواد الدراسية</p>
            </div>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">📝</span>
            <div>
              <p className="profile-stat-value" style={{ color: '#F97316' }}>{feedback.length}</p>
              <p className="profile-stat-label">الملاحظات</p>
            </div>
          </div>

          {/* Quick access */}
          <button
            type="button"
            className="profile-ai-btn"
            onClick={() => onTabChange(TAB.ai)}
          >
            <span>🤖</span>
            <span>عرض التحليل الذكي</span>
            <ChevLeft />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   ROOT PAGE
════════════════════════════════════════ */
export default function StudentPortalPage() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portalData, setPortalData] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB.dashboard);
  const [activeSubjectId, setActiveSubjectId] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true); setError('');
        const payload = await fetchStudentPortal(token);
        if (!active) return;
        setPortalData({
          ...payload,
          subjects: sortSubjects((payload.subjects || []).map((s) => ({
            ...s,
            image: resolveSubjectImage(s.name),
            feedbackItems: (s.feedbackItems || []).map((f) => ({ ...f, category: mapCat(f.category) })),
          }))),
          recentFeedback: (payload.recentFeedback || []).map((f) => ({ ...f, category: mapCat(f.category) })),
        });
      } catch (e) {
        if (active) { setError(e?.message || 'تعذّر تحميل البوابة.'); setPortalData(null); }
      } finally {
        if (active) setLoading(false);
      }
    };
    if (token) load(); else setLoading(false);
    return () => { active = false; };
  }, [token]);

  const subjects = portalData?.subjects || [];

  const selectedSubject = useMemo(
    () => (activeSubjectId ? subjects.find((s) => s.id === activeSubjectId) || null : null),
    [activeSubjectId, subjects]
  );

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleSelectSubject = (id) => { setActiveSubjectId(id); };
  const handleBackFromSubject = () => { setActiveSubjectId(null); };

  const studentName = portalData?.student?.name || user?.name || 'الطالب';
  const className = portalData?.student?.className || user?.classes?.[0] || '';
  const avatarUrl = portalData?.student?.avatarUrl || user?.profilePicture || '';
  const notifCount = (portalData?.recentFeedback || []).length;

  /* Full-page subject view */
  if (selectedSubject) {
    return (
      <SubjectPage
        subject={selectedSubject}
        allSubjects={subjects}
        subjectDetails={{}}
        recentFeedback={portalData?.recentFeedback || []}
        onBack={handleBackFromSubject}
        onSwitch={(id) => setActiveSubjectId(id)}
      />
    );
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Premium CSS injected ── */}
      <style>{PREMIUM_CSS}</style>

      <main dir="rtl" className="portal-root">
        <TopNav
          studentName={studentName}
          avatarUrl={avatarUrl}
          notifCount={notifCount}
          onLogout={handleLogout}
        />

        <div className="portal-content">
          {/* Welcome card + tab bar always visible */}
          <WelcomeCard studentName={studentName} className={className} avatarUrl={avatarUrl} />
          <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

          {error && <div className="error-banner-premium">{error}</div>}

          {loading ? (
            <div className="loading-grid">
              <div className="loading-bar" style={{ height: 88 }} />
              <div className="loading-row">
                {[1, 2, 3, 4].map((k) => <div key={k} className="skeleton-card" />)}
              </div>
              <div className="loading-bar" style={{ height: 240 }} />
            </div>
          ) : (
            <>
              {activeTab === TAB.dashboard && (
                <DashboardTab
                  portalData={portalData}
                  subjects={subjects}
                  onSelectSubject={handleSelectSubject}
                  onTabChange={handleTabChange}
                />
              )}
              {activeTab === TAB.grades && <GradesTab subjects={subjects} />}
              {activeTab === TAB.schedule && <ScheduleTab token={token} />}
              {activeTab === TAB.ai && (
                <AITab snap={portalData?.weeklySnapshot} subjects={subjects} portalData={portalData} />
              )}
              {activeTab === TAB.notes && <NotesTab feedback={portalData?.recentFeedback || []} />}
              {activeTab === TAB.profile && (
                <ProfileTab
                  portalData={portalData}
                  subjects={subjects}
                  user={user}
                  avatarUrl={avatarUrl}
                  studentName={studentName}
                  className={className}
                  onTabChange={handleTabChange}
                />
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

/* ════════════════════════════════════════
   PREMIUM CSS  — injected as a style tag
════════════════════════════════════════ */
const PREMIUM_CSS = `
/* ── Root ── */
.portal-root {
  min-height: 100dvh;
  background: #F5F6FA;
  font-family: 'Cairo', sans-serif;
}

/* ── Top Nav — slim identity bar only ── */
.premium-topnav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #E8ECF4;
  box-shadow: 0 1px 8px rgba(15,23,42,0.05);
}
.premium-topnav-inner {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 32px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.nav-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.nav-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #E8ECF4;
}
.nav-avatar-placeholder {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #EFF6FF;
  border: 2px solid #BFDBFE;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; color: #2C7BE5;
}
.nav-student-name { font-size: 13px; font-weight: 700; color: #0F172A; }
.nav-actions { display: flex; align-items: center; gap: 6px; }
.nav-action-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px;
  border: 1px solid #E8ECF4; border-radius: 8px;
  background: #F8FAFC; cursor: pointer;
  font-family: 'Cairo', sans-serif; font-size: 13px; font-weight: 600; color: #475569;
  transition: all 180ms ease;
}
.nav-action-btn:hover { background: #EFF6FF; border-color: #BFDBFE; color: #2C7BE5; transform: translateY(-1px); }
.nav-badge {
  position: absolute; top: -4px; left: -4px;
  min-width: 16px; height: 16px;
  background: #D32F2F; color: #fff;
  font-size: 9px; font-weight: 700; border-radius: 999px;
  display: flex; align-items: center; justify-content: center; padding: 0 3px;
}
.nav-logout { color: #D32F2F; }
.nav-logout:hover { background: #FEF2F2 !important; border-color: #FECACA !important; color: #D32F2F !important; }
.nav-logout-label { font-size: 13px; }

/* ── Tab Bar — below welcome card ── */
.tabbar-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  padding: 6px;
  margin-bottom: 28px;
  box-shadow: 0 2px 12px rgba(15,23,42,0.05);
  gap: 4px;
}
.tabbar-inner {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.tabbar-inner::-webkit-scrollbar { display: none; }
.tabbar-tab {
  position: relative;
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  border: none; background: none; cursor: pointer;
  font-family: 'Cairo', sans-serif;
  font-size: 14px; font-weight: 600;
  color: #64748B;
  border-radius: 11px;
  transition: color 200ms ease, background 200ms ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.tabbar-tab:hover { color: #0F172A; background: #F8FAFC; }
.tabbar-tab-active {
  color: #2C7BE5 !important;
  background: #EFF6FF !important;
  font-weight: 700;
}
.tabbar-icon { font-size: 16px; }
.tabbar-underline {
  position: absolute;
  bottom: 4px; left: 12px; right: 12px;
  height: 2px;
  background: #2C7BE5;
  border-radius: 2px;
  animation: slideIn 220ms cubic-bezier(0.16,1,0.3,1);
}
@keyframes slideIn {
  from { transform: scaleX(0); opacity: 0; }
  to   { transform: scaleX(1); opacity: 1; }
}
/* Scroll arrows inside tabbar */
.tabbar-scroll-arrow {
  flex-shrink: 0;
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #E8ECF4;
  background: #F8FAFC;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #64748B;
  transition: all 180ms ease;
  animation: fadeUp 200ms ease;
}
.tabbar-scroll-arrow:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
  color: #2C7BE5;
}

/* ── Summary Cards (2-card row) ── */
.summary-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;
}
@media (max-width: 600px) { .summary-cards-row { grid-template-columns: 1fr; } }
.summary-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(15,23,42,0.05);
  animation: fadeUp 350ms ease both;
  text-align: right;
}
.summary-card-clickable {
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease;
  font-family: 'Cairo', sans-serif;
  width: 100%;
}
.summary-card-clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(15,23,42,0.09);
  border-color: #F97316;
}
.summary-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.summary-card-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 19px;
  flex-shrink: 0;
}
.summary-card-title {
  font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 2px;
}
.summary-card-sub {
  font-size: 12px; color: #64748B; margin: 0;
}
.summary-progress-track {
  height: 7px;
  background: #F1F5F9;
  border-radius: 999px;
  overflow: hidden;
}
.summary-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 900ms cubic-bezier(0.16,1,0.3,1);
}
.summary-feedback-preview {
  background: #FFF7ED;
  border: 1px solid #FED7AA;
  border-radius: 10px;
  padding: 10px 12px;
}
.summary-feedback-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.summary-feedback-subject { font-size: 12px; font-weight: 700; color: #0F172A; }
.summary-feedback-badge {
  font-size: 10px; font-weight: 700;
  padding: 2px 7px; border-radius: 999px;
}
.summary-feedback-date { font-size: 11px; color: #94A3B8; margin-right: auto; }
.summary-feedback-text { font-size: 12px; color: #64748B; line-height: 1.6; margin: 0; }
.summary-empty-hint { font-size: 13px; color: #94A3B8; margin: 0; text-align: center; padding: 8px 0; }
.portal-content {
  max-width: 1360px;
  margin: 0 auto;
  padding: 24px 32px 48px;
}

/* ── Welcome Card ── */
.welcome-card {
  position: relative;
  background: linear-gradient(135deg, #1E3A8A 0%, #2C7BE5 60%, #38BDF8 100%);
  border-radius: 20px;
  padding: 32px 36px;
  margin-bottom: 28px;
  overflow: hidden;
}
.welcome-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.12) 0%, transparent 60%);
  pointer-events: none;
}
.welcome-card::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
  pointer-events: none;
}
.welcome-card::after {
  content: '';
  position: absolute;
  bottom: -60px; left: -20px;
  width: 160px; height: 160px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  pointer-events: none;
}
.welcome-card-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.welcome-greeting {
  font-size: 14px;
  color: rgba(255,255,255,0.75);
  margin: 0 0 4px;
}
.welcome-name {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 4px;
}
.welcome-class {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  margin: 0 0 8px;
}
.welcome-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  margin: 0;
}
.welcome-avatar-wrap {
  flex-shrink: 0;
}
.welcome-avatar {
  width: 72px; height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.4);
}
.welcome-avatar-placeholder {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 3px solid rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 800; color: #fff;
}

/* ── Section Block ── */
.section-block {
  margin-bottom: 32px;
}
.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.section-title-premium {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
}
.section-subtitle-premium {
  font-size: 12px;
  color: #94A3B8;
  margin: 0;
}
.section-title-sm {
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
}
.view-all-btn {
  border: none;
  background: none;
  font-family: 'Cairo', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #2C7BE5;
  cursor: pointer;
  padding: 0;
}
.view-all-btn:hover { opacity: 0.7; }

/* ── Subject Carousel ── */
.carousel-wrapper {
  position: relative;
  padding: 0 44px;
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-60%); /* offset for padding-top on track */
  z-index: 3;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid #E8ECF4;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 2px 8px rgba(15,23,42,0.08);
  opacity: 0;
}
.carousel-wrapper:hover .carousel-arrow { opacity: 1; }
.carousel-arrow:hover {
  background: #2C7BE5;
  color: #fff;
  border-color: #2C7BE5;
  transform: translateY(-60%) scale(1.05);
}
.carousel-arrow-start { right: 0; }
.carousel-arrow-end { left: 0; }
.carousel-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: visible; /* CRITICAL: allow cards to lift without clipping */
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-top: 10px;   /* room for hover lift */
  padding-bottom: 12px;
  cursor: grab;
  user-select: none;
}
.carousel-track:active { cursor: grabbing; }
.carousel-track::-webkit-scrollbar { display: none; }
.carousel-card {
  flex: 0 0 200px;
  scroll-snap-align: start;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  text-align: right;
  position: relative;
  transition: transform 240ms cubic-bezier(0.16,1,0.3,1), box-shadow 240ms ease, border-color 240ms ease;
  box-shadow: 0 2px 10px rgba(15,23,42,0.05);
}
.carousel-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 36px rgba(15,23,42,0.13);
  border-color: var(--accent);
}
.carousel-card:active { transform: scale(0.97); }
.carousel-card-accent-bar { height: 3px; width: 100%; }
.carousel-card-img-zone {
  display: flex; align-items: center; justify-content: center;
  padding: 20px 16px;
  background: #F8FAFC;
}
.carousel-card-img {
  width: 72px; height: 72px;
  object-fit: contain;
  transition: transform 240ms ease;
  pointer-events: none;
}
.carousel-card:hover .carousel-card-img { transform: scale(1.08); }
.carousel-card-info { padding: 12px 14px 14px; border-top: 1px solid #F1F5F9; }
.carousel-card-name {
  font-size: 13px; font-weight: 700; color: #0F172A;
  margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.carousel-card-teacher {
  font-size: 11px; color: #94A3B8;
  margin: 0 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.carousel-card-cta { font-size: 11px; font-weight: 700; margin: 0; }
.carousel-card-hover-glow {
  position: absolute; inset: 0; border-radius: 16px; opacity: 0;
  transition: opacity 240ms ease;
  box-shadow: inset 0 0 0 2px var(--accent);
  pointer-events: none;
}
.carousel-card:hover .carousel-card-hover-glow { opacity: 1; }

/* ── Dashboard Bottom Grid ── */
.dashboard-bottom-grid {
  display: grid;
  grid-template-columns: minmax(0,2fr) minmax(0,1fr);
  gap: 24px;
  align-items: start;
}
@media (max-width: 800px) { .dashboard-bottom-grid { grid-template-columns: 1fr; } }

/* ── Notes preview list ── */
.notes-list { display: flex; flex-direction: column; gap: 8px; }
.note-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 12px;
  padding: 12px 14px;
  transition: box-shadow 200ms ease;
}
.note-row:hover { box-shadow: 0 4px 16px rgba(15,23,42,0.07); }
.note-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.note-body { flex: 1; min-width: 0; }
.note-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.note-subject { font-size: 13px; font-weight: 700; color: #0F172A; }
.note-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; }
.note-preview { font-size: 12px; color: #64748B; margin: 0; line-height: 1.6; }
.note-date { font-size: 11px; color: #94A3B8; flex-shrink: 0; }

/* ── AI Entry Card ── */
.ai-entry-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-right: 3px solid #2C7BE5;
  border-radius: 16px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 220ms ease;
}
.ai-entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(44,123,229,0.12);
  border-right-color: #2C7BE5;
}
.ai-entry-icon {
  width: 40px; height: 40px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.ai-entry-info { flex: 1; min-width: 0; }
.ai-entry-title { font-size: 14px; font-weight: 700; color: #0F172A; margin: 0 0 3px; }
.ai-entry-sub { font-size: 12px; color: #64748B; margin: 0; }
.ai-entry-arrow { color: #94A3B8; }

/* ── Tab Content ── */
.tab-content { animation: fadeUp 300ms ease-out both; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-in-up { animation: fadeUp 280ms ease-out both; }

/* ── Tab Page Header ── */
.tab-page-header {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.tab-page-title {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
}
.tab-page-sub { font-size: 13px; color: #94A3B8; margin: 0; }
.tab-count-badge {
  font-size: 12px;
  font-weight: 700;
  background: #EFF6FF;
  color: #2C7BE5;
  border: 1px solid #BFDBFE;
  padding: 2px 10px;
  border-radius: 999px;
}

/* ── Subject Pills ── */
.subject-pills-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
  margin-bottom: 24px;
}
.subject-pills-scroll::-webkit-scrollbar { display: none; }
.subject-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: 1.5px solid #E8ECF4;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font-family: 'Cairo', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  transition: all 220ms ease;
}
.subject-pill:hover { border-color: #BFDBFE; color: #0F172A; }
.subject-pill-active { box-shadow: 0 4px 12px rgba(44,123,229,0.2); }
.subject-pill-img { width: 20px; height: 20px; object-fit: contain; }

/* ── Grades Display ── */
.grades-display {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(15,23,42,0.06);
}
.grade-subject-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 20px;
  border-bottom: 1px solid #F1F5F9;
  flex-wrap: wrap;
}
.grade-subject-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.grade-subject-img { width: 48px; height: 48px; object-fit: contain; }
.grade-subject-name { font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 3px; }
.grade-subject-teacher { font-size: 13px; color: #64748B; margin: 0; }
.grade-subject-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.grade-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.grade-avg { font-size: 28px; font-weight: 800; margin: 0; }
.grade-progress-wrap { padding: 0 24px 16px; }
.grade-progress-track {
  height: 8px;
  background: #F1F5F9;
  border-radius: 999px;
  overflow: hidden;
}
.grade-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 900ms cubic-bezier(0.16,1,0.3,1);
}

/* ── Grades Table ── */
.grades-table-wrap { padding: 0 24px 24px; overflow-x: auto; }
.grades-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.grades-table th {
  text-align: right;
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #F1F5F9;
}
.grade-row { transition: background 150ms ease; }
.grade-row:hover { background: #F8FAFC; }
.grade-row td { padding: 11px 12px; border-bottom: 1px solid #F8FAFC; }
.grade-row:last-child td { border-bottom: none; }
.grade-cell-name { font-weight: 600; color: #0F172A; }
.grade-cell-score { font-weight: 700; font-size: 15px; }
.grade-cell-out { color: #64748B; }
.grade-pct-badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

/* ── Schedule ── */
.schedule-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(15,23,42,0.06);
}
.schedule-table-wrap { overflow-x: auto; }
.schedule-table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  text-align: right;
}
.schedule-table thead { background: #F8FAFC; border-bottom: 1px solid #E8ECF4; }
.sched-time-col { padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; width: 100px; }
.sched-day-col { padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0F172A; }
.sched-row { border-bottom: 1px solid #F1F5F9; }
.sched-row:last-child { border-bottom: none; }
.sched-row-alt { background: #FAFBFC; }
.sched-time { padding: 10px 16px; font-size: 12px; font-weight: 700; color: #64748B; white-space: nowrap; }
.sched-cell { padding: 6px 8px; }
.sched-entry {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-right-width: 3px;
  border-radius: 10px;
  padding: 8px 10px;
  transition: box-shadow 180ms ease;
}
.sched-entry:hover { box-shadow: 0 3px 12px rgba(15,23,42,0.07); }
.sched-entry-subject { font-size: 13px; font-weight: 700; color: #0F172A; margin: 0 0 2px; }
.sched-entry-teacher { font-size: 11px; color: #64748B; margin: 0; }
.sched-entry-room { font-size: 11px; color: #94A3B8; margin: 0; }
.sched-empty-cell { background: #F8FAFC; border: 1px dashed #E8ECF4; border-radius: 10px; height: 56px; }
.sched-skeleton { display: flex; flex-direction: column; gap: 10px; }
.skeleton-row { height: 56px; background: #E8ECF4; border-radius: 10px; animation: shimmer 1.2s ease-out infinite; background-size: 200% 100%; background-image: linear-gradient(90deg, #E8ECF4 0%, #F1F5F9 50%, #E8ECF4 100%); }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

/* ── AI Tab ── */
.ai-kpi-row {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  gap: 14px;
  margin-bottom: 24px;
}
@media (max-width: 900px) { .ai-kpi-row { grid-template-columns: repeat(2,1fr); } }
.ai-kpi-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 14px;
  padding: 18px;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.ai-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(15,23,42,0.08); }
.ai-kpi-value { font-size: 20px; font-weight: 800; margin: 0 0 4px; }
.ai-kpi-label { font-size: 12px; color: #64748B; margin: 0; }
.ai-main-grid {
  display: grid;
  grid-template-columns: minmax(0,2fr) minmax(0,1fr);
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) { .ai-main-grid { grid-template-columns: 1fr; } }
.ai-left-col, .ai-right-col { display: flex; flex-direction: column; gap: 16px; }
.ai-block {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  padding: 20px;
}
.ai-block-title { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }
.ai-block-text { font-size: 14px; color: #475569; line-height: 1.7; margin: 0; }
.ai-bars-list { display: flex; flex-direction: column; gap: 14px; }
.ai-bar-row { display: flex; align-items: center; gap: 12px; }
.ai-bar-img { width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; }
.ai-bar-info { flex: 1; min-width: 0; }
.ai-bar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.ai-bar-name { font-size: 13px; font-weight: 600; color: #0F172A; }
.ai-bar-meta { display: flex; align-items: center; gap: 8px; }
.ai-bar-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; }
.ai-bar-pct { font-size: 13px; font-weight: 800; }
.ai-bar-track { height: 7px; border-radius: 999px; overflow: hidden; background: #F1F5F9; }
.ai-bar-fill { height: 100%; border-radius: 999px; }
.ai-gauges { display: flex; flex-direction: column; gap: 16px; }
.ai-gauge-row { display: flex; align-items: center; gap: 14px; }
.ai-gauge-divider { height: 1px; background: #F1F5F9; }
.ai-gauge-label { font-size: 11px; color: #94A3B8; margin: 0 0 4px; }
.ai-gauge-value { font-size: 16px; font-weight: 700; margin: 0; }
.ai-top-subjects { display: flex; flex-direction: column; gap: 10px; }
.ai-top-row { display: flex; align-items: center; gap: 10px; }
.ai-top-medal { font-size: 16px; flex-shrink: 0; }
.ai-top-name { flex: 1; font-size: 13px; font-weight: 600; color: #0F172A; }
.ai-top-pct { font-size: 13px; font-weight: 800; }

/* ── Notes Tab ── */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
  gap: 14px;
}
.note-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 14px;
  padding: 16px;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.note-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(15,23,42,0.08); }
.note-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.note-card-subject { font-size: 14px; font-weight: 700; color: #0F172A; margin: 0; }
.note-card-date { font-size: 11px; color: #94A3B8; margin: 2px 0 0; }
.note-card-badge { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 999px; flex-shrink: 0; }
.note-card-text { font-size: 13px; color: #475569; line-height: 1.7; margin: 0; }
.note-expand-btn {
  margin-top: 8px;
  border: none; background: none;
  font-family: 'Cairo', sans-serif;
  font-size: 12px; font-weight: 700;
  color: #2C7BE5; cursor: pointer; padding: 0;
}
.note-expand-btn:hover { opacity: 0.7; }

/* ── Profile Tab ── */
.profile-layout {
  display: grid;
  grid-template-columns: 240px minmax(0,1fr);
  gap: 24px;
  align-items: start;
}
@media (max-width: 700px) { .profile-layout { grid-template-columns: 1fr; } }
.profile-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 20px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(15,23,42,0.05);
}
.profile-avatar-wrap { margin-bottom: 14px; }
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #BFDBFE; }
.profile-avatar-placeholder {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: #EFF6FF;
  border: 3px solid #BFDBFE;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 800; color: #2C7BE5;
  margin: 0 auto;
}
.profile-name { font-size: 17px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.profile-class { font-size: 13px; color: #64748B; margin: 0 0 4px; }
.profile-email { font-size: 12px; color: #94A3B8; margin: 0; }
.profile-stats-col { display: flex; flex-direction: column; gap: 12px; }
.profile-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 14px;
  padding: 16px 18px;
  transition: transform 200ms ease;
}
.profile-stat-card:hover { transform: translateY(-2px); }
.profile-stat-icon { font-size: 22px; }
.profile-stat-value { font-size: 22px; font-weight: 800; margin: 0 0 2px; }
.profile-stat-label { font-size: 12px; color: #64748B; margin: 0; }
.profile-ai-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #EFF6FF;
  border: 1.5px solid #BFDBFE;
  border-radius: 14px;
  padding: 16px 18px;
  cursor: pointer;
  font-family: 'Cairo', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #2C7BE5;
  transition: all 200ms ease;
  text-align: right;
}
.profile-ai-btn:hover {
  background: #DBEAFE;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(44,123,229,0.15);
}
.profile-ai-btn > *:last-child { margin-right: auto; }

/* ── Empty + Error states ── */
.empty-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  padding: 60px 24px;
  text-align: center;
}
.empty-card-sm {
  background: #F8FAFC;
  border: 1px dashed #E8ECF4;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}
.empty-icon { font-size: 36px; margin-bottom: 12px; }
.empty-title { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 6px; }
.empty-hint { font-size: 13px; color: #94A3B8; margin: 0; }
.error-banner-premium {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
  color: #D32F2F;
  margin-bottom: 20px;
}

/* ── Loading skeletons ── */
.loading-grid { display: flex; flex-direction: column; gap: 16px; }
.loading-bar {
  background: #E8ECF4;
  border-radius: 16px;
  animation: shimmer 1.2s ease-out infinite;
  background-size: 200% 100%;
  background-image: linear-gradient(90deg, #E8ECF4 0%, #F1F5F9 50%, #E8ECF4 100%);
}
.loading-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.skeleton-card {
  height: 88px;
  background: #E8ECF4;
  border-radius: 14px;
  animation: shimmer 1.2s ease-out infinite;
  background-size: 200% 100%;
  background-image: linear-gradient(90deg, #E8ECF4 0%, #F1F5F9 50%, #E8ECF4 100%);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .premium-topnav-inner { padding: 0 20px; gap: 16px; }
  .portal-content { padding: 20px 20px 40px; }
  .welcome-card { padding: 24px 24px; }
}
@media (max-width: 700px) {
  .nav-student-info { display: none; }
  .nav-logout-label { display: none; }
  .welcome-name { font-size: 22px; }
  .welcome-avatar { width: 56px; height: 56px; }
  .welcome-avatar-placeholder { width: 56px; height: 56px; font-size: 22px; }
}
`;