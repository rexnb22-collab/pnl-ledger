import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MonitorDown,
  Printer,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { generateSampleTrades } from '../../data/demoData';
import Modal from '../ui/Modal';

export default function ExportView() {
  const transactions = useAppStore((s) => s.transactions);
  const accounts = useAppStore((s) => s.accounts);
  const setTransactions = useAppStore((s) => s.setTransactions);
  const resetAllData = useAppStore((s) => s.resetAllData);

  const [notification, setNotification] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }

    const headers = ['ID', 'Date', 'Title', 'Amount', 'Type', 'Category', 'Account', 'Notes'];
    const rows = transactions.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      return [
        `"${t.id || ''}"`,
        `"${t.date || ''}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${t.type || ''}"`,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(acc?.name || t.accountId || '').replace(/"/g, '""')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pnl-ledger-trades-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${transactions.length} trades to CSV`);
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts,
      transactions,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pnl-ledger-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('JSON backup exported successfully');
  };

  // Import JSON backup
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (Array.isArray(json.transactions)) {
          setTransactions(json.transactions);
          showToast(`Restored ${json.transactions.length} transactions from backup`);
        } else {
          showToast('Invalid backup format: missing transactions list', 'error');
        }
      } catch (err) {
        showToast('Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Load sample demo trades
  const handleLoadDemo = () => {
    const demoTrades = generateSampleTrades();
    setTransactions(demoTrades);
    setShowDemoConfirm(false);
    showToast(`Loaded ${demoTrades.length} realistic trading records!`);
  };

  // Clear data
  const handleClearAll = () => {
    setTransactions([]);
    setShowClearConfirm(false);
    showToast('All transaction records cleared');
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm animate-fade-in ${
            notification.type === 'error'
              ? 'border-loss/50 bg-loss-deep/30 text-loss'
              : 'border-profit/50 bg-profit-deep/30 text-profit'
          }`}
        >
          {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-line pb-4">
        <h2 className="text-base font-semibold text-fg">إدارة البيانات والتصدير</h2>
        <p className="text-xs text-fg-muted">
          صدّر دفترك إلى جداول، استعد النسخ الاحتياطية، أو حمّل سجلات تجريبية واقعية.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Export Card */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">تصدير الصفقات</h3>
              <p className="text-2xs text-fg-muted">نزّل دفترك لتقارير الضرائب أو جداول خارجية</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="btn-secondary w-full justify-between"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet size={16} className="text-profit" />
                <span>تصدير كـ CSV</span>
              </div>
              <span className="badge badge-neutral text-2xs">{transactions.length} صفوف</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="btn-secondary w-full justify-between"
            >
              <div className="flex items-center gap-2.5">
                <FileJson size={16} className="text-accent" />
                <span>تصدير نسخة احتياطية JSON</span>
              </div>
              <span className="badge badge-neutral text-2xs">الحالة الكاملة</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-secondary w-full justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Printer size={16} className="text-warn" />
                <span>طباعة / حفظ كـ PDF</span>
              </div>
              <span className="badge badge-neutral text-2xs">عرض الطباعة</span>
            </button>
          </div>
        </div>

        {/* Import & Backup Card */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">استعادة النسخة الاحتياطية</h3>
              <p className="text-2xs text-fg-muted">استعد دفترك من نسخة احتياطية JSON تم تصديرها سابقاً</p>
            </div>
          </div>

          <div className="pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary w-full justify-center gap-2 py-4 border-dashed border-line-strong hover:border-accent hover:bg-surface-hover"
            >
              <Upload size={18} className="text-accent" />
              <span>اختر ملف JSON للاستعادة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demo Data & Danger Zone */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Sample Demo Data Card */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-profit-deep/30 text-profit">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">تحميل بيانات تداول تجريبية</h3>
              <p className="text-2xs text-fg-muted">
                عبّي تقويمك بـ 30 يوم من صفقات واقعية عبر الكريبتو، الأسهم، الفوركس والعقود الآجلة.
              </p>
            </div>
          </div>

          <p className="text-xs text-fg-subtle pt-1">
            مثالي لاستكشاف الرسوم البيانية، خرائط الحرارة، تفاصيل الأيام، وحسابات الهدف الشهري.
          </p>

          <button
            type="button"
            onClick={() => setShowDemoConfirm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 w-full"
          >
            <Sparkles size={16} strokeWidth={3} /> تحميل صفقات تجريبية
          </button>
        </div>

        {/* Clear Data Card */}
        <div className="card p-5 space-y-3 border-loss/30">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-loss-deep/30 text-loss">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">مسح بيانات الصفقات</h3>
              <p className="text-2xs text-fg-muted">امسح كل الصفقات الحالية واعد البدء من الصفر</p>
            </div>
          </div>

          <p className="text-xs text-fg-subtle pt-1">
            حالياً <strong className="text-fg">{transactions.length}</strong> صفقة محفوظة في التخزين المحلي للمتصفح.
          </p>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="btn w-full border border-loss/50 bg-loss-deep/20 text-loss hover:bg-loss-deep/40 font-semibold"
          >
            <Trash2 size={15} /> مسح كل السجلات
          </button>
        </div>
      </div>

      {/* Desktop App Download Banner */}
      <div className="card p-5 bg-surface-raised border-line-strong flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-ink-950 font-bold glow-accent">
            <MonitorDown size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-fg">Download PnL Ledger Desktop for Windows</h3>
            <p className="text-xs text-fg-muted">
              Standalone offline application with native performance, system tray, and local storage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/download/PnL-Ledger-Setup-1.0.0.exe"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
          >
            <Download size={16} strokeWidth={3} /> Windows Installer (.exe)
          </a>
          <a
            href="/download/PnL-Ledger-Portable-1.0.0.exe"
            download
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-gradient-to-br from-surface-raised to-surface-hover px-5 py-2.5 text-xs font-bold text-fg shadow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
          >
            Portable (.exe)
          </a>
        </div>
      </div>

      {/* Demo Confirm Modal */}
      {showDemoConfirm && (
        <Modal
          onClose={() => setShowDemoConfirm(false)}
          title="تحميل صفقات تجريبية؟"
          subtitle="هذا سيستبدل الصفقات الحالية بـ 30 يوم من صفقات تجريبية واقعية."
          icon={Sparkles}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowDemoConfirm(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-gradient-to-br from-surface-raised to-surface-hover px-5 py-2.5 text-xs font-bold text-fg shadow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
              >
                نعم، حمّل الصفقات التجريبية
              </button>
            </>
          }
        >
          <p className="text-sm text-fg-muted">
            ستحصل على دفتر تداول غني بأرباح، خسائر، إعدادات صفقات، ملاحظات، وتقسيم الأصول لاختبار كل الميزات.
          </p>
        </Modal>
      )}

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <Modal
          onClose={() => setShowClearConfirm(false)}
          title="مسح كل الصفقات؟"
          subtitle="هذا الإجراء سيحذف كل الصفقات المسجلة نهائياً."
          icon={Trash2}
          footer={
            <>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-gradient-to-br from-surface-raised to-surface-hover px-5 py-2.5 text-xs font-bold text-fg shadow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
              >
                مسح الكل
              </button>
            </>
          }
        >
          <p className="text-sm text-fg-muted">
            هل أنت متأكد أنك تريد مسح كل {transactions.length} صفقة؟ تأكد من أنك صدّرت نسخة CSV أو JSON إذا كنت تريد الاحتفاظ بها.
          </p>
        </Modal>
      )}
    </div>
  );
}
