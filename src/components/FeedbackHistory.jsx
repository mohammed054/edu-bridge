import { formatDateTime } from '../utils/format.js';

export default function FeedbackHistory({ records = [], title = 'سجل التغذية الراجعة' }) {
  return (
    <section className="card stack">
      <h3 className="section-title">{title}</h3>
      {records.length === 0 ? (
        <p className="hint-text">لا توجد رسائل محفوظة بعد.</p>
      ) : (
        records.map((record) => (
          <article key={record.id} className="list-card">
            <div>
              <strong>{record.studentName || record.teacherName || 'سجل'}</strong>
              <p className="hint-text">{formatDateTime(record.createdAt)}</p>
            </div>
            <p className="message-text">{record.message || '-'}</p>
          </article>
        ))
      )}
    </section>
  );
}
