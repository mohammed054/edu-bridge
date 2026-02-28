import { useEffect, useMemo, useRef, useState } from 'react';

export default function Tabs({ tabs, activeKey, onChange }) {
  const containerRef = useRef(null);
  const buttonRefs = useRef({});
  const [indicator, setIndicator] = useState({ width: 0, x: 0 });

  const activeIndex = useMemo(() => tabs.findIndex((item) => item.key === activeKey), [tabs, activeKey]);

  useEffect(() => {
    const container = containerRef.current;
    const activeButton = buttonRefs.current[activeKey];

    if (!container || !activeButton) {
      setIndicator({ width: 0, x: 0 });
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeButton.getBoundingClientRect();

    setIndicator({
      width: activeRect.width,
      x: activeRect.left - containerRect.left,
    });
  }, [activeKey, tabs]);

  return (
    <div className="relative border-b border-[var(--ht-border-subtle)]" ref={containerRef}>
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            ref={(node) => {
              buttonRefs.current[tab.key] = node;
            }}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`ht-interactive relative px-4 py-3 text-[14px] font-medium ${
              activeKey === tab.key ? 'text-[var(--ht-neutral-900)]' : 'text-[var(--ht-neutral-500)]'
            } hover:text-[var(--ht-neutral-800)] active:scale-[0.98] focus-visible:outline-none`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <span
        className="ht-tab-indicator absolute bottom-[-1px] block h-[2px] bg-[var(--ht-primary-500)]"
        style={{
          width: `${indicator.width}px`,
          transform: `translateX(${indicator.x}px)`,
          opacity: activeIndex >= 0 ? 1 : 0,
        }}
      />
    </div>
  );
}
