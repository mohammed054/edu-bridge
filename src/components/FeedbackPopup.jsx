import '../styles/FeedbackPopup.css';

export default function FeedbackPopup({
  student,
  feedbackText,
  setFeedbackText,
  suggestions,
  onGenerate,
  onSubmit,
  onClose,
  errorMessage,
  isSaving,
}) {
  if (!student) {
    return null;
  }

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true" aria-label="نافذة تقييم الطالب">
      <section className="popup-card">
        <header className="popup-header">
          <div>
            <h2>تقييم الطالب</h2>
            <p>{student.name} - {student.grade}</p>
          </div>
          <button type="button" className="popup-close" onClick={onClose}>
            إغلاق
          </button>
        </header>

        <label htmlFor="feedback">ملاحظة</label>
        <textarea
          id="feedback"
          rows={4}
          value={feedbackText}
          onChange={(event) => setFeedbackText(event.target.value)}
          placeholder="اكتب ملاحظتك هنا"
        />

        <div className="popup-actions">
          <button type="button" className="secondary-btn" onClick={onGenerate}>
            توليد ملاحظات بالذكاء الاصطناعي
          </button>
          <button type="button" className="primary-btn" onClick={onSubmit} disabled={isSaving}>
            {isSaving ? 'جاري الحفظ...' : 'حفظ التقييم'}
          </button>
        </div>

        {errorMessage ? <p className="popup-error">{errorMessage}</p> : null}

        {suggestions.length > 0 ? (
          <section className="suggestions-list" aria-label="اقتراحات الذكاء الاصطناعي">
            {suggestions.map((item) => (
              <button key={item} type="button" className="suggestion-item" onClick={() => setFeedbackText(item)}>
                {item}
              </button>
            ))}
          </section>
        ) : null}
      </section>
    </div>
  );
}
