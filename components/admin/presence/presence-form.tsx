"use client";

import { useState, useTransition } from "react";
import { Bot, Plus, Send } from "lucide-react";
import { setPresenceAction } from "@/app/actions/presence";
import type { BotPresence } from "@/lib/api/types";
import { PRESENCE_MAX, validatePresenceName } from "@/lib/presence";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { Button } from "@/components/ui/button";

const LABEL = "font-label block text-[0.82rem] tracking-[0.06em] text-paper-mute";

// Set the bot's "Playing ..." presence, with a proof of how Discord shows
// it. Once sent the proof is stamped and follows the `presence_set` job.
export function PresenceForm({ current }: { current: BotPresence | null }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ presence: BotPresence; jobId: number | null } | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const checked = validatePresenceName(name);
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setPresenceAction(checked.name).catch(() => null);
      if (!result?.ok || !result.data) {
        setError(result?.error ?? "Couldn't reach the club's server. Try again.");
        return;
      }
      setSent({ presence: result.data, jobId: result.jobId ?? null });
    });
  };

  const locked = pending || sent !== null;
  const shown = sent?.presence.activity_name ?? (name.trim() || current?.activity_name || "");

  return (
    <div className="mt-6 grid items-start gap-9 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <form onSubmit={submit} aria-label="Set the bot's presence" className="min-w-0">
        <label htmlFor="presence-name" className={LABEL}>
          Playing
        </label>
        <input
          id="presence-name"
          name="activity_name"
          value={sent ? sent.presence.activity_name : name}
          onChange={(e) => setName(e.target.value)}
          maxLength={PRESENCE_MAX}
          required
          disabled={locked}
          autoComplete="off"
          placeholder={current?.activity_name ?? "What is the bot playing?"}
          className="font-headline block w-full border-0 border-b-2 border-rule-strong bg-transparent pt-1.5 pb-2.5 text-[1.8rem] leading-none text-paper caret-highlight outline-none placeholder:text-paper-mute focus-visible:border-highlight disabled:opacity-70 md:text-[2.4rem]"
        />
        <p className="mt-1 text-right text-[0.8rem] text-paper-mute">
          {name.trim().length} / {PRESENCE_MAX}
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {sent ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSent(null);
                  setName("");
                }}
              >
                <Plus data-icon="inline-start" />
                Set another
              </Button>
              <span className="text-[0.86rem] text-paper-mute">
                {sent.jobId != null
                  ? "Saved. The bot applies it when it picks the job up."
                  : "Saved. No bot job was queued for it."}
              </span>
            </>
          ) : (
            <>
              <Button type="submit" variant="highlight" disabled={pending}>
                <Send data-icon="inline-start" />
                {pending ? "Setting..." : "Set presence"}
              </Button>
              <span className="text-[0.86rem] text-paper-mute">
                The bot shows it at once and keeps it after a restart.
              </span>
            </>
          )}
        </div>
      </form>

      <div className="min-w-0">
        <ProofCard
          jobId={sent?.jobId ?? null}
          what="The presence"
          overhang
          caption="A proof of the member list and profile line."
        >
          <PresenceProof name={shown} />
        </ProofCard>
      </div>
    </div>
  );
}

function PresenceProof({ name }: { name: string }) {
  return (
    <div className="bg-ink-2 p-5 pt-6">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-ink-3 text-paper-dim">
          <Bot className="size-6" />
        </span>
        <div className="min-w-0 pr-24">
          <p className="flex items-center gap-1.5 font-semibold">
            The bot
            <span className="font-label rounded-xs bg-paper/10 px-1.5 text-[0.7rem] tracking-[0.06em] text-paper-dim">
              App
            </span>
          </p>
          <p className="truncate text-[0.85rem] text-paper-dim">
            Playing <b className="font-semibold text-paper">{name || "..."}</b>
          </p>
        </div>
      </div>
      <div className="mt-5 border-t border-rule pt-3">
        <p className={LABEL}>Playing</p>
        <p className="font-headline mt-1 text-[2rem] leading-[0.95] break-words">
          {name || <span className="text-paper-mute">Nothing yet</span>}
        </p>
      </div>
    </div>
  );
}
