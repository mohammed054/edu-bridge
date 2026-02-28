function CountBars({ title, rows = [], valueKey = 'total' }) {
  const max = Math.max(1, ...rows.map((item) => item[valueKey] || 0));

  return (
    <section className="card stack">
      <h4 className="section-subtitle">{title}</h4>
      {!rows.length ? (
        <p className="hint-text">لا توجد بيانات.</p>
      ) : (
        rows.map((row, index) => {
          const value = Number(row[valueKey] || 0);
          return (
            <article className="bar-row" key={row.id || row.className || index}>
              <div className="row between">
                <span>{row.name || row.className || 'غير محدد'}</span>
                <strong>{value}</strong>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}

export default function AdminReportsPanel({ reports, loading, onRefresh, onExport }) {
  if (loading) {
    return (
      <section className="card">
        <p className="hint-text">جارٍ تحميل التقارير...</p>
      </section>
    );
  }

  if (!reports) {
    return (
      <section className="card">
        <p className="hint-text">لا توجد بيانات تقارير متاحة.</p>
      </section>
    );
  }

  const categoryRows = [
    { id: 'academic', name: 'أكاديمي', total: reports.categoryBreakdown?.academic || 0 },
    { id: 'behavior', name: 'السلوك / الأخلاق', total: reports.categoryBreakdown?.behavior || 0 },
    { id: 'misc', name: 'أخرى / متنوعة', total: reports.categoryBreakdown?.misc || 0 },
  ];

  return (
    <section className="stack">
      <section className="card stack">
        <div className="row between">
          <h3 className="section-title">تقارير الإدارة</h3>
          <div className="row wrap">
            <button className="btn btn-soft" onClick={onRefresh} type="button">
              تحديث
            </button>
            <button className="btn btn-soft" onClick={onExport} type="button">
              تصدير JSON
            </button>
          </div>
        </div>

        <div className="profile-stats-grid">
          <article className="metric-card">
            <h4 className="section-subtitle">الصفوف</h4>
            <p className="metric-value">{reports.totals?.classes || 0}</p>
          </article>
          <article className="metric-card">
            <h4 className="section-subtitle">المعلمون</h4>
            <p className="metric-value">{reports.totals?.teachers || 0}</p>
          </article>
          <article className="metric-card">
            <h4 className="section-subtitle">الطلاب</h4>
            <p className="metric-value">{reports.totals?.students || 0}</p>
          </article>
          <article className="metric-card">
            <h4 className="section-subtitle">إجمالي التعليقات</h4>
            <p className="metric-value">{reports.totals?.feedbacks || 0}</p>
          </article>
        </div>
      </section>

      <div className="reports-grid">
        <CountBars title="إجمالي التعليقات لكل طالب" rows={reports.feedbackTotalsByStudent || []} />
        <CountBars title="إجمالي التعليقات لكل معلم" rows={reports.feedbackTotalsByTeacher || []} />
        <CountBars title="إجمالي التعليقات لكل صف" rows={reports.feedbackTotalsByClass || []} />
        <CountBars title="تقسيم الفئات" rows={categoryRows} />
      </div>

      <section className="card stack">
        <h4 className="section-subtitle">أيام الغياب والتقارير السلبية</h4>
        {!reports.attendanceAndBehaviorByStudent?.length ? (
          <p className="hint-text">لا توجد بيانات حضور وسلوك.</p>
        ) : (
          reports.attendanceAndBehaviorByStudent.map((item) => (
            <article key={item.id} className="admin-item">
              <div>
                <strong>{item.name}</strong>
                <p className="hint-text">{item.classes?.join(', ') || '-'}</p>
              </div>
              <div className="row wrap">
                <span className="chip">الغياب: {item.absentDays}</span>
                <span className="chip">السلبية: {item.negativeReports}</span>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="card stack">
        <h4 className="section-subtitle">ملخص درجات الامتحانات حسب الصف</h4>
        {!reports.examSummaryByClass?.length ? (
          <p className="hint-text">لا توجد درجات امتحانات مسجلة.</p>
        ) : (
          reports.examSummaryByClass.map((item) => (
            <details className="feedback-accordion" key={item.className}>
              <summary className="feedback-summary">
                <strong>{item.className}</strong>
                <span className="hint-text">
                  المتوسط: {item.averageScore} • عدد الدرجات: {item.marksCount}
                </span>
              </summary>
              <div className="feedback-content stack">
                {(item.subjectSummary || []).map((subject) => (
                  <article className="admin-item" key={`${item.className}-${subject.subject}`}>
                    <strong>{subject.subject}</strong>
                    <span className="chip">المتوسط: {subject.averageScore}</span>
                    <span className="chip">عدد السجلات: {subject.count}</span>
                  </article>
                ))}
              </div>
            </details>
          ))
        )}
      </section>

      <section className="card stack">
        <h4 className="section-subtitle">الاستطلاعات</h4>
        {!reports.surveys?.length ? (
          <p className="hint-text">لا توجد استطلاعات.</p>
        ) : (
          reports.surveys.map((survey) => (
            <article className="admin-item" key={survey.id}>
              <div>
                <strong>{survey.name}</strong>
                <p className="hint-text">{survey.description || 'بدون وصف'}</p>
              </div>
              <div className="row wrap">
                <span className="chip">{survey.isActive ? 'نشط' : 'متوقف'}</span>
                <span className="chip">الردود: {survey.totalResponses || 0}</span>
              </div>
            </article>
          ))
        )}
      </section>
    </section>
  );
}
