# PnL Ledger

دفتر ربح وخسارة محلي بأسلوب تيرمينال تداول: تقويم يومي، جريدة صفقات، تحليلات، حسابات متعددة، وأخبار السوق — بدون حساب مركزي وبدون سيرفر إلزامي.

**PnL Ledger** is a dark, trading-terminal style profit-and-loss journal for traders (and also freelancers / sellers). Data lives on the machine: browser `localStorage` on the web, or the desktop app-data folder when a preload (`window.pnlDesktop`) is present.

---

## ما كيدير المشروع

- تسجيل صفقات الربح والخسارة، الدخل، والمصاريف مع ملاحظات ولقطة شارت اختيارية.
- تقويم أسبوعي / شهري / سنوي / كل الوقت يلون الأيام حسب الصافي.
- حسابات تداول متعددة + وضع **Duo Traders** (متداولين اثنين مع فلترة ومقارنة رأس لرأس).
- تحليلات: equity curve، win rate، profit factor، أيام خضراء/حمراء، أهداف شهرية.
- أخبار السوق وتقويم اقتصادي مع **Bot Safety Radar** لتنبيه البوتات قبل أحداث عالية التأثير (XAUUSD / فوركس).
- تصدير CSV ونسخة احتياطية JSON واستيرادها، بيانات تجريبية، وطباعة.
- دمج اختياري مع **Discord webhooks** و **Google Sheets** (Apps Script).

---

## المتطلبات

