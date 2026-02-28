import { FEEDBACK_CATEGORY_LABEL_BY_KEY } from '../constants/feedback.js';
import { formatDate } from '../utils/format.js';

const renderCategorySummary = (summary = {}) =>
  Object.entries(summary).map(([key, value]) => ({
    key,
    label: FEEDBACK_CATEGORY_LABEL_BY_KEY[key] || key,
    value: Number(value || 0),
  }));

export default function StudentProfileTab({
  profile,
  loading,
  subjectFilter,
  subjects = [],
  onSubjectChange,
  onRefresh,
}) {
  if (loading) {
    return (
      <section className="card">
        <p className="hint-text">جارٍ تحميل الملف الشخصي...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="card">
        <p className="hint-text">لا توجد بيانات ملف شخصي.</p>
      </section>
    );
  }

  return (
    <section className="stack">
      <section className="card stack">
        <div className="row between">
          <h3 className="section-title">الملف الشخصي للطالب</h3>
          <div className="row wrap">
            <button className="btn btn-soft" onClick={onRefresh} type="button">
              تحديث
            </button>
          </div>
        </div>
        <p className="meta-line">
          <strong>الاسم:</strong> {profile.student?.name}
        </p>
        <p className="meta-line">
          <strong>الصف:</strong> {profile.student?.classes?.join(', ') || '-'}
        </p>

        <div className="stack tight">
          <label className="field-label" htmlFor="profile-subject-filter">
            تصفية حسب المادة
          </label>
          <select
            id="profile-subject-filter"
            className="input"
            value={subjectFilter}
            onChange={(event) => onSubjectChange(event.target.value)}
          >
            <option value="">كل المواد</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="profile-stats-grid">
        <article className="metric-card">
          <h4 className="section-subtitle">أيام الغياب</h4>
          <p className="metric-value">{profile.absentDays ?? 0}</p>
        </article>
        <article className="metric-card">
          <h4 className="section-subtitle">التقارير السلبية</h4>
          <p className="metric-value">{profile.negativeReports ?? 0}</p>
        </article>
      </section>

      <details className="feedback-accordion" open>
        <summary className="feedback-summary">
          <strong>تصنيف التعليقات</strong>
        </summary>
        <div className="feedback-content">
          <div className="chips">
            {renderCategorySummary(profile.categorySummary).map((item) => (
              <span key={item.key} className="chip">
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        </div>
      </details>

      <details className="feedback-accordion" open>
        <summary className="feedback-summary">
          <strong>درجات الامتحانات</strong>
          <span className="hint-text">{profile.examMarks?.length || 0}</span>
        </summary>
        <div className="feedback-content stack">
          {!profile.examMarks?.length ? (
            <p className="hint-text">لا توجد درجات مضافة حتى الآن.</p>
          ) : (
            profile.examMarks.map((mark) => (
              <article className="exam-mark-row" key={`${mark.subject}-${mark.updatedAt}`}>
                <strong>{mark.subject}</strong>
                <span>{mark.score}</span>
                <span className="hint-text">{mark.teacherName || 'المعلم'}</span>
                <span className="hint-text">{formatDate(mark.updatedAt)}</span>
              </article>
            ))
          )}
          <p className="hint-text">{profile.marksAnalysis?.message || ''}</p>
        </div>
      </details>

      <details className="feedback-accordion" open>
        <summary className="feedback-summary">
          <strong>التعليقات المستلمة</strong>
          <span className="hint-text">{profile.feedbackReceived?.length || 0}</span>
        </summary>
        <div className="feedback-content stack">
          {!profile.feedbackReceived?.length ? (
            <p className="hint-text">لا توجد تعليقات حتى الآن.</p>
          ) : (
            profile.feedbackReceived.map((item) => (
              <details className="feedback-accordion" key={item.id}>
                <summary className="feedback-summary">
                  <div>
                    <strong>{item.subject || 'بدون مادة'}</strong>
                    <p className="hint-text compact">{item.teacherName || item.adminName || item.senderRole}</p>
                  </div>
                  <span className="hint-text">{formatDate(item.createdAt)}</span>
                </summary>
                <div className="feedback-content">
                  <p className="message-text">{item.content}</p>
                </div>
              </details>
            ))
          )}
        </div>
      </details>

      {!profile.visibility?.teacherRestricted ? (
        <details className="feedback-accordion" open>
          <summary className="feedback-summary">
            <strong>ردود الاستطلاعات</strong>
            <span className="hint-text">{profile.surveyResponses?.length || 0}</span>
          </summary>
          <div className="feedback-content stack">
            {!profile.surveyResponses?.length ? (
              <p className="hint-text">لا توجد ردود استطلاعات.</p>
            ) : (
              profile.surveyResponses.map((survey) => (
                <details key={survey.id} className="feedback-accordion">
                  <summary className="feedback-summary">
                    <strong>{survey.surveyName}</strong>
                    <span className="hint-text">{formatDate(survey.submittedAt)}</span>
                  </summary>
                  <div className="feedback-content stack">
                    {survey.answers.map((answer, index) => (
                      <p key={`${survey.id}-answer-${index}`} className="meta-line">
                        {answer.questionId}: {answer.textAnswer || (answer.selectedOptions || []).join('، ')}
                      </p>
                    ))}
                  </div>
                </details>
              ))
            )}
          </div>
        </details>
      ) : null}
    </section>
  );
}
