import { TRANSACTION_TYPES } from '../data/defaults';
import { formatPnL } from './format';

export const DISCORD_RE = /^https:\/\/(?:(?:ptb|canary)\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+\/?$/;
export const SHEETS_RE = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/;

const desktop = () => globalThis.window?.pnlDesktop?.integrations;

const typeLabel = (id) => TRANSACTION_TYPES.find((t) => t.id === id)?.label ?? 'Transaction';

const cleanError = (err) =>
  String(err?.message ?? err).replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '');

export function toSheetRow(tx, accounts) {
  return {
    id: tx.id,
    date: tx.date,
    title: tx.title,
    type: typeLabel(tx.type),
    amount: tx.amount,
    category: tx.category ?? '',
    account: accounts.find((a) => a.id === tx.accountId)?.name ?? '',
    notes: tx.notes ?? '',
    hasScreenshot: Boolean(tx.screenshot),
    updatedAt: new Date(tx.updatedAt ?? tx.createdAt ?? Date.now()).toISOString(),
  };
}

const ACTION_LABEL = { create: 'New trade', update: 'Trade updated', delete: 'Trade deleted' };

export function discordMessage(action, tx, accounts) {
  const row = toSheetRow(tx, accounts);
  const embed = {
    author: { name: `PnL Ledger · ${ACTION_LABEL[action]}` },
    title: `${formatPnL(tx.amount)} · ${row.title}`.slice(0, 256),
    color: action === 'delete' ? 0x6b7280 : tx.amount >= 0 ? 0x22c55e : 0xef4444,
    fields: [
      { name: 'Type', value: row.type, inline: true },
      { name: 'Date', value: row.date, inline: true },
      { name: 'Account', value: row.account || '-', inline: true },
      { name: 'Category', value: row.category || '-', inline: true },
    ],
    footer: { text: 'PnL Ledger Desktop' },
    timestamp: new Date().toISOString(),
  };
  if (row.notes) embed.description = row.notes.slice(0, 2000);
  const image = action !== 'delete' && tx.screenshot ? tx.screenshot : null;
  if (image) embed.image = { url: 'attachment://screenshot.jpg' };
  return { payload: { username: 'PnL Ledger', embeds: [embed] }, image };
}

async function postDiscord(url, payload, image) {
  if (desktop()) return desktop().discord(url.trim(), payload, image);
  const body = new FormData();
  body.append('payload_json', JSON.stringify(payload));
  if (image) body.append('files[0]', await (await fetch(image)).blob(), 'screenshot.jpg');
  const res = await fetch(url.trim(), { method: 'POST', body });
  if (!res.ok) throw new Error(`Discord responded with ${res.status}`);
  return true;
}

async function postSheets(url, data) {
  if (desktop()) return desktop().sheets(url.trim(), data);
  // Browsers can't read Apps Script responses cross-origin, so this is fire-and-forget.
  await fetch(url.trim(), { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(data) });
  return true;
}

async function attempt(run, message) {
  try {
    await run();
    return { ok: true, message, at: Date.now() };
  } catch (err) {
    return { ok: false, error: cleanError(err), at: Date.now() };
  }
}

/** Pushes one ledger change to every enabled integration; resolves to { [service]: status }. */
export async function syncTransaction({ integrations: cfg, accounts }, action, tx) {
  const jobs = {};
  if (cfg.discordEnabled && DISCORD_RE.test(cfg.discordWebhook.trim()) && (action === 'create' || cfg.discordNotifyChanges)) {
    const { payload, image } = discordMessage(action, tx, accounts);
    jobs.discord = attempt(() => postDiscord(cfg.discordWebhook, payload, image), `${ACTION_LABEL[action]} posted`);
  }
  if (cfg.sheetsEnabled && SHEETS_RE.test(cfg.sheetsUrl.trim())) {
    const data = action === 'delete' ? { action: 'delete', id: tx.id } : { action: 'upsert', rows: [toSheetRow(tx, accounts)] };
    jobs.sheets = attempt(() => postSheets(cfg.sheetsUrl, data), `${ACTION_LABEL[action]} synced`);
  }
  const entries = await Promise.all(Object.entries(jobs).map(async ([service, job]) => [service, { ...(await job), auto: true }]));
  return Object.fromEntries(entries);
}

export const testDiscord = (url) =>
  attempt(
    () =>
      postDiscord(url, {
        username: 'PnL Ledger',
        embeds: [
          {
            title: 'PnL Ledger is connected',
            description: 'New trades will be posted to this channel.',
            color: 0x06b6d4,
            footer: { text: 'PnL Ledger Desktop' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    'Test message sent',
  );

export const testSheets = (url) => attempt(() => postSheets(url, { action: 'ping' }), 'Connected to Google Sheets');

export const syncAllToSheets = (url, transactions, accounts) =>
  attempt(
    () => postSheets(url, { action: 'upsert', rows: transactions.map((tx) => toSheetRow(tx, accounts)) }),
    `${transactions.length} trade${transactions.length === 1 ? '' : 's'} synced`,
  );

export const APPS_SCRIPT_CODE = `// PnL Ledger -> Google Sheets sync
const SHEET_NAME = 'Trades';
const HEADERS = ['ID', 'Date', 'Title', 'Type', 'Amount', 'Category', 'Account', 'Notes', 'Screenshot', 'Updated'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    const ids = sheet.getLastRow() < 2 ? [] :
      sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().map((r) => String(r[0]));

    if (data.action === 'delete') {
      const i = ids.indexOf(String(data.id));
      if (i >= 0) sheet.deleteRow(i + 2);
    } else if (data.action === 'upsert') {
      (data.rows || []).forEach((r) => {
        const row = [r.id, r.date, r.title, r.type, r.amount, r.category, r.account, r.notes,
          r.hasScreenshot ? 'Yes' : '', r.updatedAt];
        const i = ids.indexOf(String(r.id));
        if (i >= 0) {
          sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
        } else {
          sheet.appendRow(row);
          ids.push(String(r.id));
        }
      });
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 5, sheet.getLastRow() - 1, 1).setNumberFormat('+$#,##0.00;-$#,##0.00;$0.00');
      }
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
`;
