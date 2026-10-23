import clsx from 'clsx';
import { CheckCircle2, XCircle } from 'lucide-react';

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-250',
        checked ? 'bg-profit shadow-glow-profit' : 'bg-line-strong',
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-250',
          checked ? 'left-[18px]' : 'left-0.5',
        )}
      />
    </button>
  );
}

export function SyncStatus({ status }) {
  if (!status) return null;
  return (
    <p className={clsx('flex min-w-0 items-center gap-1.5 text-2xs', status.ok ? 'text-profit' : 'text-loss')}>
      {status.ok ? <CheckCircle2 size={12} className="shrink-0" /> : <XCircle size={12} className="shrink-0" />}
      <span className="truncate" title={status.error}>
        {status.ok ? status.message : status.error}
      </span>
      <span className="shrink-0 text-fg-subtle">· {new Date(status.at).toLocaleTimeString()}</span>
    </p>
  );
}

export function Steps({ items }) {
  return (
    <ol className="space-y-2 text-xs leading-relaxed text-fg-muted">
      {items.map((step, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-px grid h-4 w-4 shrink-0 place-items-center rounded bg-surface-neutral text-[10px] font-semibold text-fg">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function UrlField({ label, value, placeholder, valid, invalidText, onChange }) {
  const filled = value.trim().length > 0;
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-2xs font-semibold uppercase tracking-wider text-fg-subtle">{label}</span>
      <input
        className={clsx('input font-mono text-xs', filled && !valid && 'border-loss/60 focus:border-loss/60 focus:ring-loss/20')}
        placeholder={placeholder}
        value={value}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
      {filled && !valid && <span className="mt-1 block text-2xs text-loss">{invalidText}</span>}
    </label>
  );
}

export function CardHeader({ icon: Icon, iconClass, title, subtitle, enabled, onToggle }) {
  return (
    <header className="flex items-start gap-3">
      <div className={clsx('grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1', iconClass)}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-fg">{title}</h2>
        <p className="mt-0.5 text-xs text-fg-muted">{subtitle}</p>
      </div>
      {onToggle && <Toggle checked={enabled} onChange={onToggle} label={`Enable ${title}`} />}
    </header>
  );
}
