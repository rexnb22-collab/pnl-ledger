import { useState } from 'react';
import clsx from 'clsx';
import {
  CalendarDays,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  StickyNote,
  Trash2,
  Users,
} from 'lucide-react';
import Modal from '../ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import { TRANSACTION_TYPES } from '../../data/defaults';
import { formatLongDate } from '../../lib/date';
import { formatPnL } from '../../lib/format';

const TYPE_LABELS = Object.fromEntries(TRANSACTION_TYPES.map((t) => [t.id, t.label]));

function TransactionRow({ tx, account, traders, activeTrader, onEdit, onDelete, onAddComment }) {
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');

  const positive = tx.amount >= 0;
  const trader = traders.find((t) => t.id === tx.traderId) || traders[0];
  const partner = traders.find((t) => t.id !== tx.traderId) || traders[1];

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const authorName = activeTrader?.name || 'Partner';
    onAddComment(tx.id, `${authorName}: ${commentText.trim()}`);
    setCommentText('');
    setCommenting(false);
  };

  const handleQuickReaction = (emoji, label) => {
    const authorName = activeTrader?.name || 'Partner';
    onAddComment(tx.id, `${authorName}: ${emoji} ${label}`);
  };

  return (
    <li className={clsx('rounded-lg border p-3.5 transition-colors', positive ? 'border-profit/20 bg-profit-deep/10' : 'border-loss/20 bg-loss-deep/10')}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-ink-950 shadow-sm"
              style={{ backgroundColor: trader?.color || '#22C55E' }}
            >
              {trader?.avatar || 'T1'}
            </span>
            <p className="truncate text-sm font-semibold text-fg">{tx.title}</p>
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-2xs text-fg-subtle">
            <span className="font-medium text-fg-muted">{trader?.name || 'Trader'}</span>
            <span>·</span>
            <span className={positive ? 'text-profit/90 font-medium' : 'text-loss/90 font-medium'}>
              {TYPE_LABELS[tx.type] ?? (positive ? 'Profit' : 'Loss')}
            </span>
            <span>·</span>
            <span>{tx.category}</span>
            {account && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: account.color }} /> {account.name}
                </span>
              </>
            )}
          </p>
        </div>
        <p className={clsx('shrink-0 text-sm font-bold tabular', positive ? 'text-profit' : 'text-loss')}>{formatPnL(tx.amount)}</p>
      </div>

      {tx.notes && (
        <p className="mt-2.5 flex gap-1.5 whitespace-pre-wrap text-xs text-fg-muted bg-ink-950/40 p-2 rounded border border-line/40">
          <StickyNote size={13} className="mt-px shrink-0 text-fg-subtle" />
          <span>{tx.notes}</span>
        </p>
      )}

      {/* Partner Trade Sharing Note */}
      {tx.partnerNotes && (
        <div className="mt-2 rounded-md border border-accent/30 bg-accent-deep/15 p-2 text-2xs text-accent flex items-start gap-1.5">
          <MessageSquare size={13} className="shrink-0 mt-0.5 text-accent" />
          <span className="font-medium">{tx.partnerNotes}</span>
        </div>
      )}

      {tx.screenshot && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-2 block w-full overflow-hidden rounded-md border border-line bg-ink-900" aria-label={expanded ? 'Collapse screenshot' : 'Expand screenshot'}>
          <img src={tx.screenshot} alt={`${tx.title} screenshot`} className={clsx('w-full object-contain transition-all', expanded ? 'max-h-[60vh]' : 'max-h-28 object-cover')} />
        </button>
      )}

      {/* Quick Partner Feedback / Reactions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/40 pt-2 text-2xs">
        <div className="flex items-center gap-1 text-fg-subtle">
          <span>Feedback:</span>
          <button
            type="button"
            onClick={() => handleQuickReaction('🔥', 'Great Discipline')}
            className="hover:bg-surface-raised px-1.5 py-0.5 rounded text-[11px] transition-colors"
            title="React: Great discipline"
          >
            🔥
          </button>
          <button
            type="button"
            onClick={() => handleQuickReaction('👏', 'Solid TP')}
            className="hover:bg-surface-raised px-1.5 py-0.5 rounded text-[11px] transition-colors"
            title="React: Solid target hit"
          >
            👏
          </button>
          <button
            type="button"
            onClick={() => handleQuickReaction('⚠️', 'Good stop cut')}
            className="hover:bg-surface-raised px-1.5 py-0.5 rounded text-[11px] transition-colors"
            title="React: Good stop adherence"
          >
            ⚠️
          </button>
          <button
            type="button"
            onClick={() => setCommenting(!commenting)}
            className="text-accent hover:underline ml-1"
          >
            {commenting ? 'Cancel' : '+ Partner Note'}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {confirming ? (
            <>
              <span className="text-2xs text-loss">Delete trade?</span>
              <button type="button" onClick={() => setConfirming(false)} className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-gradient-to-br from-surface-raised to-surface-hover px-3 py-1.5 text-2xs font-bold text-fg shadow hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200">Cancel</button>
              <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1.5 text-2xs font-black text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200">
                Delete
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onEdit} className="btn-ghost h-6 px-1.5 text-2xs">
                <Pencil size={11} /> Edit
              </button>
              <button type="button" onClick={() => setConfirming(true)} className="btn-ghost h-6 px-1.5 text-2xs hover:text-loss">
                <Trash2 size={11} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {commenting && (
        <form onSubmit={handlePostComment} className="mt-2 flex gap-1.5 animate-fade-in">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Leave note as ${activeTrader?.name || 'Partner'}…`}
            className="input h-7 py-1 text-2xs"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-3 py-1.5 text-2xs font-black text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 shrink-0">
            <Send size={11} />
          </button>
        </form>
      )}
    </li>
  );
}

export default function DayDetailsModal() {
  const iso = useAppStore((s) => s.dayDetails);
  const transactions = useAppStore((s) => s.transactions);
  const accounts = useAppStore((s) => s.accounts);
  const selectedAccountId = useAppStore((s) => s.selectedAccountId);
  const selectedTraderId = useAppStore((s) => s.selectedTraderId);
  const traders = useAppStore((s) => s.traders);
  const activeTraderId = useAppStore((s) => s.activeTraderId);
  const close = useAppStore((s) => s.closeDayDetails);
  const openAddTransaction = useAppStore((s) => s.openAddTransaction);
  const openEditTransaction = useAppStore((s) => s.openEditTransaction);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const addTradeComment = useAppStore((s) => s.addTradeComment);

  if (!iso) return null;

  const activeTraderObj = traders.find((t) => t.id === activeTraderId) || traders[0];

  const items = transactions
    .filter((t) => {
      if (t.date !== iso) return false;
      if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId) return false;
      if (selectedTraderId !== 'all' && (t.traderId || 'trader_1') !== selectedTraderId) return false;
      return true;
    })
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

  const net = Math.round(items.reduce((sum, t) => sum + t.amount, 0) * 100) / 100;
  const wins = items.filter((t) => t.amount > 0).length;
  const accountById = Object.fromEntries(accounts.map((a) => [a.id, a]));

  return (
    <Modal
      onClose={close}
      title={formatLongDate(iso)}
      subtitle={items.length ? `${items.length} ${items.length === 1 ? 'trade' : 'trades'} · ${wins} winning · 2-Trader Shared Ledger` : 'No trades recorded'}
      icon={CalendarDays}
      iconTone={!items.length ? 'accent' : net >= 0 ? 'profit' : 'loss'}
      footer={
        <>
          {items.length > 0 && (
            <span className={clsx('mr-auto text-sm font-bold tabular', net >= 0 ? 'text-profit text-glow-profit' : 'text-loss text-glow-loss')}>
              Net {formatPnL(net)}
            </span>
          )}
          <button type="button" onClick={close} className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-gradient-to-br from-surface-raised to-surface-hover px-5 py-2.5 text-xs font-bold text-fg shadow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200">
            Close
          </button>
          <button type="button" data-autofocus onClick={() => openAddTransaction({ date: iso })} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200">
            <Plus size={16} strokeWidth={3} /> Add trade
          </button>
        </>
      }
    >
      {items.length ? (
        <ul className="space-y-2.5">
          {items.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              account={accountById[tx.accountId]}
              traders={traders}
              activeTrader={activeTraderObj}
              onEdit={() => openEditTransaction(tx)}
              onDelete={() => deleteTransaction(tx.id)}
              onAddComment={addTradeComment}
            />
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-sm text-fg-muted">Nothing on this day yet. Use “Add trade” to record one.</p>
      )}
    </Modal>
  );
}
