"use client";

import { useState } from "react";
import { RotateCcw, Unlink } from "lucide-react";

import {
  retryAccountAction,
  syncAccountAction,
  unlinkAccountAction,
} from "@/app/actions/linked-accounts";
import type { LinkedAccount } from "@/lib/api/types";
import { canRetry, canSyncNow, statusLabel, statusLine } from "@/lib/linked-accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccountAction } from "@/hooks/use-account-action";
import { InlineError, ProviderName, StatusIcon } from "./account-parts";
import { SyncNowButton } from "./sync-now-button";
import { UnlinkDialog } from "./unlink-dialog";

// A Linked Account: who it is, how its sync stands, and what can be done.
export function LinkedRow({
  userId,
  account,
  unlocks,
}: {
  userId: string;
  account: LinkedAccount;
  unlocks: number | null;
}) {
  const { run, error, setError, pending } = useAccountAction();
  const [confirming, setConfirming] = useState(false);
  const { provider } = account;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <ProviderName provider={provider} />
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="truncate font-semibold text-foreground">
              {account.display_name || account.external_id}
            </span>
            <Badge className="border-0">
              <StatusIcon status={account.sync_status} />
              {statusLabel(account)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-dim-foreground">
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

      <UnlinkDialog
        provider={provider}
        unlocks={unlocks}
        open={confirming}
        onOpenChange={(open) => {
          if (!pending) setConfirming(open);
        }}
        pending={pending}
        error={error}
        onUnlink={() =>
          run(
            () => unlinkAccountAction(userId, provider, account.id),
            "Couldn't unlink this account.",
            () => setConfirming(false),
          )
        }
      />
    </div>
  );
}
