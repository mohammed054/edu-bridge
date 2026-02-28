import { formatNumber } from '../utils/format.js';

export default function SubjectTile({ subject, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(subject)}
      className="focus-ring group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-right shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-panel"
    >
      <div className="h-36 overflow-hidden bg-slate-100">
        <img
          src={subject.imageUrl}
          alt={`صورة مادة ${subject.name}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-base font-bold text-slate-900">{subject.name}</h3>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>عدد الرسائل</span>
          <span className="font-semibold text-slate-800">{formatNumber(subject.notificationsCount || 0)}</span>
        </div>
      </div>
    </button>
  );
}
