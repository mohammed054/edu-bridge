import { useEffect, useMemo, useState } from 'react';
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

export default function SubjectView({ subject }) {
  const [activeTab, setActiveTab] = useState('posts');
  const [expandedPosts, setExpandedPosts] = useState({});

  useEffect(() => {
    setActiveTab('posts');
    setExpandedPosts({});
  }, [subject?.id]);

  const avgGrade = useMemo(() => {
    const g = subject?.grades || [];
    if (!g.length) return 0;
    const s = g.reduce((a, r) => a + Number(r.score || 0), 0);
    const o = g.reduce((a, r) => a + Number(r.outOf || 0), 0);
    return o ? (s / o) * 100 : 0;
  }, [subject?.grades]);

  if (!subject) {
    return (
      <div className="panel-card">
        <EmptyState title="اختر مادة" description="اختر مادة من القائمة لعرض تفاصيلها." />
      </div>
    );
  }

  const togglePost = (id) => setExpandedPosts((c) => ({ ...c, [id]: !c[id] }));

  const renderPosts = () => {
    const posts = subject.posts || [];
    if (!posts.length) return <EmptyState title="لا توجد منشورات" compact />;
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
    if (!hw.length) return <EmptyState title="لا توجد واجبات" compact />;
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
    <section className="surface-card overflow-hidden">
      <div className="h-1 w-full bg-primary" />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
          <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-slate-50 rounded-md border border-border">
            <img src={subject.image} alt={subject.name} className="w-10 h-10 object-contain" />
          </div>
          <div className="flex-1">
            <h3 className="h3-premium">{subject.name}</h3>
            <p className="caption-premium mt-0.5">المعلم: {subject.teacher}</p>
          </div>
          <span className="text-[13px] font-semibold text-primary">{Number(avgGrade).toFixed(1)}٪</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <div>
            <Tabs tabs={TAB_OPTIONS} activeKey={activeTab} onChange={setActiveTab} />
            {activeTab === 'posts' ? renderPosts() : activeTab === 'homework' ? renderHomework() : <GradeTable rows={subject.grades || []} />}
          </div>
          <Sidebar summary={summary} recentFeedback={subject.feedbackItems || []} />
        </div>
      </div>
    </section>
  );
}
