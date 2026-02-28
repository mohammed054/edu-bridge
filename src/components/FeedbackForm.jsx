import { useMemo, useState } from 'react';
import { FEEDBACK_CATEGORIES } from '../constants/feedback.js';

const emptyDetails = {
  academic: [],
  behavior: [],
  misc: [],
};

export const buildClientFallbackMessage = (studentName, subject, categories, notes) => {
  const categoryLabels = FEEDBACK_CATEGORIES.filter((item) => categories.includes(item.key)).map(
    (item) => item.label
  );
  const base = `تم حفظ تغذية راجعة للطالب/ة ${studentName} في مادة ${subject} ضمن ${categoryLabels.join('، ') || 'التقييم العام'}.`;
  const notesText = notes?.trim() ? ` ملاحظة: ${notes.trim()}.` : '';
  return `${base}${notesText}`;
};

export default function FeedbackForm({
  studentName,
  subjects = [],
  categoriesCatalog = FEEDBACK_CATEGORIES,
  onSubmit,
  loading,
}) {
  const [subject, setSubject] = useState(subjects[0] || '');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryDetails, setCategoryDetails] = useState(emptyDetails);
  const [notes, setNotes] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [content, setContent] = useState('');
  const [suggestAi, setSuggestAi] = useState(true);

  const categoryMap = useMemo(
    () =>
      categoriesCatalog.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
      }, {}),
    [categoriesCatalog]
  );

  const toggleCategory = (categoryKey) => {
    setSelectedCategories((current) =>
      current.includes(categoryKey)
        ? current.filter((item) => item !== categoryKey)
        : [...current, categoryKey]
    );
  };

  const toggleCategoryDetail = (categoryKey, detail) => {
    setCategoryDetails((current) => {
      const categoryValues = current[categoryKey] || [];
      const nextValues = categoryValues.includes(detail)
        ? categoryValues.filter((item) => item !== detail)
        : [...categoryValues, detail];
      return {
        ...current,
        [categoryKey]: nextValues,
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      subject,
      categories: selectedCategories,
      categoryDetails,
      notes,
      suggestion,
      content,
      suggestAi,
    });
  };

  return (
    <section className="card stack">
      <h3 className="section-title">إرسال تغذية راجعة</h3>
      <p className="hint-text">الطالب المحدد: {studentName || 'اختر طالبًا أولًا'}</p>

      <form className="stack" onSubmit={handleSubmit}>
        <div className="stack tight">
          <label className="field-label" htmlFor="feedback-subject">
            المادة
          </label>
          {subjects.length ? (
            <select
              id="feedback-subject"
              className="input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              <option value="">اختر المادة</option>
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="feedback-subject"
              className="input"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="اكتب اسم المادة"
            />
          )}
        </div>

        <section className="stack">
          <h4 className="section-subtitle">تصنيفات التغذية الراجعة</h4>
          {categoriesCatalog.map((category) => (
            <details key={category.key} className="feedback-accordion">
              <summary className="feedback-summary">
                <label className="row">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.key)}
                    onChange={() => toggleCategory(category.key)}
                  />
                  <strong>{category.label}</strong>
                </label>
                <span className="hint-text">
                  {(categoryDetails[category.key] || []).length} عناصر
                </span>
              </summary>

              <div className="feedback-content stack">
                {(category.options || []).map((option) => (
                  <label className="tag-item" key={`${category.key}-${option}`}>
                    <input
                      type="checkbox"
                      checked={(categoryDetails[category.key] || []).includes(option)}
                      onChange={() => toggleCategoryDetail(category.key, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}

                {category.key === 'misc' ? (
                  <div className="stack tight">
                    <label className="field-label" htmlFor="misc-note">
                      نص حر إضافي (اختياري)
                    </label>
                    <textarea
                      id="misc-note"
                      className="input textarea small"
                      placeholder="اكتب ملاحظة حرة للقسم المتنوع..."
                      value={suggestion}
                      onChange={(event) => setSuggestion(event.target.value)}
                    />
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </section>

        <div className="stack tight">
          <label className="field-label" htmlFor="notes">
            ملاحظات إضافية
          </label>
          <textarea
            id="notes"
            className="input textarea"
            placeholder="أضف ملاحظة قصيرة للمتابعة..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <label className="row">
          <input
            type="checkbox"
            checked={suggestAi}
            onChange={(event) => setSuggestAi(event.target.checked)}
          />
          <span>اقتراح صياغة بالذكاء الاصطناعي</span>
        </label>

        {!suggestAi ? (
          <div className="stack tight">
            <label className="field-label" htmlFor="custom-content">
              نص التغذية الراجعة
            </label>
            <textarea
              id="custom-content"
              className="input textarea"
              placeholder="اكتب النص النهائي للتغذية الراجعة..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !studentName || !subject || !selectedCategories.length}
        >
          {loading ? 'جارٍ الإرسال...' : 'إرسال التغذية الراجعة'}
        </button>
      </form>
    </section>
  );
}
