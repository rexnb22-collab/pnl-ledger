import { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Check,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ACCOUNT_COLORS } from '../../data/defaults';
import { formatCurrency, formatPnL } from '../../lib/format';
import Modal from '../ui/Modal';

export default function AccountsView() {
  const accounts = useAppStore((s) => s.accounts);
  const transactions = useAppStore((s) => s.transactions);
  const selectedAccountId = useAppStore((s) => s.selectedAccountId);
  const setSelectedAccount = useAppStore((s) => s.setSelectedAccount);
  const addAccount = useAppStore((s) => s.addAccount);
  const updateAccount = useAppStore((s) => s.updateAccount);
  const deleteAccount = useAppStore((s) => s.deleteAccount);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccountId, setDeletingAccountId] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Trading');
  const [formColor, setFormColor] = useState(ACCOUNT_COLORS[0]);

  // Compute metrics per account
  const accountStats = useMemo(() => {
    const stats = {};
    for (const a of accounts) {
      stats[a.id] = { net: 0, trades: 0, wins: 0, losses: 0 };
    }

    for (const t of transactions) {
      if (stats[t.accountId]) {
        stats[t.accountId].net += t.amount;
        stats[t.accountId].trades += 1;
        if (t.amount > 0) stats[t.accountId].wins += 1;
        else if (t.amount < 0) stats[t.accountId].losses += 1;
      }
      // Also update 'all'
      if (stats['all']) {
        stats['all'].net += t.amount;
        stats['all'].trades += 1;
        if (t.amount > 0) stats['all'].wins += 1;
        else if (t.amount < 0) stats['all'].losses += 1;
      }
    }
    return stats;
  }, [accounts, transactions]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormType('Trading');
    setFormColor(ACCOUNT_COLORS[(accounts.length - 1) % ACCOUNT_COLORS.length]);
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const newId = addAccount(formName.trim(), formType);
    if (formColor) {
      updateAccount(newId, { color: formColor });
    }
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setFormName(acc.name);
    setFormType(acc.type || 'Trading');
    setFormColor(acc.color || ACCOUNT_COLORS[0]);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !editingAccount) return;
    updateAccount(editingAccount.id, {
      name: formName.trim(),
      type: formType,
      color: formColor,
    });
    setEditingAccount(null);
  };

  const handleConfirmDelete = () => {
    if (deletingAccountId) {
      deleteAccount(deletingAccountId);
      setDeletingAccountId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-base font-bold text-fg">حسابات التداول والدفتر</h2>
          <p className="text-xs text-fg-muted">
            تتبع المحافظ الفردية، حسابات شركات التمويل، محافظ العملات الرقمية، أو الكيانات التجارية.
          </p>
        </div>
        <button type="button" onClick={handleOpenAdd} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-profit via-profit-deep to-profit-deep px-5 py-2.5 text-xs font-black text-ink-950 shadow-xl shadow-profit-glow hover:shadow-profit-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250 border border-profit/30">
          <Plus size={16} strokeWidth={3} /> أضف حساب
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((acc) => {
          const isSelected = selectedAccountId === acc.id;
          const stat = accountStats[acc.id] || { net: 0, trades: 0, wins: 0, losses: 0 };
          const winRate = stat.trades ? Math.round((stat.wins / stat.trades) * 100) : 0;
          const isAggregate = acc.id === 'all';
          const isPositive = stat.net >= 0;

          return (
            <div
              key={acc.id}
              className={`card relative p-5 transition-all duration-200 ${
                isSelected
                  ? 'border-accent/60 bg-surface-raised shadow-glow-accent'
                  : 'hover:border-line-strong hover:bg-surface-hover'
              }`}
            >
              {/* Card top */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-xl font-bold text-ink-950"
                    style={{ backgroundColor: acc.color || '#06B6D4' }}
                  >
                    {isAggregate ? <Building2 size={20} /> : <Wallet size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-fg text-sm">{acc.name}</h3>
                    <span className="text-2xs text-fg-muted uppercase tracking-wider">
                      {acc.type || 'Account'}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="badge badge-accent">
                    <Check size={12} /> نشط
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedAccount(acc.id)}
                    className="btn-secondary h-7 px-2.5 text-2xs"
                  >
                    اختر
                  </button>
                )}
              </div>

              {/* Stats row */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line/60 pt-4">
                <div>
                  <span className="text-2xs text-fg-subtle uppercase">صافي الربح والخسارة</span>
                  <p className={`mt-0.5 text-sm font-bold tabular ${isPositive ? 'text-profit' : 'text-loss'}`}>
                    {formatPnL(stat.net)}
                  </p>
                </div>
                <div>
                  <span className="text-2xs text-fg-subtle uppercase">الصفقات</span>
                  <p className="mt-0.5 text-sm font-bold tabular text-fg">
                    {stat.trades}
                  </p>
                </div>
                <div>
                  <span className="text-2xs text-fg-subtle uppercase">نسبة الربح</span>
                  <p className="mt-0.5 text-sm font-bold tabular text-fg">
                    {winRate}%
                  </p>
                </div>
              </div>

              {/* Footer actions */}
              {!isAggregate && (
                <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-line/40 pt-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(acc)}
                    className="btn-ghost h-7 px-2 text-2xs flex items-center gap-1 text-fg-muted hover:text-fg"
                  >
                    <Pencil size={12} /> تعديل
                  </button>
                  {accounts.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setDeletingAccountId(acc.id)}
                      className="btn-ghost h-7 px-2 text-2xs flex items-center gap-1 text-loss hover:bg-loss-deep/20"
                    >
                      <Trash2 size={12} /> حذف
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <Modal
          onClose={() => setIsAddModalOpen(false)}
          title="إنشاء حساب تداول جديد"
          subtitle="أضف حساب مخصص لعزل وتتبع استراتيجيات تداول محددة"
          icon={Wallet}
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl px-5 py-2.5 text-xs font-bold text-fg shadow hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="add-account-form"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-profit via-profit-deep to-profit-deep px-5 py-2.5 text-xs font-black text-ink-950 shadow-xl shadow-profit-glow hover:shadow-profit-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250 border border-profit/30"
              >
                إنشاء الحساب
              </button>
            </>
          }
        >
          <form id="add-account-form" onSubmit={handleSaveAdd} className="space-y-4">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-fg-muted mb-1.5">
                اسم الحساب
              </label>
              <input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: Apex 50k Funded, Binance Scalping, Swing Trading"
                className="input"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-fg-muted mb-1.5">
                نوع الحساب
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="input"
              >
                <option value="Trading">تداول</option>
                <option value="Prop Firm">شركة تمويل ممولة</option>
                <option value="Crypto">عملات رقمية (سبوت & فيوتشرز)</option>
                <option value="Forex">فوركس</option>
                <option value="Options">أوبشنز</option>
                <option value="Freelance">عمل حر / تجارة</option>
                <option value="Other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-fg-muted mb-2">
                ثيم الألوان
              </label>
              <div className="flex items-center gap-2">
                {ACCOUNT_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setFormColor(col)}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      formColor === col ? 'ring-2 ring-fg ring-offset-2 ring-offset-ink-950 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <Modal
          onClose={() => setEditingAccount(null)}
          title={`تعديل الحساب: ${editingAccount.name}`}
          subtitle="تحديث إعدادات الحساب والتسمية"
          icon={Pencil}
          footer={
            <>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl px-5 py-2.5 text-xs font-bold text-fg shadow hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="edit-account-form"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-profit via-profit-deep to-profit-deep px-5 py-2.5 text-xs font-black text-ink-950 shadow-xl shadow-profit-glow hover:shadow-profit-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250 border border-profit/30"
              >
                حفظ التغييرات
              </button>
            </>
          }
        >
          <form id="edit-account-form" onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-fg-muted mb-1.5">
                اسم الحساب
              </label>
              <input
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-fg-muted mb-1.5">
                نوع الحساب
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="input"
              >
                <option value="Trading">تداول</option>
                <option value="Prop Firm">شركة تمويل ممولة</option>
                <option value="Crypto">عملات رقمية (سبوت & فيوتشرز)</option>
                <option value="Forex">فوركس</option>
                <option value="Options">أوبشنز</option>
                <option value="Freelance">عمل حر / تجارة</option>
                <option value="Other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-fg-muted mb-2">
                ثيم الألوان
              </label>
              <div className="flex items-center gap-2">
                {ACCOUNT_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setFormColor(col)}
                    className={`h-8 w-8 rounded-full transition-transform ${
                      formColor === col ? 'ring-2 ring-fg ring-offset-2 ring-offset-ink-950 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAccountId && (
        <Modal
          onClose={() => setDeletingAccountId(null)}
          title="حذف الحساب؟"
          subtitle="جميع الصفقات المرتبطة بهذا الحساب ستتم إزالتها بشكل دائم."
          icon={Trash2}
          footer={
            <>
              <button
                type="button"
                onClick={() => setDeletingAccountId(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl px-5 py-2.5 text-xs font-bold text-fg shadow hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-loss via-loss-deep to-loss-deep px-5 py-2.5 text-xs font-black text-white shadow-xl shadow-loss-glow hover:shadow-loss-glow hover:-translate-y-0.5 active:translate-y-0 active:scale-96 transition-all duration-250 border border-loss/30"
              >
                حذف الحساب والبيانات
              </button>
            </>
          }
        >
          <p className="text-sm text-fg-muted">
            هل أنت متأكد أنك تريد حذف حساب التداول هذا؟ هذه العملية لا يمكن التراجع عنها.
          </p>
        </Modal>
      )}
    </div>
  );
}
