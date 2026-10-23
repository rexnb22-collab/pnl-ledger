import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ArrowDownCircle, ArrowUpCircle, ImagePlus, Pencil, Plus, TrendingDown, TrendingUp, X } from 'lucide-react';
import Modal from '../ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import { CATEGORIES, TRANSACTION_TYPES } from '../../data/defaults';
import { todayISO } from '../../lib/date';
import { formatPnL } from '../../lib/format';
import { compressImage } from '../../lib/image';

const TYPE_ICONS = { trade_profit: TrendingUp, trade_loss: TrendingDown, income: ArrowUpCircle, expense: ArrowDownCircle };
const NEW_ACCOUNT = '__new__';

function Field({ label, error, hint, children, className }) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1.5 block text-2xs font-semibold uppercase tracking-[0.08em] text-fg-muted">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-2xs text-loss">{error}</span> : hint && <span className="mt-1 block text-2xs text-fg-subtle">{hint}</span>}
    </label>
  );
}

function ScreenshotPicker({ value, onChange }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const load = async (file) => {
    if (!file) return;
    setError('');
    try {
      onChange(await compressImage(file));
    } catch (err) {
      setError(err.message);
    }
  };

  // Paste a screenshot straight from the clipboard while the modal is open.
  useEffect(() => {
    const onPaste = (e) => {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith('image/'));
      if (file) load(file);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  });

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => load(e.target.files?.[0])} />
      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-white/6 bg-black/40">
          <img src={value} alt="Trade screenshot" className="max-h-56 w-full object-contain" />
          <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary h-7 px-2 text-2xs">Replace</button>
            <button type="button" onClick={() => onChange(null)} className="btn-secondary h-7 w-7 p-0 text-loss" aria-label="Remove screenshot">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            load(e.dataTransfer.files?.[0]);
          }}
          className={clsx(
            'flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-5 text-center transition-all duration-250',
            dragging ? 'border-profit bg-profit/10' : 'border-white/6 bg-black/40 hover:border-profit/50 hover:bg-black/50',
          )}
        >
          <ImagePlus size={20} className="text-profit" />
          <span className="text-xs font-bold text-fg">Drop, paste (Ctrl+V) or click to attach a chart screenshot</span>
          <span className="text-2xs text-fg-subtle">PNG or JPG · optional</span>
        </button>
      )}
      {error && <p className="mt-1 text-2xs text-loss">{error}</p>}
    </div>
  );
}

