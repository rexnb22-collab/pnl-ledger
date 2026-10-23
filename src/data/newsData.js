/**
 * Real-world market news, XAUUSD gold analysis, and economic calendar events.
 */

export const ECONOMIC_EVENTS = [
  {
    id: 'ev-1',
    time: '13:30 GMT',
    date: 'Today',
    currency: 'USD',
    impact: 'HIGH',
    event: 'US Core CPI (Consumer Price Index) MoM',
    eventAr: 'مؤشر أسعار المستهلك والتضخم الأمريكي (CPI)',
    forecast: '0.3%',
    previous: '0.3%',
    actual: '0.2%',
    affectedAssets: ['XAUUSD (Gold)', 'EUR/USD', 'US100 (Nasdaq)', 'DXY'],
    notes: 'Softer CPI weakens US Dollar, triggering strong bullish momentum in Gold (XAUUSD) and tech indices.',
    pipRange: '100 - 180 Pips',
    dollarRange: '$10 - $18',
    darija: {
      meaning:
        'هاد الخبر كيقس نسبة الغلاء والتضخم في أمريكا، وهو المحرك الأساسي للدولار الأمريكي والفائدة.',
      chart:
        'خطر لفوق بشمعة انفجارية، ولا درجات النسبة (XAUUSD) حركة قوية بزاف وسريعة! إلا خرجات النتيجة هابطة على التوقعات، الدولار كيطيح والذهب طالع. الذهب كيهبط بسرعة زوينة إلا طلع التضخم فوق التوقعات.',
      bot: 'دقيقة قبل الخبر بـ 30 دقيقة لازم تحبس البوت (Robot)! علاش؟ لأن السبريد كيتوسع والسيولة كتنقص، والروبوتات كيقدرو يمرجنو الحساب بشمعة وحدة. حَبّـس البوت تماماً!',
      partner:
        'المتداول 1 والمتداول 2: اتفقو على إيقاف جميع الروبوتات قبل 30 دقيقة. بعد الخبر، استنّاو 15 دقيقة حتى تتقلق الشمعة الأولى ديال 15 دقيقة قبل إعادة التشغيل. ما تدخلوش أوامر معلّقة أثناء الخبر!',
      expected:
        'نطاق التحرك التقريبي: شمعة 1 دقيقة سريعة بزاف، سبريد واسع، انزلاق سعري (Slippage).',
    },
  },
  {
    id: 'ev-2',
    time: '19:00 GMT',
    date: 'Today',
    currency: 'USD',
    impact: 'HIGH',
    event: 'FOMC Federal Funds Rate Decision & Statement',
    eventAr: 'قرار الفائدة الفيدرالي وبيان اللجنة (FOMC)',
    forecast: '4.75%',
    previous: '5.00%',
    actual: null,
    affectedAssets: ['XAUUSD (Gold)', 'All USD Pairs', 'US500', 'Crypto'],
    notes: 'Fed rate cut cycle expectations. Extreme volatility expected 30m before and after the press conference.',
    pipRange: '120 - 250 Pips',
    dollarRange: '$12 - $25',
    darija: {
      meaning:
        'هاد الخبر هو قرار البنك الفيدرالي على سعر الفائدة. كيحدد شحال غالية الفلوس فأمريكا، وكيحرّك الذهب والدولار بقوة.',
      chart:
        'وقت البيان والندوة، الذهب كيدير شموع انفجارية فوق وتحت. السبريد كيولّي وهمي حتى تتقلق 2-3 شموع ديال 5 دقائق.',
      bot: 'حبس البوت قبل 30 دقيقة، وخليه واقف حتى بعد الندوة الصحفية. حسابات Grid و Martingale كتكون في خطر التصفية.',
      partner:
        'الشريكين يخصهم ينسّقو: نفس وقت الإيقاف ونفس وقت الرجوع. متشغلوش البوت غير حيت شفتي شمعة خضراء أولى.',
      expected: 'تقلب عنيف قبل وبعد الندوة. امتنع على الأوامر المعلقة تماماً.',
    },
  },
  {
    id: 'ev-3',
    time: '13:30 GMT',
    date: 'Friday',
    currency: 'USD',
    impact: 'HIGH',
    event: 'Non-Farm Employment Change (NFP)',
    eventAr: 'تغير التوظيف غير الزراعي (NFP)',
    forecast: '165K',
    previous: '142K',
    actual: null,
    affectedAssets: ['XAUUSD (Gold)', 'GBP/USD', 'USD/JPY'],
    notes: 'Key employment health barometer. High slippage and wide spreads expected on Gold scalping.',
    pipRange: '80 - 160 Pips',
    dollarRange: '$8 - $16',
    darija: {
      meaning:
        'عدد الوظائف الجديدة برا القطاع الفلاحي. كيبين صحة الاقتصاد الأمريكي وكيهز الدولار والذهب دغيا.',
      chart:
        'أول دقيقة بعد NFP غالباً شمعة كاذبة، من بعد الاتجاه الحقيقي. الذهب يقدر يتحرك $10+ في ثواني.',
      bot: 'حبس البوت 30 دقيقة قبل، وما ترجعوش حتى بعد 15 دقيقة من الخبر. السبريد على الذهب كيوصل لمستويات خطيرة.',
      partner: 'ما تدخلوش معا بعضياتكم أوامر متعاكسة وقت الخبر. ستناو الاستقرار ونسّطو حجم اللوت.',
      expected: 'انزلاق سعري عالي وسبريد واسع على سكالبينغ الذهب.',
    },
  },
  {
    id: 'ev-4',
    time: '12:15 GMT',
    date: 'Tomorrow',
    currency: 'EUR',
    impact: 'MEDIUM',
    event: 'ECB Main Refinancing Rate Decision',
    eventAr: 'قرار سعر إعادة التمويل للبنك الأوروبي (ECB)',
    forecast: '3.25%',
    previous: '3.50%',
    actual: null,
    affectedAssets: ['EUR/USD', 'EUR/GBP', 'DAX40'],
    notes: 'European central bank monetary policy. Watch for breakout retests on EUR pairs.',
    pipRange: '40 - 80 Pips',
    dollarRange: '$4 - $8',
    darija: {
      meaning: 'قرار البنك الأوروبي على الفائدة. كيحرك اليورو مقابل الدولار وأزواج EUR.',
      chart: 'حركة متوسطة على EUR/USD. الذهب كيتأثر بشكل غير مباشر إلا تغيّر الدولار.',
      bot: 'مانحتاجوش إيقاف كامل إلا إذا كان عندك روبوت على EUR. نقص اللوت وراقب.',
      partner: 'راقبو حجم اللوت واستراتيجية الخروج كل 5 دقائق.',
      expected: 'تقلب متوسط مع إعادة اختبار الاختراقات على أزواج اليورو.',
    },
  },
  {
    id: 'ev-5',
    time: '14:30 GMT',
    date: 'Tomorrow',
    currency: 'USD',
    impact: 'MEDIUM',
    event: 'US Initial Jobless Claims',
    eventAr: 'طلبات إعانة البطالة الأولية الأمريكية',
    forecast: '218K',
    previous: '219K',
    actual: null,
    affectedAssets: ['XAUUSD', 'US30 (Dow)', 'US100'],
    notes: 'Labor market tightness indicator. Quick 5-15 pip scalp reactions on Gold.',
    pipRange: '25 - 60 Pips',
    dollarRange: '$2 - $6',
    darija: {
      meaning: 'عدد الناس اللي طلبو إعانة البطالة هاد الأسبوع. كيعطي إشارة على سوق الشغل.',
      chart: 'ردة فعل سريعة 5-15 نقطة على الذهب، وغالباً كترجع للاتجاه العام.',
      bot: 'ماشي ضروري تحبس البوت، غير نقص اللوت وراقب السبريد دقيقتين.',
      partner: 'كونو جاهزين للتراجع السريع إلا توسع السبريد.',
      expected: 'سكالب سريع على الذهب بدون شموع انفجارية في العادة.',
    },
  },
];