- [Node.js](https://nodejs.org/) 20 أو أحدث (موصى به)
- npm (يأتي مع Node)

```bash
npm install
npm run dev
```

التطبيق يفتح على `http://localhost:3000` (`vite --port=3000 --host=0.0.0.0`).

| أمر | الوظيفة |
| --- | --- |
| `npm run dev` | سيرفر التطوير |
| `npm run build` | بناء الإنتاج (`dist/`) |
| `npm run preview` | معاينة البناء |
| `npm run lint` | فحص TypeScript (`tsc --noEmit`) |
| `npm run clean` | حذف `dist` و `server.js` |

---

## الستاك التقني

| طبقة | التقنية |
| --- | --- |
| UI | React 19 + Vite 8 |
| حالة عالمية | Zustand 5 مع `persist` |
| تنسيق | Tailwind CSS 4 (`@tailwindcss/vite`) |
| رسوم بيانية | Recharts |
| أيقونات | lucide-react |
| خطوط | Inter Variable + Cairo (عربي) |
| حركة | motion |
| مسارات | `@` → جذر المشروع (`vite.config.ts`) |

لا يوجد راوتر: التنقل عبر `activeNav` في الستوك (`calendar`, `analytics`, `accounts`, `news`, `export`, `contact`, `settings`, `logout`).

---

## هيكل المجلدات

```
pnl-ledger/
├── index.html                 # نقطة HTML، عنوان PnL Ledger، خط Cairo
├── vite.config.ts
├── package.json
├── src/
│   ├── main.jsx               # React root
│   ├── App.jsx                # تبديل الصفحات + المودالات
│   ├── index.css              # ثيم داكن (profit/loss، glow)
│   ├── store/useAppStore.js   # Zustand: صفقات، حسابات، متداولين، إعدادات
│   ├── hooks/
│   │   ├── usePnL.js          # تجميع يومي وملخص الفترة والهدف الشهري
│   │   └── useMediaQuery.js   # تخطيط الهاتف vs سطح المكتب
│   ├── lib/
│   │   ├── pnl.js             # تجميع P&L، win rate، profit factor، equity
│   │   ├── date.js            # فترات الأسبوع/الشهر/السنة
│   │   ├── format.js          # عملة و P&L
│   │   ├── image.js           # ضغط لقطات الشارت
│   │   ├── integrations.js    # Discord + Google Sheets
│   │   ├── goldPriceAPI.js    # سعر الذهب من xaus.com
│   │   ├── economicCalendarAPI.js  # financecalendar.com
│   │   └── botSafetyRadar.js  # العد التنازلي للأحداث عالية التأثير
│   ├── data/
│   │   ├── defaults.js        # حسابات وأنواع الصفقات والفئات
│   │   ├── demoData.js        # صفقات تجريبية للتصدير/العرض
│   │   └── newsData.js        # أحداث وأخبار احتياطية
│   └── components/
│       ├── layout/            # Sidebar, TopBar, StatsPanel, AppLayout
│       ├── calendar/          # Week / Month / Year / All-time
│       ├── transactions/      # إضافة/تعديل صفقة + تفاصيل اليوم
│       ├── analytics/         # سطح المكتب + موبايل
│       ├── accounts/
│       ├── news/              # تقويم اقتصادي + ذهب
│       ├── export/
│       ├── settings/          # Discord, Sheets, الهدف الشهري
│       ├── contact/           # FAQ بالدارجة
│       ├── mobile/            # MobileShell, MobileJournal
│       └── ui/                # Modal, BotSafetyRadar
└── public/                    # شعار وأصول ثابتة
```

---

## الصفحات والميزات بالتفصيل

### 1. رزنامة الربح والخسارة (`calendar`)

- عروض: **Week / Month / Year / All time** مع التنقل (`shiftPeriod`) والقفز لليوم (`goToToday`) والحفر من سنة إلى شهر.
- كل خلية يوم تعرض الصافي، عدد الصفقات، ولون ربح/خسارة.
- النقر على يوم يفتح **Day Details**؛ زر الإضافة يفتح نموذج الصفقة مع تاريخ اليوم.
- فلترة حسب الحساب والمتداول في الشريط العلوي / اللوحة الجانبية.

### 2. تسجيل الصفقة (`AddTransactionModal`)

حقول: عنوان، مبلغ، نوع، تاريخ، فئة، حساب، متداول، ملاحظات، لقطة شارت.

أنواع الحركة (`src/data/defaults.js`):

| id | التسمية | الإشارة |
| --- | --- | --- |
| `trade_profit` | Trade Profit | + |
| `trade_loss` | Trade Loss | − |
| `income` | Income | + |
| `expense` | Expense | − |

الفئات الافتراضية: Stocks, Options, Futures, Forex, Crypto, Indices, Commodities, Sales, Client work, Fees, Software, Marketing, Inventory, Other.

لقطة الشارت: سحب وإفلات، اختيار ملف، أو لصق من الحافظة (`Ctrl+V`). الصورة تُضغط محلياً قبل التخزين.

يمكن إنشاء حساب جديد من داخل النموذج.

### 3. التحليلات (`analytics`)

- نطاق زمني: الكل / السنة / الشهر / 30 يوم.
- مقارنة رأس لرأس بين Trader 1 و Trader 2 (صافي، عدد الصفقات، نسبة الربح).
- مخططات مساحة وأعمدة (Recharts).
- نسخة موبايل: `MobileAnalytics.jsx`.

المقاييس تُحسب من المبالغ الموقعة في `src/lib/pnl.js`: net, revenue, expenses, win rate, avg daily, profit factor, أفضل/أسوأ يوم، أيام خضراء vs حمراء.

### 4. حسابات التداول (`accounts`)

- حساب تجميعي `All Accounts` + حسابات حقيقية (لون، نوع، اسم).
- إحصائيات لكل حساب من صفقاته.
- إضافة / تعديل / حذف (الحذف يزيل صفقات ذلك الحساب).

### 5. أخبار السوق والذهب (`news`)

- تقويم اقتصادي وأحداث (مع بيانات احتياطية في `newsData.js` واستدعاء `economicCalendarAPI.js`).
- سعر الذهب الفوري عبر `goldPriceAPI.js` (`https://xaus.com/api/v1/spot`).
- شروحات بالدارجة لمستوى التقلب (مثلاً CPI / FOMC / NFP).
- **Bot Safety Radar**: يحسب الحدث التالي عالي/متوسط التأثير وينبّه لإيقاف البوت أو تقليل اللوت.
- تخطيط موبايل: `MobileMarketNews.jsx`.

### 6. تصدير ونسخ احتياطي (`export`)

- CSV: `pnl-ledger-trades-YYYY-MM-DD.csv`
- JSON: `{ version, exportedAt, accounts, transactions }` باسم `pnl-ledger-backup-YYYY-MM-DD.json`
- استيراد JSON (دمج/استعادة حسب الواجهة)
- تحميل بيانات تجريبية (`generateSampleTrades`)
- مسح الخزنة المحلية بعد تأكيد
- طباعة / تنزيل سطح المكتب إن وُجد جسر الديسكتوب

### 7. الإعدادات (`settings`)

- **Discord**: webhook (`discord.com/api/webhooks/...`). عند إنشاء/تعديل/حذف صفقة يُرسل embed بلون الربح/الخسارة ويمكن إرفاق لقطة.
- **Google Sheets**: رابط Apps Script المنشور (`script.google.com/macros/s/.../exec`). المتصفح يستخدم `no-cors` (fire-and-forget). الديسكتوب يمر عبر preload.
- **الهدف الشهري** بالدولار، يظهر في تقدم الهدف.

### 8. الدعم (`contact`)

نموذج ملاحظات محلي + FAQ بالدارجة حول التخزين، Sheets، Discord، تعدد الصفقات في اليوم، ولصق صور الشارت.

### 9. الجلسة (`logout`)

لا يوجد تسجيل دخول سحابي. الزر يسمح بمسح الخزنة المحلية وإعادة الحسابات الافتراضية.

---

## نموذج البيانات (Zustand persist)

مفتاح التخزين: `pnl-ledger` (نسخة 1).

ما يُحفظ (`partialize`):

- `transactions` — كل صفقة: `id`, `title`, `amount` (موقع), `type`, `date` (ISO `YYYY-MM-DD`), `category`, `accountId`, `traderId`, `notes`, `screenshot`, `createdAt` / `updatedAt`
- `accounts` — `{ id, name, type, color }` (`type: 'aggregate'` للحساب الجامع)
- `traders` — افتراضيًا Trader 1 و Trader 2 (لون، أفاتار، دور)
- `selectedTraderId` / `activeTraderId` / `selectedAccountId`
- `notificationSettings`, أهداف (`monthlyGoal`, `yearlyGoal`, `lifetimeGoal`, `startingCapital`)
- `integrations` (Discord / Sheets URLs والأعلام)
- حالة الواجهة: `sidebarCollapsed`, `rightPanelOpen`

ما لا يُحفظ: المودالات المفتوحة، `activeNav`, أخطاء التخزين المؤقتة.

التخزين:

1. إن وُجد `window.pnlDesktop.storage` → ملف JSON في مجلد بيانات التطبيق (سطح المكتب).
2. وإلا → `localStorage` في المتصفح.

فشل الكتابة يضع `storageError`.

---

## Duo Traders

| حقل | المعنى |
| --- | --- |
| `selectedTraderId` | فلتر العرض: `all` أو `trader_1` أو `trader_2` |
| `activeTraderId` | من يدخل الصفقة الآن |
| `partnerNotes` | تعليق الشريك على صفقة (`addTradeComment`) |

الصفقات بدون `traderId` تُعامل كـ `trader_1`.

---

## الدمج الخارجي (اختياري)

الملف: `src/lib/integrations.js`.

- التحقق من شكل رابط Discord و Apps Script قبل الإرسال.
- `syncTransaction` يعمل بعد الحفظ/الحذف.
- في الديسكتوب: `window.pnlDesktop.integrations.discord` / `.sheets`.

**لا تضع روابط webhook أو مفاتيح في Git.** الصقها فقط في الإعدادات محلياً.

---

## تخطيط متجاوب (نقاط القطع الدقيقة)

| عرض الشاشة | السلوك |
| --- | --- |
| `≤ 767px` (`useIsPhone`) | `MobileShell`: ترويسة + محتوى + شريط 3 تبويبات (Calendar / Analytics / Settings). باقي الصفحات من بطاقات Extra (Accounts, Market news, Export, Support). |
| `≥ 1280px` | تظهر لوحة الإحصائيات اليمنى إن كانت `rightPanelOpen`. |
| `< 1280px` على سطح المكتب | السايدبار ينطوي لسكة أيقونات. |
| `≥ 1280px` و `< 1600px` مع اللوحة اليمنى مفتوحة | السايدبار ينطوي أيضاً لإعطاء العمود الأوسط مساحة. |
| `≥ 1600px` | سايدبار كامل + محتوى + StatsPanel معاً. |

**TopBar (سطح المكتب):** نطاق Week/Month/Year/All time، مبدّل Duo (حساب + متداول نشط + دفتر مشترك)، إشعارات (غفوة 30 دقيقة، صامت، high-impact فقط)، إخفاء/إظهار اللوحة اليمنى، زر إضافة صفقة.

**Bot Safety Radar** (`src/lib/botSafetyRadar.js`):

| الحالة | الشرط |
| --- | --- |
| `VOLATILE` | الخبر صدر خلال آخر 15 دقيقة — أوقف البوت حتى يستقر السبريد |
| `DANGER` | بقي أقل من 30 دقيقة على خبر HIGH/MEDIUM |
| `SAFE` | لا خبر قريب، أو الوقت كافٍ |

العد التنازلي يُعرض أيضاً بالدارجة (`formatTimeDarija`).

---

## الاختبارات

```bash
node --test src/lib/pnl.test.ts
```

يغطي `aggregateByDay`، `summarize`، `percentChange`، `cumulativeSeries`، و`intensityTier`.

---

## الثيم

واجهة داكنة (`html.dark`)، خلفية قريبة من `#090D16`، لون ربح نيون `#00FFA3`، خسارة حمراء. الواجهة العربية تستخدم خط **Cairo**.

---

## الخصوصية والأمان

- لا يوجد باكند إلزامي؛ دفتر التداول يبقى على الجهاز ما لم تفعّل Discord/Sheets.
- صور الشارت تُخزَّن مضغوطة داخل سجل الصفقة (قد تكبر حصة `localStorage` إن كثرت الصور).
- روابط webhook تُحفظ في نفس الستوك المحلي — لا تشارك نسخة احتياطية JSON تحتويها إن كانت الحساسية مهمة.
- مسح الخزنة من Logout أو Export يعيد الحسابات الافتراضية ويمسح الصفقات.

---

## ملاحظات التطوير

- التطبيق بدأ كقالب Vite باسم npm `react-example`؛ اسم المنتج في الواجهة هو **PnL Ledger**.
- `@google/genai` و `express` موجودان في `package.json` لكن مسار الواجهة الحالي هو SPA محلي (لا تعتمد الواجهة عليهما لتشغيل التقويم).
- APIs الخارجية (ذهب، تقويم اقتصادي) قد تفشل بسبب CORS أو توفر الخدمة؛ الواجهة تسقط إلى بيانات محلية عند الخطأ.
- `DISABLE_HMR=true` يعطّل HMR ومراقبة الملفات (مفيد أثناء تعديل آلي حتى لا يومض Vite).

---

## محتويات المستودع وماذا أين

يُرفع **كل المصدر** (`src/`، الإعدادات، `public/logo.svg` و`icon.png`، لقطات `.aistudio/`، `README.md`، الأقفال `package-lock.json` و`bun.lock`).

| عنصر | أين | لماذا |
| --- | --- | --- |
| الكود والواجهة | Git | المصدر |
| لقطات AI Studio | مجلد `.aistudio/` في Git | توثيق بصري للواجهات |
| مثبت الديسكتوب `pnl-ledger-desktop-main_*.zip` (~168MB) | **GitHub Release** `v1.0.0` | GitHub يرفض أي ملف داخل Git أكبر من 100MB |
| `node_modules/` | غير مرفوع | يُعاد بـ `npm install` من الأقفال |
| `.env` | غير مرفوع | أسرار. يوجد `.env.example` فقط |
| `dist/` | غير مرفوع | ناتج `npm run build` |

مسارات التحميل المحلية:

- `public/download/PnL-Ledger-Setup-1.0.0.exe`
- `public/download/PnL-Ledger-Portable-1.0.0.exe`
- `public/assets/aistudio/pnl-ledger-desktop-main_*.zip`

---

## رخصة

المشروع خاص بصاحبه ما لم تُضف رخصة صريحة في المستودع.
