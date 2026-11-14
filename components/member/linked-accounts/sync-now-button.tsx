"use client";

import { useSyncExternalStore } from "react";
import { Clock, RefreshCw } from "lucide-react";

import { formatCountdown, syncCooldownSeconds } from "@/lib/linked-accounts";
import { Button } from "@/components/ui/button";

// A per-second clock, read through an external store so the server render
// and hydration agree (null until the client takes over).
function subscribeClock(onTick: () => void) {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
}
const readClock = () => Math.floor(Date.now() / 1000) * 1000;
const serverClock = () => null;

// "Sync now", counting down while the Provider's cooldown runs.
export function SyncNowButton({
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
