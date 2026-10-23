import { Target } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CardHeader } from './controls';
import DiscordCard from './DiscordCard';
import SheetsCard from './SheetsCard';

function GoalCard() {
  const monthlyGoal = useAppStore((s) => s.monthlyGoal);
  const setMonthlyGoal = useAppStore((s) => s.setMonthlyGoal);
  return (
    <section className="card p-5">
      <CardHeader
        icon={Target}
        iconClass="bg-profit/10 text-profit ring-profit/30"
        title="الهدف الشهري"
        subtitle="صافي الربح والخسارة الهدف المعرض في تقدم الهدف"
      />
      <label className="mt-4 block max-w-xs">
        <span className="mb-1.5 block text-2xs font-bold uppercase tracking-wider text-fg-subtle">المبلغ (دولار أمريكي)</span>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-subtle">$</span>
          <input
            type="number"
            min="1"
            step="100"
            className="input pl-7 tabular"
            defaultValue={monthlyGoal}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v > 0) setMonthlyGoal(v);
            }}
          />
        </div>
      </label>
    </section>
  );
}

export default function SettingsView() {
  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h2 className="text-base font-semibold text-fg">الدمج مع خدمات خارجية</h2>
        <p className="mt-0.5 text-xs text-fg-muted">
          أرسل صفقاتك إلى Discord و Google Sheets تلقائياً. دفترك دائماً على هذا الكمبيوتر.
        </p>
      </div>
      <div className="grid gap-4 2xl:grid-cols-2">
        <DiscordCard />
        <SheetsCard />
      </div>
      <GoalCard />
    </div>
  );
}
