import { useEffect, useMemo, useRef, useState } from 'react';
import EmptyState from './EmptyState';
import GradeTable from './GradeTable';
import Sidebar from './Sidebar';
import Tabs from './Tabs';
import { formatDate, formatDateTime } from '../utils/format';

const TAB_OPTIONS = [
  { key: 'posts',    label: 'المنشورات' },
  { key: 'homework', label: 'الواجبات'  },
  { key: 'grades',   label: 'الدرجات'  },
];

const HOMEWORK_STATUS = {
  مكتمل:       { bg: '#F0FDF4', color: '#00C853' },
  'غير مكتمل': { bg: '#FEF2F2', color: '#D32F2F' },
};

function ChevronDown() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
      <path d="m4 7 6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ACCENTS = ['#2C7BE5', '#00C853', '#FFB300', '#D32F2F', '#8B5CF6', '#F97316', '#14B8A6', '#EC4899'];

function SubjectSwitcher({ current, allSubjects, onSwitch }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="action-btn flex items-center gap-2 focus-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="max-w-[130px] truncate">{current.name}</span>
        <ChevronDown />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="اختر مادة"
          className="absolute start-0 top-full z-30 mt-1 min-w-[200px] rounded-md border border-border bg-surface shadow-md animate-fadeUp overflow-hidden"
        >
          {allSubjects.map((s, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <button
                key={s.id}
                type="button"
                role="option"
                aria-selected={s.id === current.id}
                onClick={() => { onSwitch(s.id); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-right text-[13px] premium-transition hover:bg-slate-50 focus-ring
                  ${s.id === current.id ? 'bg-slate-50 font-semibold text-text-primary' : 'text-text-secondary'}`}
              >
                <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: accent }} />
                <img src={s.image} alt="" aria-hidden className="w-7 h-7 object-contain flex-shrink-0" />
                <span className="flex-1">{s.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SubjectPage({ subject, allSubjects, recentFeedback, onBack, onSwitch }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [expandedPosts, setExpandedPosts] = useState({});

  useEffect(() => {
    setActiveTab('posts');
    setExpandedPosts({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [subject?.id]);

  const avgGrade = useMemo(() => {
    const g = subject?.grades || [];
    if (!g.length) return 0;
    const s = g.reduce((a, r) => a + Number(r.score || 0), 0);
    const o = g.reduce((a, r) => a + Number(r.outOf || 0), 0);
    return o ? (s / o) * 100 : 0;
  }, [subject?.grades]);

  const togglePost = (id) => setExpandedPosts((c) => ({ ...c, [id]: !c[id] }));

  const renderPosts = () => {
    const posts = subject.posts || [];
    if (!posts.length) return <EmptyState title="لا توجد منشورات" description="لا توجد منشورات لهذه المادة حالياً." compact />;
    return (
      <div className="space-y-3">
        {posts.map((post) => {
          const expanded = Boolean(expandedPosts[post.id]);
          const isLong = post.body.length > 180;
          return (
            <div key={post.id} className="panel-card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-[15px] font-semibold text-text-primary">{post.title}</h4>
                <span className="flex-shrink-0 text-[12px] text-text-secondary">{formatDate(post.date)}</span>
              </div>
              <p className={`text-[14px] text-text-secondary leading-[1.8] ${expanded ? '' : 'clamp-3'}`}>{post.body}</p>
              {post.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.attachments.map((f) => (
                    <span key={f} className="text-[12px] text-text-secondary border border-border bg-slate-50 px-2.5 py-1 rounded-sm">{f}</span>
                  ))}
                </div>
              )}
              {isLong && (
                <button type="button" onClick={() => togglePost(post.id)} className="mt-2 text-[12px] font-semibold text-primary hover:opacity-80 focus-ring">
                  {expanded ? 'إخفاء' : 'قراءة المزيد'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderHomework = () => {
    const hw = subject.homework || [];
    if (!hw.length) return <EmptyState title="لا توجد واجبات" description="لا توجد واجبات مسجلة لهذه المادة." compact />;
    return (
      <div className="space-y-3">
        {hw.map((item) => {
          const s = HOMEWORK_STATUS[item.status] || { bg: '#F8FAFC', color: '#475569' };
          return (
            <div key={item.id} className="panel-card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-[15px] font-semibold text-text-primary">{item.title}</h4>
                <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                  {item.status}
                </span>
              </div>
              <p className="text-[13px] text-text-secondary">موعد التسليم: {formatDateTime(item.dueDate)}</p>
              {item.attachment && <p className="mt-1 text-[13px] text-text-secondary">مرفق: {item.attachment}</p>}
              {item.teacherComment && (
                <div className="mt-3 bg-slate-50 border border-border rounded-sm px-3 py-2.5 text-[13px] text-text-secondary leading-relaxed">
                  ملاحظة المعلم: {item.teacherComment}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const summary = {
    homeworkCount: subject.homework?.length || 0,
    averageGrade:  avgGrade,
    feedbackCount: subject.feedbackItems?.length || 0,
  };

  return (
    <main dir="rtl" className="min-h-screen bg-background">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-surface border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="action-btn focus-ring pressable"
          >
            ← رجوع
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-text-secondary hidden sm:inline">الانتقال إلى:</span>
            <SubjectSwitcher current={subject} allSubjects={allSubjects} onSwitch={onSwitch} />
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Subject header */}
        <div className="surface-card mb-7 overflow-hidden">
          <div className="h-1 w-full bg-primary" />
          <div className="flex items-center gap-5 p-6">
            <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center bg-slate-50 rounded-md border border-border">
              <img src={subject.image} alt={subject.name} className="w-14 h-14 object-contain" />
            </div>
            <div>
              <h1 className="h2-premium">{subject.name}</h1>
              <p className="text-[14px] text-text-secondary mt-1">المعلم: {subject.teacher}</p>
              <p className="text-[13px] text-text-secondary mt-0.5">المتوسط الحالي: <strong className="text-text-primary">{Number(avgGrade).toFixed(1)}٪</strong></p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <div>
            <Tabs tabs={TAB_OPTIONS} activeKey={activeTab} onChange={setActiveTab} />
            {activeTab === 'posts' ? renderPosts() : activeTab === 'homework' ? renderHomework() : <GradeTable rows={subject.grades || []} />}
          </div>
          <Sidebar summary={summary} recentFeedback={subject.feedbackItems || []} />
        </div>
      </div>
    </main>
  );
}
