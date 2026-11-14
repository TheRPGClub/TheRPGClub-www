"use client";

import { Plus, Send } from "lucide-react";
import type { GuildChannel } from "@/lib/api/types";
import { useSayForm } from "@/hooks/use-say-form";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { MessageProof } from "@/components/admin/say/message-proof";
import { SAY_HINT, SayFields } from "@/components/admin/say/say-fields";
import { Button } from "@/components/ui/button";

// /admin/say: pick a text channel, write the message, optionally paste the
// link of a message to reply to. The proof beside it shows the message as
// the bot will post it, and is stamped Queued once sent.
export function SayForm({
  channels,
  guildId,
}: {
  channels: GuildChannel[];
  // The club's server id, to refuse a link to another server before sending.
  guildId: string | null;
}) {
  const f = useSayForm(channels, guildId);

  return (
    <div className="mt-6 grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <form onSubmit={f.send} aria-label="Say as the bot" noValidate className="min-w-0 space-y-5">
        <SayFields channels={channels} f={f} />

        {f.error && (
          <p role="alert" className="text-sm text-destructive">
            {f.error}
          </p>
        )}

        {f.sent ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button type="button" variant="outline" onClick={f.sayAnother}>
              <Plus data-icon="inline-start" />
              Say another
            </Button>
            <span className={SAY_HINT}>{"This one's with the bot. Its status is under the proof."}</span>
          </div>
        ) : (
          <Button type="submit" variant="highlight" disabled={f.pending}>
            <Send data-icon="inline-start" />
            {f.pending ? "Sending..." : f.replying ? "Send the reply" : "Send the message"}
          </Button>
        )}
      </form>

      <ProofCard
        jobId={f.sent?.id}
        initialJob={f.sent}
        what="The message"
        overhang
        caption="The proof shows the message as the bot will post it."
      >
        <MessageProof
          channel={f.channelId ? f.channelName(f.channelId) : null}
          content={f.content}
          replyingTo={f.replying?.messageId ?? null}
        />
      </ProofCard>
    </div>
  );
}
