"use client";

import type {
  AchievementProviderTotals,
  LinkedAccount,
  UserSocial,
} from "@/lib/api/types";
import { ACHIEVEMENT_PROVIDERS } from "@/lib/achievements";
import { identifierFromSocials, unlockCount } from "@/lib/linked-accounts";
import { SectionHeading } from "@/components/templates/page-header";
import { usePendingRefresh } from "@/hooks/use-pending-refresh";
import { LinkForm } from "./linked-accounts/link-form";
import { LinkedRow } from "./linked-accounts/linked-row";

// While an account syncs, re-read the page this often so the row moves on to
// "Last synced" without a manual reload, for this long at most.
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
  const anyPending = accounts?.some((a) => a.sync_status === "pending") ?? false;
  usePendingRefresh(anyPending, PENDING_REFRESH_MS, PENDING_REFRESH_FOR_MS);

  const linked = accounts?.length ?? 0;

  return (
    <section aria-label="Linked Accounts" className="space-y-4">
      <div className="space-y-2.5">
        <SectionHeading
          title="Linked Accounts"
          count={`${linked} of ${ACHIEVEMENT_PROVIDERS.length} linked`}
          className="[&_h2]:text-4xl sm:[&_h2]:text-[2.75rem]"
        />
        <p className="max-w-[65ch] text-sm text-faint-foreground">
          Link your RetroAchievements, Steam and PSN accounts to bring your
          achievements to the hub. The club syncs them four times a day. These
          are separate from your socials.
        </p>
      </div>

      {accounts === null ? (
        <p
          role="alert"
          className="rounded-md border border-dashed border-border-strong px-4 py-6 text-sm text-faint-foreground"
        >
          Your Linked Accounts couldn&rsquo;t be loaded. Reload the page to try again.
        </p>
      ) : (
        <ul className="grid gap-2.5">
          {ACHIEVEMENT_PROVIDERS.map((provider) => {
            const account = accounts.find((a) => a.provider === provider);
            return (
              <li
                key={provider}
                className="rounded-md border border-border bg-card p-3.5"
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
