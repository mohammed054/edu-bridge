import { useEffect, useMemo, useState } from 'react';
import { fetchFeedbackList } from '../../../api/api';
import { useAuth } from '../../../core/auth/useAuth';
import PageHeading from '../components/PageHeading';

const CATEGORY_LABELS = {
  academic: 'أكاديمي',
  behavior: 'سلوك',
  homework: 'واجبات',
  general: 'عام',
};

export default function FeedbackPage() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    let active = true;

    const loadFeedback = async () => {
      try {
        setLoading(true);
        setError('');
        const payload = await fetchFeedbackList(token, { limit: 300 });
        if (!active) {
          return;
        }
        setFeedbacks(payload.feedbacks || []);
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'تعذر تحميل بيانات التغذية الراجعة.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadFeedback();

    return () => {
      active = false;
    };
  }, [token]);

  const categories = useMemo(() => {
    const set = new Set((feedbacks || []).map((item) => item.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [feedbacks]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') {
      return feedbacks;
    }
    return feedbacks.filter((item) => item.category === activeCategory);
  }, [activeCategory, feedbacks]);

  return (
    <div className="page-enter space-y-5 p-1">
      <PageHeading
        title="التغذية الراجعة"
        subtitle="استعراض رسائل التغذية الراجعة مصنفة حسب الفئة."
      />

      {error ? <p className="rounded-sm border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}

      <section className="panel-card space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = activeCategory === category;
            const label =
              category === 'all' ? 'الكل' : CATEGORY_LABELS[category] || category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`action-btn rounded-full px-3 py-1 text-xs ${
                  active ? 'border-transparent bg-primary text-white' : ''
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid gap-3">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <article key={item._id} className="rounded-sm border border-border bg-background p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-text-primary">
                    {item.studentName || 'طالب'}
                  </h2>
                  <p className="text-xs font-semibold text-primary" dir="ltr">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('en-US') : ''}
                  </p>
                </div>
                <p className="text-xs text-text-secondary">
                  المعلم: {item.teacherName || '-'} | الصف: {item.className || '-'} | المادة: {item.subject || '-'}
                </p>
                <p className="mt-2 text-sm leading-7 text-text-primary">
                  {item.message || item.content || item.text || 'لا توجد رسالة.'}
                </p>
              </article>
            ))}
            {!filteredItems.length ? (
              <p className="text-sm text-text-secondary">لا توجد عناصر مطابقة.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
