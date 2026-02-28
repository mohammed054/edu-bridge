export default function Tabs({ tabs = [], activeKey, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-slate-50 border border-border rounded-sm mb-5">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab.key)}
            className={`flex-1 py-2 px-3 rounded-[6px] text-[13px] font-semibold premium-transition focus-ring
              ${isActive
                ? 'bg-surface text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
