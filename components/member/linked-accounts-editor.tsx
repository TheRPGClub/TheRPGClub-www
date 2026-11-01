"use client";

import { useEffect, useId, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Clock,
  Link2,
  Loader2,
  RefreshCw,
  RotateCcw,
  Unlink,
} from "lucide-react";
import {
  type ActionResult,
  linkAccountAction,
  retryAccountAction,
  syncAccountAction,
  unlinkAccountAction,
} from "@/app/actions/linked-accounts";
import type {
  AchievementProvider,
  AchievementProviderTotals,
  LinkedAccount,
  UserSocial,
} from "@/lib/api/types";
import { PROVIDER_LABEL } from "@/lib/achievements";
import {
  IDENTIFIER_FIELD,
  LINKED_ACCOUNT_PROVIDERS,
  STATUS_LABEL,
  canRetry,
  canSyncNow,
  formatCountdown,
  identifierFromSocials,
  statusLine,
  syncCooldownSeconds,
  unlinkWarning,
  unlockCount,
} from "@/lib/linked-accounts";
import { SectionHeading } from "@/components/issue/page-header";
import { Chip } from "@/components/issue/chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// While an account syncs, re-read the page this often so the row moves on to
// "Last synced" without a manual reload. Each refresh re-renders the whole
// edit page, so ticks are skipped while the tab is hidden and stop after a
// while; a long import shows its result on the next reload.
const PENDING_REFRESH_MS = 15_000;
const PENDING_REFRESH_FOR_MS = 5 * 60_000;

interface LinkedAccountsEditorProps {
  userId: string;
  // Null when the list couldn't be read.
  accounts: LinkedAccount[] | null;
  socials: UserSocial[];
  // Per-Provider totals from the achievements summary, for the unlink
  // warning. Null when unreadable.
  totals: AchievementProviderTotals[] | null;
}

