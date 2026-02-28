const ACCENTS = ['#2C7BE5','#00C853','#FFB300','#D32F2F','#8B5CF6','#F97316','#14B8A6','#EC4899'];

export default function SubjectCard({ subject, onClick, index = 0 }) {
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <button
      type="button"
      onClick={onClick}
      className="subject-card rounded-md border border-border bg-surface text-right overflow-hidden focus-ring pressable group w-44 flex-shrink-0"
    >
      <div className="h-1 w-full" style={{ background: accent }} />
      <div className="flex items-center justify-center py-5 bg-slate-50">
        <img
          src={subject.image}
          alt={subject.name}
          className="w-20 h-20 object-contain group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="px-3 py-3 border-t border-border">
        <p className="text-[13px] font-semibold text-text-primary leading-snug truncate">{subject.name}</p>
        <p className="text-[11px] text-text-secondary mt-0.5 truncate">{subject.teacher}</p>
        <p className="mt-2 text-[11px] font-semibold" style={{ color: accent }}>عرض المادة →</p>
      </div>
    </button>
  );
}
