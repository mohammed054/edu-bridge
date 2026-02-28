import { FEEDBACK_CATEGORIES } from '../constants/feedback.js';

const FEEDBACK_TYPE_OPTIONS = [
  { value: '', label: 'كل الأنواع' },
  { value: 'teacher_feedback', label: 'تغذية راجعة من المعلم' },
  { value: 'admin_feedback', label: 'تغذية راجعة من الإدارة' },
  { value: 'student_to_teacher,student_to_admin', label: 'تغذية راجعة من الطالب' },
];

export default function FeedbackFilters({
  filters,
  options = {},
  loading,
  onChange,
  onApply,
  onReset,
}) {
  const students = options.students || [];
  const teachers = options.teachers || [];
  const classes = options.classes || [];
  const subjects = options.subjects || [];

  const submit = (event) => {
    event.preventDefault();
    onApply();
  };

  return (
    <form className="card stack" onSubmit={submit}>
      <h3 className="section-title">تصفية التعليقات</h3>

      <div className="filters-grid filters-grid-wide">
        <div className="stack tight">
          <label className="field-label" htmlFor="filter-student">
            الطالب
          </label>
          <select
            id="filter-student"
            className="input"
            value={filters.studentId || ''}
            onChange={(event) => onChange('studentId', event.target.value)}
          >
            <option value="">كل الطلاب</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        <div className="stack tight">
          <label className="field-label" htmlFor="filter-teacher">
            المعلم
          </label>
          <select
            id="filter-teacher"
            className="input"
            value={filters.teacherId || ''}
            onChange={(event) => onChange('teacherId', event.target.value)}
          >
            <option value="">كل المعلمين</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <div className="stack tight">
          <label className="field-label" htmlFor="filter-class">
            الصف
          </label>
          <select
            id="filter-class"
            className="input"
            value={filters.className || ''}
            onChange={(event) => onChange('className', event.target.value)}
          >
            <option value="">كل الصفوف</option>
            {classes.map((classItem) => (
              <option key={classItem.id || classItem.name} value={classItem.name}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div className="stack tight">
          <label className="field-label" htmlFor="filter-subject">
            المادة
          </label>
          <select
            id="filter-subject"
            className="input"
            value={filters.subject || ''}
            onChange={(event) => onChange('subject', event.target.value)}
          >
            <option value="">كل المواد</option>
            {subjects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="stack tight">
          <label className="field-label" htmlFor="filter-category">
            الفئة
          </label>
          <select
            id="filter-category"
            className="input"
            value={filters.category || ''}
            onChange={(event) => onChange('category', event.target.value)}
          >
            <option value="">كل الفئات</option>
            {FEEDBACK_CATEGORIES.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="stack tight">
          <label className="field-label" htmlFor="filter-type">
            نوع التعليق
          </label>
          <select
            id="filter-type"
            className="input"
            value={filters.feedbackType || ''}
            onChange={(event) => onChange('feedbackType', event.target.value)}
          >
            {FEEDBACK_TYPE_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="stack tight">
        <label className="field-label" htmlFor="filter-search">
          بحث (اسم الطالب/المعلم/المادة)
        </label>
        <input
          id="filter-search"
          className="input"
          value={filters.search || ''}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="اكتب كلمة للبحث..."
        />
      </div>

      <div className="row wrap">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'جارٍ التطبيق...' : 'تطبيق'}
        </button>
        <button className="btn btn-soft" type="button" onClick={onReset} disabled={loading}>
          إعادة تعيين
        </button>
      </div>
    </form>
  );
}
