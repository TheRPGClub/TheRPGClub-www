"use client";

import { useId, useState } from "react";
import type { Platform } from "@/lib/api/types";
import { useCompletionForm } from "@/hooks/use-completion-form";
import { CompletionFields, COMPLETION_LABEL } from "@/components/admin/completions/completion-fields";
import { CompletionProof } from "@/components/admin/completions/completion-proof";
import { CompletionProofPanel } from "@/components/admin/completions/completion-proof-panel";
import { CompletionSend } from "@/components/admin/completions/completion-send";
import { MemberPicker } from "@/components/admin/member-picker";
import { GamePicker } from "@/components/member/game-picker";

export interface CompletionForMemberFormProps {
  // The signed-in Superadmin, as the bot names them in the post.
  actorName: string;
  platforms: Platform[];
  igdbBlockedReason: string | null;
}

// The Superadmin's Game Completion for another member: member and game on
// the left with the usual completion fields and the announce option, the
// proof of the bot's post on the right. Once sent the proof is stamped and
// follows the announcement job; "Log another" starts a fresh form.
export function CompletionForMemberForm(props: CompletionForMemberFormProps) {
  const [round, setRound] = useState(0);
  return <CompletionForm key={round} {...props} onRestart={() => setRound((n) => n + 1)} />;
}

function CompletionForm({
  actorName,
  platforms,
  igdbBlockedReason,
  onRestart,
}: CompletionForMemberFormProps & { onRestart: () => void }) {
  const memberLabelId = useId();
  const f = useCompletionForm(actorName);
  const game = f.game;

  return (
    <div className="mt-6 grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <form onSubmit={f.submit} className="min-w-0 space-y-6" aria-describedby={f.error ? "completion-error" : undefined}>
        <div>
          <span id={memberLabelId} className={COMPLETION_LABEL}>
            Member
          </span>
          <MemberPicker value={f.member} onChange={f.pickMember} disabled={f.locked} autoFocus labelId={memberLabelId} />
        </div>

        <div className="space-y-1.5">
          <span className={COMPLETION_LABEL}>Game</span>
          {f.locked && game ? (
            <p className="flex h-9 items-center rounded-sm border border-border bg-muted px-3 text-sm font-semibold">
              {game.title}
            </p>
          ) : (
            <GamePicker
              compact
              onPick={f.pickGame}
              initialSelection={game}
              placeholder="Search games…"
              igdbFallback={{ listLabel: "Completed games", blockedReason: igdbBlockedReason }}
            />
          )}
        </div>

        <CompletionFields platforms={platforms} f={f} />

        {f.error && (
          <p id="completion-error" role="alert" className="text-sm text-destructive">
            {f.error}
          </p>
        )}

        <CompletionSend f={f} onRestart={onRestart} />
      </form>

      <div className="min-w-0 lg:sticky lg:top-6">
        <CompletionProofPanel sent={f.sent} announce={f.announce}>
          <CompletionProof
            announcement={f.announcement}
            title={game?.title ?? null}
            coverUrl={game?.cover_url ?? null}
            muted={!f.announce}
          />
        </CompletionProofPanel>
      </div>
    </div>
  );
}
