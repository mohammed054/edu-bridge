import { useMemo, useState } from 'react';

const buildEmptyAnswer = (question) =>
  question.type === 'multiple'
    ? { questionId: question.questionId, selectedOptions: [], textAnswer: '' }
    : { questionId: question.questionId, textAnswer: '', selectedOptions: [] };

export default function SurveyResponsePanel({ surveys = [], loading, onRefresh, onSubmit }) {
  const [drafts, setDrafts] = useState({});

  const initializedDrafts = useMemo(() => {
    const output = {};
    surveys.forEach((survey) => {
      output[survey.id] =
        drafts[survey.id] ||
        (survey.myResponse?.answers?.length
          ? survey.myResponse.answers
          : (survey.questions || []).map(buildEmptyAnswer));
    });
    return output;
  }, [drafts, surveys]);

  const updateTextAnswer = (surveyId, questionId, value) => {
    setDrafts((current) => ({
      ...current,
      [surveyId]: (initializedDrafts[surveyId] || []).map((answer) =>
        answer.questionId === questionId ? { ...answer, textAnswer: value } : answer
      ),
    }));
  };

  const toggleOption = (surveyId, questionId, option) => {
    setDrafts((current) => ({
      ...current,
      [surveyId]: (initializedDrafts[surveyId] || []).map((answer) => {
        if (answer.questionId !== questionId) {
          return answer;
        }
        const selectedOptions = answer.selectedOptions || [];
        return {
          ...answer,
          selectedOptions: selectedOptions.includes(option)
            ? selectedOptions.filter((item) => item !== option)
            : [...selectedOptions, option],
        };
      }),
    }));
  };

  const submitSurvey = async (surveyId) => {
    const answers = initializedDrafts[surveyId] || [];
    await onSubmit(surveyId, { answers });
  };

  return (
    <section className="card stack">
      <div className="row between">
        <h3 className="section-title">الاستطلاعات</h3>
        <button className="btn btn-soft" type="button" onClick={onRefresh} disabled={loading}>
          تحديث
        </button>
      </div>

      {loading ? <p className="hint-text">جارٍ تحميل الاستطلاعات...</p> : null}
      {!loading && !surveys.length ? <p className="hint-text">لا توجد استطلاعات مخصصة لك.</p> : null}

      {!loading &&
        surveys.map((survey) => (
          <details className="feedback-accordion" key={survey.id} open>
            <summary className="feedback-summary">
              <strong>{survey.name}</strong>
              <span className="hint-text">{survey.myResponse ? 'تمت الإجابة' : 'بانتظار الإجابة'}</span>
            </summary>
            <div className="feedback-content stack">
              <p className="hint-text">{survey.description || 'بدون وصف'}</p>

              {(survey.questions || []).map((question) => {
                const answer = (initializedDrafts[survey.id] || []).find(
                  (item) => item.questionId === question.questionId
                );

                return (
                  <article className="admin-item stack" key={`${survey.id}-${question.questionId}`}>
                    <strong>{question.prompt}</strong>
                    {question.type === 'multiple' ? (
                      <div className="chips">
                        {(question.options || []).map((option) => (
                          <label className="tag-item" key={`${question.questionId}-${option}`}>
                            <input
                              type="checkbox"
                              checked={(answer?.selectedOptions || []).includes(option)}
                              onChange={() => toggleOption(survey.id, question.questionId, option)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="input textarea small"
                        value={answer?.textAnswer || ''}
                        onChange={(event) =>
                          updateTextAnswer(survey.id, question.questionId, event.target.value)
                        }
                        placeholder="اكتب إجابتك..."
                      />
                    )}
                  </article>
                );
              })}

              <button className="btn btn-primary" type="button" onClick={() => submitSurvey(survey.id)}>
                حفظ الرد
              </button>
            </div>
          </details>
        ))}
    </section>
  );
}
