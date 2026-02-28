export default function EmptyState({ title, description, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center rounded-md bg-slate-50 border border-border ${compact ? 'py-8 px-6' : 'py-14 px-6'}`}>
      <div className="w-10 h-10 rounded-full bg-border mb-3" />
      <p className="text-[15px] font-semibold text-text-primary">{title}</p>
      {description && <p className="mt-1 text-[13px] text-text-secondary max-w-[260px]">{description}</p>}
    </div>
  );
}