export const MARKET_NEWS = [
  {
    id: 'news-1',
    market: 'XAUUSD',
    title: 'XAU/USD Gold Consolidates Near Highs as Central Banks Accelerate Accumulation',
    titleAr: 'الذهب كيتماسك قرب القمم مع تسارع شراء البنوك المركزية',
    category: 'Commodities',
    time: '12m ago',
    sentiment: 'BULLISH',
    summary:
      'Spot gold tests upper resistance around $2,735/oz with robust physical demand from sovereign central banks and hedge against global debt escalation.',
    summaryAr:
      'الذهب الفوري كيجرّب المقاومة قرب 2,735$ مع طلب قوي من البنوك المركزية وتحوّط من الديون العالمية.',
    technicalLevels: {
      resistance: '$2,748 - $2,755 (ATH Zone)',
      pivot: '$2,725',
      support: '$2,708 - $2,695 (Daily Demand)',
    },
    actionableTip:
      'Look for pullbacks to the $2,718-$2,722 liquidity sweep before targeting breakout long continuation. Keep stops tight below $2,700.',
    actionableTipAr:
      'قلّب على رجوع نحو 2,718$-2,722$ قبل تكملة الصعود. الستوب يكون مضبوط تحت 2,700$.',
    impact: 'High volatility on London/NY overlap session.',
  },
  {
    id: 'news-2',
    market: 'Forex',
    title: 'US Dollar Index (DXY) Slides Below 103.20 Following Soft Yield Expectations',
    titleAr: 'مؤشر الدولار هبط تحت 103.20 مع تراجع العوائد',
    category: 'Forex',
    time: '45m ago',
    sentiment: 'BEARISH_USD',
    summary:
      'The greenback faces headwinds as 10-year Treasury yields pull back to 4.02%, lifting major FX pairs including EUR/USD and GBP/USD.',
    summaryAr:
      'الدولار ضعيف حيت عوائد 10 سنوات رجعات لـ 4.02%، وهادشي رافع EUR/USD و GBP/USD.',
    technicalLevels: {
      resistance: 'EUR/USD: 1.0920',
      pivot: 'EUR/USD: 1.0860',
      support: 'EUR/USD: 1.0810',
    },
    actionableTip: 'EUR/USD showing bullish divergence on 4h timeframe. Potential long setup on retest of 1.0850.',
    actionableTipAr: 'EUR/USD فيه دايفرجنس صاعد على 4 ساعات. فرصة شراء على إعادة اختبار 1.0850.',
    impact: 'Moderate trending momentum in European FX.',
  },
  {
    id: 'news-3',
    market: 'Indices',
    title: 'Nasdaq (US100) Rallies +1.4% Powered by Mega-Cap AI Chip Guidance',
    titleAr: 'ناسداك (US100) طالع +1.4% بفضل توجيهات الرقائق والذكاء الاصطناعي',
    category: 'Indices',
    time: '1h ago',
    sentiment: 'BULLISH',
    summary:
      'Semiconductor leaders surge to fresh session highs, lifting NQ futures above 20,450 points ahead of after-hours quarterly earnings.',
    summaryAr:
      'شركات الرقائق كتسجّل قمم الجلسة، والعقود ديال NQ فوق 20,450 نقطة قبل النتائج.',
    technicalLevels: {
      resistance: '20,620 NQ',
      pivot: '20,380 NQ',
      support: '20,150 NQ',
    },
    actionableTip: 'Respect the opening 15m range high. Avoid chasing vertical spikes without a 5m VWAP pullback.',
    actionableTipAr: 'احترم قمة رينج أول 15 دقيقة. ما تلاحقش الشمعة العمودية بلا رجوع لـ VWAP.',
    impact: 'Fast momentum orders during New York cash session.',
  },
  {
    id: 'news-4',
    market: 'Crypto',
    title: 'Bitcoin (BTC) Defends $67,500 Support with Sustained ETF Institutional Inflows',
    titleAr: 'البيتكوين كيحمي دعم 67,500$ مع تدفقات ETF المؤسسات',
    category: 'Crypto',
    time: '2h ago',
    sentiment: 'BULLISH',
    summary:
      'Net institutional spot ETF inflows surpassed $320M yesterday, keeping BTC market structure constructive above 50-day moving average.',
    summaryAr:
      'تدفقات ETF البارح تجاوزات 320 مليون دولار، والبنية ديال BTC مازالة قوية فوق متوسط 50 يوم.',
    technicalLevels: {
      resistance: '$69,200 - $70,000',
      pivot: '$67,800',
      support: '$66,200',
    },
    actionableTip: 'Weekend liquidity squeezes common. Set limit orders rather than market buys in thin order books.',
    actionableTipAr: 'السيولة ضعيفة في الويكاند. استعمل أوامر معلّقة بدل الشراء بالسوق.',
    impact: 'High correlation with crypto spot and perpetual futures accounts.',
  },
  {
    id: 'news-5',
    market: 'XAUUSD',
    title: 'Gold Trading Strategy Alert: Middle East Geopolitical Risk Premium & Safe Haven Flows',
    titleAr: 'تنبيه الذهب: علاوة المخاطر الجيوسياسية وتدفقات الملاذ الآمن',
    category: 'Commodities',
    time: '3h ago',
    sentiment: 'VOLATILE',
    summary:
      'Escalating diplomatic and shipping lane headlines drive safe-haven demand into spot bullion and US government bonds.',
    summaryAr:
      'العناوين الجيوسياسية كيرفعو الطلب على الذهب والسندات الأمريكية كملاذ آمن.',
    technicalLevels: {
      resistance: '$2,750',
      pivot: '$2,720',
      support: '$2,705',
    },
    actionableTip: 'Reduce position sizing by 30-50% during sudden headline spikes to prevent unexpected stop slippage.',
    actionableTipAr: 'نقص حجم الصفقة بـ 30-50% وقت العناوين المفاجئة باش تتجنب انزلاق الستوب.',
    impact: 'Sudden $15-$25 intraday candle swings on XAUUSD.',
  },
];
