import { Loader2, MessageSquare, Send } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DISCORD_RE, testDiscord } from '../../lib/integrations';
import { CardHeader, Steps, SyncStatus, UrlField } from './controls';
import { actionBtn, useBusy } from './utils';

export default function DiscordCard() {
  const cfg = useAppStore((s) => s.integrations);
  const status = useAppStore((s) => s.syncStatus.discord);
  const update = useAppStore((s) => s.updateIntegrations);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const [busy, run] = useBusy();
  const valid = DISCORD_RE.test(cfg.discordWebhook.trim());

  return (
    <section className="card p-5">
      <CardHeader
        icon={MessageSquare}
        iconClass="bg-profit/10 text-profit ring-profit/30"
        title="Discord"
        subtitle="Post every new trade to your channel, with its screenshot."
        enabled={cfg.discordEnabled}
        onToggle={(discordEnabled) => update({ discordEnabled })}
      />
      <UrlField
        label="Webhook URL"
        value={cfg.discordWebhook}
        placeholder="https://discord.com/api/webhooks/…"
        valid={valid}
        invalidText="This doesn't look like a Discord webhook URL."
        onChange={(discordWebhook) => update({ discordWebhook })}
      />
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-fg-muted">
        <input
          type="checkbox"
          className="h-3.5 w-3.5 accent-[#06B6D4]"
          checked={cfg.discordNotifyChanges}
          onChange={(e) => update({ discordNotifyChanges: e.target.checked })}
        />
        Also post when a trade is edited or deleted
      </label>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className={actionBtn}
          disabled={!valid || Boolean(busy)}
          onClick={() => run('test', async () => setSyncStatus('discord', await testDiscord(cfg.discordWebhook)))}
        >
          {busy === 'test' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Send test message
        </button>
        <SyncStatus status={status} />
      </div>
      <div className="divider my-4" />
      <Steps
        items={[
          'In Discord, right-click your channel and choose Edit Channel.',
          'Open Integrations, then Webhooks, then New Webhook.',
          'Click Copy Webhook URL, paste it above and turn the switch on.',
        ]}
      />
    </section>
  );
}
