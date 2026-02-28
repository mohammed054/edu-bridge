import {
  ClassIcon,
  FeedbackIcon,
  StudentsIcon,
  SubjectIcon,
  SurveyIcon,
  TeacherIcon,
} from './AdminIcons';

const ICON_BY_KEY = {
  students: StudentsIcon,
  teachers: TeacherIcon,
  classes: ClassIcon,
  subjects: SubjectIcon,
  surveys: SurveyIcon,
  feedbacks: FeedbackIcon,
  feedbackToday: FeedbackIcon,
};

export default function StatCard({ item }) {
  const Icon = ICON_BY_KEY[item.id] || ClassIcon;
  const isPositive = String(item.trendDirection || '').toLowerCase() !== 'down';

  return (
    <article className="panel-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="caption-premium">{item.label}</p>
          <p className="text-3xl font-bold leading-none text-text-primary">
            {Number(item.value || 0).toLocaleString('en-US')}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-card-gradient text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p
        className={`mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${
          isPositive
            ? 'border-success/25 bg-success/10 text-success'
            : 'border-danger/25 bg-danger/10 text-danger'
        }`}
      >
        {item.trend || '0%'}
      </p>
    </article>
  );
}
