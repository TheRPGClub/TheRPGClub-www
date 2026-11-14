import Link from "next/link";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { memberName } from "@/lib/achievements";
import type { useCompletionForm } from "@/hooks/use-completion-form";
import { Button } from "@/components/ui/button";

// Under the form: the send button (and what it still needs), or once sent,
// where the completion went and "Log another".
export function CompletionSend({ f, onRestart }: { f: ReturnType<typeof useCompletionForm>; onRestart: () => void }) {
  if (f.sent) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button type="button" variant="outline" onClick={onRestart}>
          <Plus aria-hidden />
          Log another
        </Button>
        <span className="text-sm text-dim-foreground">
          <CheckCircle2 aria-hidden className="mr-1.5 inline size-4 align-[-3px] text-ok" />
          On{" "}
          <Link
            href={`/members/${f.sent.member.user_id}/completed-games`}
            className="font-semibold text-foreground underline decoration-border-strong underline-offset-3 hover:decoration-highlight"
          >
            {memberName(f.sent.member)}&apos;s completed games
          </Link>
          , and off their Now Playing if it was there.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" disabled={f.pending || !f.member || !f.game}>
        {f.pending && <Loader2 aria-hidden className="animate-spin" />}
        {f.announce ? "Log and announce" : "Log the completion"}
      </Button>
      {(!f.member || !f.game) && <span className="text-sm text-faint-foreground">Pick a member and a game first.</span>}
    </div>
  );
}
