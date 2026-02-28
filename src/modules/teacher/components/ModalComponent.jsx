import { useEffect } from 'react';

const sizeClassMap = {
  sm: 'max-w-[440px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[920px]',
};

export default function ModalComponent({
  open,
  title,
  description,
  onClose,
  footer,
  size = 'md',
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="ht-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`ht-modal-panel w-full ${sizeClassMap[size] || sizeClassMap.md}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--ht-border-subtle)] px-6 py-5">
          <div>
            <h3 className="text-[20px] font-semibold leading-[1.5] text-[var(--ht-neutral-900)]">{title}</h3>
            {description ? (
              <p className="mt-1 text-[13px] leading-[1.7] text-[var(--ht-neutral-500)]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="ht-interactive inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-[var(--ht-border-subtle)] text-[var(--ht-neutral-500)] hover:bg-[var(--ht-bg-subtle)] hover:text-[var(--ht-neutral-800)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ht-border-focus)] focus-visible:ring-offset-2"
          >
            ×
          </button>
        </header>

        <div className="px-6 py-5">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-start gap-3 border-t border-[var(--ht-border-subtle)] px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
