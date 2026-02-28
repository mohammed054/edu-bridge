import { useMemo, useState } from 'react';
import { FEEDBACK_CATEGORIES, FEEDBACK_LABELS } from '../constants/feedback.js';
import { formatDate, formatDateTime, formatNumber } from '../utils/format.js';

const TAB_OPTIONS = [
  { key: 'announcements', label: 'إعلانات المعلم' },
  { key: 'feedback', label: 'التغذية الراجعة' },
  { key: 'grades', label: 'الدرجات' },
  { key: 'homework', label: 'الواجبات ونجوم ألف' },
];

function ToggleFilter({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            value === item.value
              ? 'border-school-blue bg-school-blue text-white'
              : 'border-slate-300 bg-white text-slate-700 hover:border-school-blue/60'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function AnnouncementsTab({ announcements }) {
  if (!announcements.length) {
    return <p className="text-sm text-slate-600">لا توجد إعلانات حالياً ضمن الفلتر الحالي.</p>;
  }

  return (
    <div className="space-y-3">
      {announcements.map((item) => (
        <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-800">{item.content}</p>
          <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
        </article>
      ))}
    </div>
  );
}

function FeedbackTab({ feedbackItems }) {
  if (!feedbackItems.length) {
    return <p className="text-sm text-slate-600">لا توجد رسائل تغذية راجعة ضمن الفلتر الحالي.</p>;
  }

  return (
    <div className="space-y-3">
      {feedbackItems.map((item) => (
        <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-school-panel px-3 py-1 text-xs font-semibold text-school-blue">
              {FEEDBACK_LABELS[item.category] || 'غير مصنف'}
            </span>
            <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
          </div>
          <p className="text-sm text-slate-800">{item.content}</p>
        </article>
      ))}
    </div>
  );
}

function GradesTab({ grades }) {
  if (!grades.length) {
    return <p className="text-sm text-slate-600">لا توجد درجات ضمن الفلتر الحالي.</p>;
  }

  return (
    <div className="space-y-3">
      {grades.map((item, index) => (
        <article key={`${item.subject}-${item.updatedAt || index}`} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">{item.examTitle || 'اختبار'}</p>
              <p className="text-xs text-slate-500">{formatDate(item.updatedAt)}</p>
            </div>
            <div className="text-left">
              <p className="text-lg font-extrabold text-school-blue">{formatNumber(item.rawScore ?? item.score)}</p>
              <p className="text-xs text-slate-500">من {formatNumber(item.maxMarks || 100)}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function HomeworkTab({ homeworkItems, alefStars = 0 }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-school-panel p-4">
        <p className="text-sm text-slate-700">نجوم منصة ألف</p>
        <p className="mt-1 text-2xl font-extrabold text-school-blue">{formatNumber(alefStars)}</p>
      </div>

      {!homeworkItems.length ? (
        <p className="text-sm text-slate-600">لا توجد واجبات حالياً ضمن الفلتر الحالي.</p>
      ) : (
        <div className="space-y-3">
          {homeworkItems.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">موعد التسليم: {formatDate(item.dueDate)}</p>
                </div>
                <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item.status === 'graded' ? 'تم التقييم' : item.status === 'submitted' ? 'تم التسليم' : 'قيد التنفيذ'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SubjectTabs({
  initialSubject,
  subjectOptions = [],
  announcements = [],
  feedback = [],
  grades = [],
  homework = [],
  alefStarsBySubject = {},
}) {
  const [activeTab, setActiveTab] = useState('announcements');
  const [subjectFilter, setSubjectFilter] = useState(initialSubject || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const normalizedSubjectOptions = useMemo(() => {
    const unique = [...new Set(subjectOptions.filter(Boolean))];
    return [{ value: 'all', label: 'كل المواد' }, ...unique.map((item) => ({ value: item, label: item }))];
  }, [subjectOptions]);

  const categoryOptions = useMemo(
    () => [{ value: 'all', label: 'كل الفئات' }, ...FEEDBACK_CATEGORIES.map((item) => ({ value: item.key, label: item.label }))],
    []
  );

  const bySubject = (item) => subjectFilter === 'all' || item.subject === subjectFilter;

  const filteredAnnouncements = useMemo(
    () => announcements.filter(bySubject),
    [announcements, subjectFilter]
  );

  const filteredFeedback = useMemo(
    () =>
      feedback.filter((item) => {
        if (!bySubject(item)) {
          return false;
        }
        return categoryFilter === 'all' || item.category === categoryFilter;
      }),
    [feedback, subjectFilter, categoryFilter]
  );

  const filteredGrades = useMemo(() => grades.filter(bySubject), [grades, subjectFilter]);
  const filteredHomework = useMemo(() => homework.filter(bySubject), [homework, subjectFilter]);

  const starsCount = useMemo(() => {
    if (subjectFilter === 'all') {
      return Object.values(alefStarsBySubject || {}).reduce((sum, value) => sum + Number(value || 0), 0);
    }
    return Number(alefStarsBySubject?.[subjectFilter] || 0);
  }, [alefStarsBySubject, subjectFilter]);

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">تفاصيل المادة</h3>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">فلتر المادة</p>
          <ToggleFilter options={normalizedSubjectOptions} value={subjectFilter} onChange={setSubjectFilter} />
        </div>

        {activeTab === 'feedback' ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500">فلتر الفئة</p>
            <ToggleFilter options={categoryOptions} value={categoryFilter} onChange={setCategoryFilter} />
          </div>
        ) : null}

        <ToggleFilter
          options={TAB_OPTIONS.map((item) => ({ value: item.key, label: item.label }))}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="relative min-h-[220px]">
        <div key={`${activeTab}-${subjectFilter}-${categoryFilter}`} className="tab-animate space-y-3">
          {activeTab === 'announcements' ? <AnnouncementsTab announcements={filteredAnnouncements} /> : null}
          {activeTab === 'feedback' ? <FeedbackTab feedbackItems={filteredFeedback} /> : null}
          {activeTab === 'grades' ? <GradesTab grades={filteredGrades} /> : null}
          {activeTab === 'homework' ? (
            <HomeworkTab homeworkItems={filteredHomework} alefStars={starsCount} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
