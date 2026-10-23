import { useState } from 'react';
import {
  Headset,
  Send,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Github,
  Mail,
  Shield,
} from 'lucide-react';

const FAQS = [
  {
    q: 'وين مخزن بيانات دفتر التداول ديالي؟',
    a: 'في النسخة الويب، كاع الحسابات ديالك، الصفقات، الملاحظات، والأهداف مخزنات خصوصي في التخزين المحلي ديال المتصفح. في نسخة ويندوز الديسكتوب، البيانات محفوظة في APPDATA. صففة ديالك ما تتصلحش لأي سيرفر بعيد بدون إعداد الويبوك ديالك.',
  },
  {
    q: 'كاش كتخدم المزامنة مع Google Sheets؟',
    a: 'روح للإعدادات ثم Google Sheets. تقدر تنسخ سكريبت Google Apps Script ديالنا وتلصقه في Google Sheet ديالك. بعد ما ت deploy كـ web app، اللصق الرابط ديال web app في PnL Ledger. كل صفقة جديدة، معدلة، أو محذوفة غادي تتزامن تلقائياً مع جداولك بالوقت الحقيقي!',
  },
  {
    q: 'كاش كتخدم إشعارات Discord Webhook؟',
    a: 'في Discord، فتح إعدادات السيرفر أو القناة ثم Integrations ثم Webhooks، وانشئ webhook جديد. انسخ الرابط ديالو والصقه في الإعدادات ثم Discord في PnL Ledger. غادي تتلقى إشعارات غنية كل مرة تصفح صفقة بربح أو خسارة.',
  },
  {
    q: 'تقدر نسجل كثر من صفقة أو مزج الصفقات مع مصاريف الأعمال في نفس اليوم؟',
    a: 'آه! PnL Ledger كيسمح بعدد غير محدود ديال الإدخالات في اليوم. تقدر تسجل أرباح الصفقات، خسائر الصفقات، الدخل، والمصاريف. خلية اليوم في التقويم كتعرض المجموع الصافي وكتوفر شدة التحرك.',
  },
  {
    q: 'كاش نربط صور الشارت بالصفقات؟',
    a: 'لما كتخلق أو كتعدل صفقة، بس لصق صورة مباشرة من الحافظة ديالك أو سحب وأفل ملف صورة في منطقة إسقاط الصور.',
  },
];

export default function ContactView() {
  const [form, setForm] = useState({ name: '', email: '', category: 'Feedback', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSubmitted(true);
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="border-b border-line pb-4">
        <h2 className="text-base font-semibold text-fg">الدعم والمجتمع</h2>
        <p className="text-xs text-fg-muted">
          خلى المساعدة مع دفترك، أبلغ عن أخطاء، اقترح ميزات، أو تصفح الأسئلة المتكررة.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contact Form */}
        <div className="card p-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-line/60">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
              <Headset size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">أرسل رسالة</h3>
              <p className="text-2xs text-fg-muted">نرد عادة خلال 24 ساعة</p>
            </div>
          </div>

          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-profit-deep/30 text-profit ring-1 ring-profit/30">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-sm font-bold text-fg">تم استلام الرسالة!</h4>
              <p className="text-xs text-fg-muted max-w-xs mx-auto">
                شكراً على ملاحظاتك. نقدر مساهمتك في تحسين PnL Ledger.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: '', email: '', category: 'Feedback', message: '' });
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-gradient-to-br from-surface-raised to-surface-hover px-5 py-2.5 text-xs font-bold text-fg shadow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 mt-2"
              >
                أرسل رسالة أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-fg-muted mb-1">
                  اسمك
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: Alex Trader"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-fg-muted mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@domain.com"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-fg-muted mb-1">
                  الموضوع
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input text-xs"
                >
                  <option value="Feedback">ملاحظات عامة</option>
                  <option value="Bug">أبلغ عن خطأ</option>
                  <option value="Feature">طلب ميزة</option>
                  <option value="Integration">مساعدة Google Sheets / Discord</option>
                  <option value="Other">آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-fg-muted mb-1">
                  الرسالة
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="خبرنا شنو كاعجبك أو شنو نقدرو نحسنو..."
                  className="input text-xs resize-none"
                />
              </div>

              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 w-full">
                <Send size={16} strokeWidth={3} /> إرسال الرسالة
              </button>
            </form>
          )}
        </div>

        {/* Community & Quick Links */}
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-fg">القنوات المباشرة</h3>
            <p className="text-xs text-fg-muted">
              تواصل مع المتداولين الآخرين واعرض تحديثات المطورين.
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="https://github.com/rexnb1/pnl-ledger-desktop"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary w-full justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Github size={16} />
                  <span>مستودع GitHub</span>
                </div>
                <ExternalLink size={14} className="text-fg-subtle" />
              </a>

              <div className="rounded-lg border border-line bg-ink-900/60 p-3 text-xs text-fg-muted flex items-start gap-2.5">
                <Shield size={16} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <strong className="text-fg">100% الخصوصية أولاً</strong>
                  <p className="mt-0.5 text-2xs text-fg-subtle">
                    أرقامك المالية وصور الصفقات تقدرو على جهازك فقط.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="card p-5 space-y-2">
            <h3 className="text-sm font-semibold text-fg">معلومات الإصدار والبناء</h3>
            <div className="text-xs space-y-1.5 text-fg-muted">
              <div className="flex justify-between">
                <span>الإصدار:</span>
                <span className="font-mono text-fg">1.0.0 Web & Desktop</span>
              </div>
              <div className="flex justify-between">
                <span>المحرك:</span>
                <span className="text-fg">React 19 + Tailwind v4 + Vite</span>
              </div>
              <div className="flex justify-between">
                <span>محرك التخزين:</span>
                <span className="text-accent font-mono">localStorage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-line/60">
          <HelpCircle size={18} className="text-accent" />
          <h3 className="text-sm font-semibold text-fg">الأسئلة المتكررة</h3>
        </div>

        <div className="divide-y divide-line/40">
          {FAQS.map((faq, idx) => (
            <div key={faq.q} className="py-3">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="flex w-full items-center justify-between text-left text-xs font-semibold text-fg hover:text-accent transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp size={16} className="text-accent shrink-0 ml-2" />
                ) : (
                  <ChevronDown size={16} className="text-fg-subtle shrink-0 ml-2" />
                )}
              </button>
              {openFaq === idx && (
                <p className="mt-2 text-xs leading-relaxed text-fg-muted animate-fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