export function LinkedAccountsEditor({
  userId,
  accounts,
  socials,
  totals,
}: LinkedAccountsEditorProps) {
  const router = useRouter();
  const anyPending = accounts?.some((a) => a.sync_status === "pending") ?? false;

  useEffect(() => {
    if (!anyPending) return;
    const stopAt = Date.now() + PENDING_REFRESH_FOR_MS;
    const timer = window.setInterval(() => {
      if (Date.now() >= stopAt) {
        window.clearInterval(timer);
        return;
      }
      if (!document.hidden) router.refresh();
    }, PENDING_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [anyPending, router]);

  const linked = accounts?.length ?? 0;

  return (
    <section aria-label="Linked Accounts" className="space-y-4">
      <div className="space-y-2.5">
        <SectionHeading
          title="Linked Accounts"
          count={`${linked} of ${LINKED_ACCOUNT_PROVIDERS.length} linked`}
          className="[&_h2]:text-4xl sm:[&_h2]:text-[2.75rem]"
        />
        <p className="max-w-[65ch] text-sm text-paper-mute">
          Link your RetroAchievements, Steam and PSN accounts to bring your
          achievements to the hub. The club syncs them four times a day. These
          are separate from your socials.
        </p>
      </div>

      {accounts === null ? (
        <p
          role="alert"
          className="rounded-md border border-dashed border-rule-strong px-4 py-6 text-sm text-paper-mute"
        >
          Your Linked Accounts couldn&rsquo;t be loaded. Reload the page to try again.
        </p>
      ) : (
        <ul className="grid gap-2.5">
          {LINKED_ACCOUNT_PROVIDERS.map((provider) => {
            const account = accounts.find((a) => a.provider === provider);
            return (
              <li
                key={provider}
                className="rounded-md border border-rule bg-ink-2 p-3.5"
              >
                {account ? (
                  <LinkedRow
                    userId={userId}
                    account={account}
                    unlocks={unlockCount(provider, totals)}
                  />
                ) : (
                  <LinkForm
                    userId={userId}
                    provider={provider}
                    initial={identifierFromSocials(provider, socials)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ProviderName({ provider }: { provider: AchievementProvider }) {
  return (
    <span className="font-label block text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-mute">
      {PROVIDER_LABEL[provider]}
    </span>
  );
}

function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 text-sm text-destructive">
      {message}
    </p>
  );
}

function LinkForm({
  userId,
  provider,
  initial,
}: {
  userId: string;
  provider: AchievementProvider;
  initial: string;
}) {
  const router = useRouter();
  const field = IDENTIFIER_FIELD[provider];
  const helpId = useId();
  const [identifier, setIdentifier] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await linkAccountAction(userId, provider, identifier);
      if (!result.ok) {
        setError(result.error ?? "Couldn't link this account.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ProviderName provider={provider} />
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          name="identifier"
          aria-label={field.label}
          aria-describedby={helpId}
          aria-invalid={error ? true : undefined}
          placeholder={field.placeholder}
          autoComplete="off"
          spellCheck={false}
          maxLength={256}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={pending}
        />
        <Button
          type="submit"
          variant="highlight"
          disabled={pending || !identifier.trim()}
        >
          {pending ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Link2 data-icon="inline-start" />
          )}
          Link {PROVIDER_LABEL[provider]}
        </Button>
      </div>
      <p id={helpId} className="mt-1.5 text-[0.82rem] text-paper-mute">
        {field.help}
      </p>
      <InlineError message={error} />
    </form>
  );
}

function StatusIcon({ status }: { status: LinkedAccount["sync_status"] }) {
  const className = "size-3.5 shrink-0";
  switch (status) {
    case "pending":
      return <Loader2 aria-hidden className={`${className} motion-safe:animate-spin`} />;
    case "ok":
      return <Check aria-hidden className={className} />;
    default:
      return <AlertTriangle aria-hidden className={className} />;
  }
}

function LinkedRow({
  userId,
  account,
  unlocks,
}: {
  userId: string;
  account: LinkedAccount;
  unlocks: number | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const { provider } = account;

  const run = (
    action: () => Promise<ActionResult<unknown>>,
    fallback: string,
    onDone?: () => void,
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? fallback);
        // A cooldown answer means the page's sync_available_at is stale.
        if (result.syncAvailableAt) router.refresh();
        return;
      }
      onDone?.();
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <ProviderName provider={provider} />
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="truncate font-semibold text-paper">
              {account.display_name || account.external_id}
            </span>
            <Chip>
              <StatusIcon status={account.sync_status} />
              {STATUS_LABEL[account.sync_status]}
            </Chip>
          </div>
          <p className="mt-1 text-sm text-paper-dim">
            {account.sync_status === "ok" && account.last_synced_at ? (
              <time dateTime={account.last_synced_at}>{statusLine(account)}</time>
            ) : (
              statusLine(account)
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {canRetry(account.sync_status) && (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() =>
                run(
                  () => retryAccountAction(userId, provider, account.id),
                  "Couldn't retry this account.",
                )
              }
            >
              <RotateCcw data-icon="inline-start" />
              Retry
            </Button>
          )}
          {canSyncNow(account.sync_status) && (
            <SyncNowButton
              availableAt={account.sync_available_at}
              disabled={pending}
              onClick={() =>
                run(
                  () => syncAccountAction(userId, provider, account.id),
                  "Couldn't start a sync.",
                )
              }
            />
          )}
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              setError(null);
              setConfirming(true);
            }}
          >
            <Unlink data-icon="inline-start" />
            Unlink
          </Button>
        </div>
      </div>
      <InlineError message={confirming ? null : error} />

      <Dialog
        open={confirming}
        onOpenChange={(open) => {
          if (!pending) setConfirming(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unlink {PROVIDER_LABEL[provider]}?</DialogTitle>
            <DialogDescription>
              {unlinkWarning(provider, unlocks)} You can link the account again
              later, and its history will be imported from scratch.
            </DialogDescription>
          </DialogHeader>
          <InlineError message={error} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Keep it
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() =>
                run(
                  () => unlinkAccountAction(userId, provider, account.id),
                  "Couldn't unlink this account.",
                  () => setConfirming(false),
                )
              }
            >
              {pending ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Unlink data-icon="inline-start" />
              )}
              Unlink
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// A per-second clock, read through an external store so the server render
// and hydration agree (null until the client takes over).
function subscribeClock(onTick: () => void) {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
}
const readClock = () => Math.floor(Date.now() / 1000) * 1000;
const serverClock = () => null;

function SyncNowButton({
  availableAt,
  disabled,
  onClick,
}: {
  availableAt: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const now = useSyncExternalStore(subscribeClock, readClock, serverClock);
  const waiting = now === null ? null : syncCooldownSeconds(availableAt, now);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled || waiting === null || waiting > 0}
      onClick={onClick}
      aria-label={
        waiting ? `Sync now, available in ${formatCountdown(waiting)}` : undefined
      }
    >
      {waiting ? <Clock data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}
      {waiting ? `Sync now in ${formatCountdown(waiting)}` : "Sync now"}
    </Button>
  );
}