function TransactionForm({ modal, onClose }) {
  const accounts = useAppStore((s) => s.accounts);
  const selectedAccountId = useAppStore((s) => s.selectedAccountId);
  const saveTransaction = useAppStore((s) => s.saveTransaction);
  const traders = useAppStore((s) => s.traders);
  const activeTraderId = useAppStore((s) => s.activeTraderId);
  const addAccount = useAppStore((s) => s.addAccount);
  const realAccounts = accounts.filter((a) => a.type !== 'aggregate');
  const editing = modal.tx;

  const [form, setForm] = useState(() => {
    if (editing) return { ...editing, amount: String(Math.abs(editing.amount)), notes: editing.notes ?? '', screenshot: editing.screenshot ?? null, traderId: editing.traderId || 'trader_1' };
    return {
      title: '',
      amount: '',
      type: 'trade_profit',
      date: modal.draft?.date ?? todayISO(),
      category: '',
      accountId: selectedAccountId !== 'all' ? selectedAccountId : realAccounts[0]?.id ?? NEW_ACCOUNT,
      traderId: activeTraderId || 'trader_1',
      notes: '',
      screenshot: null,
    };
  });
  const [newAccountName, setNewAccountName] = useState('');
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));
  const type = TRANSACTION_TYPES.find((t) => t.id === form.type);
  const amount = Number.parseFloat(String(form.amount).replace(/,/g, ''));
  const signed = Number.isFinite(amount) ? type.sign * amount : 0;
  const positive = type.sign > 0;

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!Number.isFinite(amount) || amount <= 0) next.amount = 'Enter an amount greater than 0';
    if (!form.date) next.date = 'Pick a date';
    if (form.accountId === NEW_ACCOUNT && !newAccountName.trim()) next.account = 'Name the new account';
    setErrors(next);
    if (Object.keys(next).length) return;

    const accountId = form.accountId === NEW_ACCOUNT ? addAccount(newAccountName.trim()) : form.accountId;
    saveTransaction({
      id: editing?.id,
      title: form.title.trim() || type.label,
      amount: Math.round(signed * 100) / 100,
      type: form.type,
      date: form.date,
      category: form.category.trim() || 'Other',
      accountId,
      traderId: form.traderId || 'trader_1',
      notes: form.notes.trim(),
      screenshot: form.screenshot,
    });
  };

  return (
    <Modal
      onClose={onClose}
      title={editing ? 'تعديل الصفقة' : 'إضافة صفقة'}
      subtitle={editing ? 'حدث تفاصيل هذا الإدخال' : 'سجل صفقة، دخل أو مصروف'}
      icon={editing ? Pencil : Plus}
      footer={
        <>
          <span className={clsx('mr-auto text-sm font-bold tabular', positive ? 'text-profit' : 'text-loss')}>
            {Number.isFinite(amount) && amount > 0 ? formatPnL(signed) : ''}
          </span>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl px-5 py-2.5 text-xs font-bold text-fg shadow hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250">
            إلغاء
          </button>
          <button type="submit" form="transaction-form" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-profit via-profit-deep to-profit-deep px-5 py-2.5 text-xs font-black text-ink-950 shadow-xl shadow-profit-glow hover:shadow-profit-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250 border border-profit/30">
            {editing ? 'حفظ التغييرات' : 'حفظ الصفقة'}
          </button>
        </>
      }
    >
      <form id="transaction-form" onSubmit={submit} className="space-y-4" noValidate>
        {/* Trader Attribution for 2-Trader Duo */}
        <div>
          <span className="mb-1.5 block text-2xs font-semibold uppercase tracking-[0.08em] text-fg-muted">
            نسبة المتداول (من دير هاد الصفقة؟)
          </span>
          <div className="grid grid-cols-2 gap-2">
            {traders.map((t) => {
              const active = form.traderId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, traderId: t.id }))}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition-all duration-250',
                    active
                      ? 'border-profit bg-profit/20 text-fg shadow-glow-profit'
                      : 'border-white/6 bg-black/40 text-fg-muted hover:border-white/12 hover:text-fg'
                  )}
                >
                  <div
                    className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-bold text-ink-950 shrink-0"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate font-bold">{t.name}</span>
                    <span className="block truncate text-[10px] text-fg-subtle">{t.role}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div role="radiogroup" aria-label="Transaction type" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRANSACTION_TYPES.map((t) => {
            const Icon = TYPE_ICONS[t.id];
            const active = form.type === t.id;
            const good = t.sign > 0;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set('type')(t.id)}
                className={clsx(
                  'flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-bold transition-all duration-250 active:scale-[0.96]',
                  active && good && 'border-profit/50 bg-profit/20 text-profit shadow-glow-profit',
                  active && !good && 'border-loss/50 bg-loss/20 text-loss shadow-glow-loss',
                  !active && 'border-white/6 bg-black/40 text-fg-muted hover:border-white/12 hover:text-fg',
                )}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="المبلغ" error={errors.amount}>
            <div className="relative">
              <span className={clsx('pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold', positive ? 'text-profit' : 'text-loss')}>
                {positive ? '+$' : '−$'}
              </span>
              <input
                data-autofocus
                inputMode="decimal"
                value={form.amount}
                onChange={set('amount')}
                placeholder="0.00"
                className={clsx('input pl-9 text-base font-semibold tabular', errors.amount && 'border-loss/60')}
              />
            </div>
          </Field>
          <Field label="التاريخ" error={errors.date}>
            <input type="date" value={form.date} onChange={set('date')} className="input [color-scheme:dark]" />
          </Field>
        </div>

        <Field label="العنوان" hint={`Leave empty to use “${type.label}”`}>
          <input value={form.title} onChange={set('title')} placeholder="e.g. NVDA breakout long, Client invoice #42" className="input" maxLength={120} />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="الفئة">
            <input value={form.category} onChange={set('category')} list="pnl-categories" placeholder="Stocks, Crypto, Sales…" className="input" maxLength={40} />
            <datalist id="pnl-categories">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Field>
          <Field label="الحساب" error={errors.account}>
            <select value={form.accountId} onChange={set('accountId')} className="input [color-scheme:dark]">
              {realAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              <option value={NEW_ACCOUNT}>+ New account…</option>
            </select>
          </Field>
        </div>

        {form.accountId === NEW_ACCOUNT && (
          <Field label="New account name">
            <input value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} placeholder="e.g. Binance, FTMO 100k, Shopify" className="input" maxLength={40} />
          </Field>
        )}

        <Field label="ملاحظات">
          <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Setup, entry/exit, lessons learned…" className="input resize-none" maxLength={2000} />
        </Field>

        <Field label="صورة الشارت">
          <ScreenshotPicker value={form.screenshot} onChange={set('screenshot')} />
        </Field>
      </form>
    </Modal>
  );
}

export default function AddTransactionModal() {
  const modal = useAppStore((s) => s.txModal);
  const close = useAppStore((s) => s.closeTransactionModal);
  if (!modal) return null;
  return <TransactionForm key={modal.key} modal={modal} onClose={close} />;
}
