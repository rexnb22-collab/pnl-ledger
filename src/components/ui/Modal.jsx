import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';

export default function Modal({ onClose, title, subtitle, icon: Icon, iconTone = 'accent', footer, size = 'md', children }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const dialogs = document.querySelectorAll('[aria-modal="true"]');
      if (dialogs[dialogs.length - 1] === panelRef.current) closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector('[data-autofocus]')?.focus());
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-ink-950/80 backdrop-blur-md" onMouseDown={() => closeRef.current()} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          'relative flex max-h-[calc(100vh-2rem)] w-full animate-scale-in flex-col overflow-hidden rounded-2xl border border-white/8 bg-black/60 backdrop-blur-3xl shadow-2xl',
          size === 'lg' ? 'max-w-2xl' : 'max-w-xl',
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-profit/50 to-transparent" />
        <header className="flex items-start gap-3 border-b border-white/6 px-5 py-4">
          {Icon && (
            <div
              className={clsx(
                'grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1',
                iconTone === 'profit' && 'bg-profit/10 text-profit ring-profit/30',
                iconTone === 'loss' && 'bg-loss/10 text-loss ring-loss/30',
                iconTone === 'accent' && 'bg-profit/10 text-profit ring-profit/30',
              )}
            >
              <Icon size={18} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-xs text-fg-muted">{subtitle}</p>}
          </div>
          <button type="button" onClick={() => closeRef.current()} className="btn-icon h-8 w-8" aria-label="Close">
            <X size={17} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-white/6 bg-black/40 backdrop-blur-2xl px-5 py-3">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
