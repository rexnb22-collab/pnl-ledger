import { useState } from 'react';
import clsx from 'clsx';
import { Check, ChevronDown, ClipboardCopy, FileSpreadsheet, Loader2, RefreshCw, Send } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { APPS_SCRIPT_CODE, SHEETS_RE, syncAllToSheets, testSheets } from '../../lib/integrations';
import { CardHeader, Steps, SyncStatus, UrlField } from './controls';
import { actionBtn, copyText, useBusy } from './utils';

export default function SheetsCard() {
  const cfg = useAppStore((s) => s.integrations);
  const status = useAppStore((s) => s.syncStatus.sheets);
  const transactions = useAppStore((s) => s.transactions);
  const accounts = useAppStore((s) => s.accounts);
  const update = useAppStore((s) => s.updateIntegrations);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const [busy, run] = useBusy();
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const valid = SHEETS_RE.test(cfg.sheetsUrl.trim());

  const onCopy = async () => {
    await copyText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="card p-5">
      <CardHeader
        icon={FileSpreadsheet}
        iconClass="bg-profit/10 text-profit ring-profit/30"
        title="Google Sheets"
        subtitle="Keep a live copy of your ledger in a spreadsheet."
        enabled={cfg.sheetsEnabled}
        onToggle={(sheetsEnabled) => update({ sheetsEnabled })}
      />
      <UrlField
        label="Apps Script web app URL"
        value={cfg.sheetsUrl}
        placeholder="https://script.google.com/macros/s/…/exec"
        valid={valid}
        invalidText="Paste the Web app URL that ends with /exec."
        onChange={(sheetsUrl) => update({ sheetsUrl })}
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={actionBtn}
          disabled={!valid || Boolean(busy)}
          onClick={() => run('test', async () => setSyncStatus('sheets', await testSheets(cfg.sheetsUrl)))}
        >
          {busy === 'test' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Test connection
        </button>
        <button
          type="button"
          className={actionBtn}
          disabled={!valid || Boolean(busy) || transactions.length === 0}
          onClick={() =>
            run('all', async () => setSyncStatus('sheets', await syncAllToSheets(cfg.sheetsUrl, transactions, accounts)))
          }
        >
          {busy === 'all' ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Sync all trades
        </button>
      </div>
      <div className="mt-2 min-h-[16px]">
        <SyncStatus status={status} />
      </div>
      <div className="divider my-4" />
      <Steps
        items={[
          'Create a new Google Sheet (sheets.new).',
          'Open Extensions, then Apps Script. Delete the code there and paste the script below.',
          'Click Deploy, then New deployment, and pick Web app. Set "Execute as" to Me and "Who has access" to Anyone. Deploy and allow access.',
          'Copy the Web app URL (it ends with /exec), paste it above and turn the switch on.',
          'Click Sync all trades to send the trades you already have.',
        ]}
      />
      <div className="mt-4 flex items-center gap-2">
        <button type="button" className={actionBtn} onClick={onCopy}>
          {copied ? <Check size={13} className="text-profit" /> : <ClipboardCopy size={13} />}
          {copied ? 'Copied' : 'Copy script'}
        </button>
        <button type="button" className="btn-ghost h-8 px-2 text-xs" onClick={() => setShowCode((v) => !v)}>
          <ChevronDown size={13} className={clsx('transition-transform', showCode && 'rotate-180')} />
          {showCode ? 'Hide script' : 'Show script'}
        </button>
      </div>
      {showCode && (
        <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-white/6 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-fg-muted">
          {APPS_SCRIPT_CODE}
        </pre>
      )}
    </section>
  );
}
