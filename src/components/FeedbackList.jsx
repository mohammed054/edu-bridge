import { useMemo, useState } from 'react';
import { FEEDBACK_CATEGORIES, FEEDBACK_CATEGORY_LABEL_BY_KEY } from '../constants/feedback.js';
import { formatDateTime } from '../utils/format.js';

const senderLabel = (item) => {
  if (item.senderRole === 'teacher' || item.senderType === 'teacher') {
    return item.teacherName || 'المعلم';
  }
  if (item.senderRole === 'admin' || item.senderType === 'admin') {
    return item.adminName || 'الإدارة';
  }
  return item.studentName || 'الطالب';
};

const feedbackTypeLabel = (type) => {
  if (type === 'teacher_feedback') return 'رسالة من المعلم';
  if (type === 'admin_feedback') return 'رسالة من الإدارة';
  if (type === 'student_to_teacher') return 'رسالة إلى المعلم';
  if (type === 'student_to_admin') return 'رسالة إلى الإدارة';
  return 'تغذية راجعة';
};

const canReplyToItem = (role, item) =>
  role === 'student' && ['teacher_feedback', 'admin_feedback'].includes(item.feedbackType);

function FeedbackItem({ item, role, draftText, onDraftChange, onReply }) {
  const feedbackId = item._id || item.id;
  const messageBody = item.content || item.message || '';

  const submitReply = async () => {
    const text = draftText?.trim();
    if (!text || !onReply) {
      return;
    }
    await onReply(feedbackId, text);
    onDraftChange(feedbackId, '');
  };

  return (
    <details className="feedback-accordion animated-fade">
      <summary className="feedback-summary">
        <div>
          <strong>{item.studentName || 'الطالب'}</strong>
          <p className="hint-text compact">
            {senderLabel(item)} • {item.subject || 'بدون مادة'}
            {item.className ? ` • ${item.className}` : ''}
          </p>
        </div>
        <span className="hint-text">{formatDateTime(item.createdAt || item.timestamp)}</span>
      </summary>

      <div className="feedback-content stack">
        <span className="chip">{feedbackTypeLabel(item.feedbackType)}</span>
        <p className="message-text">{messageBody || 'بدون نص إضافي.'}</p>

        {!!item.categories?.length && (
          <div className="chips">
            {item.categories.map((category) => (
              <span className="chip" key={`${feedbackId}-cat-${category}`}>
                {FEEDBACK_CATEGORY_LABEL_BY_KEY[category] || category}
              </span>
            ))}
          </div>
        )}

        {item.notes ? <p className="meta-line">ملاحظات: {item.notes}</p> : null}
        {item.suggestion ? <p className="meta-line">اقتراح: {item.suggestion}</p> : null}

        {!!item.replies?.length && (
          <div className="reply-list">
            {item.replies.map((reply, index) => (
              <p key={`${feedbackId}-reply-${index}`} className="reply-item">
                <strong>{reply.senderType === 'student' ? 'الطالب' : 'المرسل'}:</strong> {reply.text}
              </p>
            ))}
          </div>
        )}

        {canReplyToItem(role, item) && onReply ? (
          <div className="reply-box">
            <textarea
              className="input textarea small"
              placeholder="اكتب ردك..."
              value={draftText || ''}
              onChange={(event) => onDraftChange(feedbackId, event.target.value)}
            />
            <button className="btn btn-soft" onClick={submitReply} type="button">
              إرسال الرد
            </button>
          </div>
        ) : null}
      </div>
    </details>
  );
}

export default function FeedbackList({ feedbacks, role, onReply }) {
  const [draftReplies, setDraftReplies] = useState({});

  const grouped = useMemo(() => {
    const sorted = [...(feedbacks || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const map = FEEDBACK_CATEGORIES.reduce((acc, category) => {
      acc[category.key] = sorted.filter((item) => (item.categories || []).includes(category.key));
      return acc;
    }, {});
    map.uncategorized = sorted.filter((item) => !(item.categories || []).length);
    return map;
  }, [feedbacks]);

  if (!feedbacks?.length) {
    return (
      <section className="card">
        <h3 className="section-title">سجل التغذية الراجعة</h3>
        <p className="hint-text">لا توجد رسائل مطابقة حالياً.</p>
      </section>
    );
  }

  const changeDraft = (feedbackId, value) => {
    setDraftReplies((current) => ({
      ...current,
      [feedbackId]: value,
    }));
  };

  return (
    <section className="card stack">
      <h3 className="section-title">سجل التغذية الراجعة</h3>

      {FEEDBACK_CATEGORIES.map((category) => (
        <details key={category.key} className="feedback-accordion" open>
          <summary className="feedback-summary">
            <strong>{category.label}</strong>
            <span className="hint-text">{grouped[category.key]?.length || 0}</span>
          </summary>
          <div className="feedback-content stack">
            {!grouped[category.key]?.length ? (
              <p className="hint-text">لا توجد رسائل في هذه الفئة.</p>
            ) : (
              grouped[category.key].map((item) => {
                const feedbackId = item._id || item.id;
                return (
                  <FeedbackItem
                    key={feedbackId}
                    item={item}
                    role={role}
                    draftText={draftReplies[feedbackId]}
                    onDraftChange={changeDraft}
                    onReply={onReply}
                  />
                );
              })
            )}
          </div>
        </details>
      ))}

      {grouped.uncategorized?.length ? (
        <details className="feedback-accordion">
          <summary className="feedback-summary">
            <strong>غير مصنف</strong>
            <span className="hint-text">{grouped.uncategorized.length}</span>
          </summary>
          <div className="feedback-content stack">
            {grouped.uncategorized.map((item) => {
              const feedbackId = item._id || item.id;
              return (
                <FeedbackItem
                  key={feedbackId}
                  item={item}
                  role={role}
                  draftText={draftReplies[feedbackId]}
                  onDraftChange={changeDraft}
                  onReply={onReply}
                />
              );
            })}
          </div>
        </details>
      ) : null}
    </section>
  );
}
