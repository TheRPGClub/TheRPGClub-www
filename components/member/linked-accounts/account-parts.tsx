import { AlertTriangle, Check, Loader2 } from "lucide-react";

import type { AchievementProvider, LinkedAccount } from "@/lib/api/types";
import { PROVIDER_LABEL } from "@/lib/achievements";

// The small pieces every Linked Account row shares.

export function ProviderName({ provider }: { provider: AchievementProvider }) {
  return (
    <span className="font-label block text-[0.82rem] font-extrabold tracking-[0.08em] text-faint-foreground">
      {PROVIDER_LABEL[provider]}
    </span>
  );
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-2 text-sm text-destructive">
      {message}
    </p>
  );
}

export function StatusIcon({ status }: { status: LinkedAccount["sync_status"] }) {
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
