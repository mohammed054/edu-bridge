import {
  ClassIcon,
  FeedbackIcon,
  StudentsIcon,
  SubjectIcon,
  SurveyIcon,
  TeacherIcon,
} from './AdminIcons';

const ICON_BY_KEY = {
  students:      StudentsIcon,
  teachers:      TeacherIcon,
  classes:       ClassIcon,
  subjects:      SubjectIcon,
  surveys:       SurveyIcon,
  feedbacks:     FeedbackIcon,
  feedbackToday: FeedbackIcon,
  homeworks:     ClassIcon,
};

export default function StatCard({ item }) {
  const Icon = ICON_BY_KEY[item.id] || ClassIcon;
  const isPositive = String(item.trendDirection || '').toLowerCase() !== 'down';

  return (
    <article
      className="rounded-xl bg-white p-5"
      style={{ border: '1px solid #E5E7EB' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {item.label}
          </p>
          <p className="text-3xl font-bold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {Number(item.value || 0).toLocaleString('en-US')}
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      {item.trend && (
        <p
          className={`mt-4 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            isPositive
              ? 'border-green-100 bg-green-50 text-green-700'
              : 'border-red-100 bg-red-50 text-red-600'
          }`}
        >
          {isPositive ? '↑' : '↓'} {item.trend}
        </p>
      )}
    </article>
  );
}
