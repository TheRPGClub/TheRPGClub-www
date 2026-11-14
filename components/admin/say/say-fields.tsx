"use client";

import type { GuildChannel } from "@/lib/api/types";
import { guildChannelLabel } from "@/lib/api/guild-channel-label";
import { SAY_CONTENT_MAX } from "@/lib/say";
import type { useSayForm } from "@/hooks/use-say-form";
import { DeskSelect } from "@/components/admin/desk/desk-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export const SAY_LABEL = "font-label block text-[0.82rem] tracking-[0.06em] text-faint-foreground";
export const SAY_HINT = "text-[0.82rem] text-faint-foreground";
const PROBLEM = "text-[0.82rem] text-destructive";

// The say form's fields: the channel, the message link to reply to, and the
// message with its count. A field's problem replaces its hint.
export function SayFields({ channels, f }: { channels: GuildChannel[]; f: ReturnType<typeof useSayForm> }) {
  const length = f.content.trim().length;
  const channelProblem = f.show("channel");
  const linkProblem = f.show("replyLink");
  const contentProblem = f.show("content");
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="block space-y-1.5">
          <span id="say-channel-label" className={SAY_LABEL}>
            Channel
          </span>
          <DeskSelect
            groups={[{ options: channels.map((c) => ({ value: c.channel_id, label: guildChannelLabel(c) })) }]}
            value={f.channelId}
            onValueChange={f.setChannelId}
            placeholder="Pick a text channel..."
            labelledBy="say-channel-label"
            describedBy={channelProblem ? "say-channel-problem" : undefined}
            invalid={!!channelProblem}
            disabled={f.locked}
            onBlur={() => f.touch("channel")}
          />
          {channelProblem && (
            <p id="say-channel-problem" className={PROBLEM}>
              {channelProblem}
            </p>
          )}
        </div>
        <Label variant="frame" className="block space-y-1.5">
          <span className={SAY_LABEL}>Reply to (optional)</span>
          <Input
            name="reply_to_message_link"
            type="url"
            inputMode="url"
            placeholder="https://discord.com/channels/..."
            value={f.replyLink}
            onChange={(e) => f.changeReplyLink(e.target.value)}
            onBlur={() => f.touch("replyLink")}
            disabled={f.locked}
            aria-invalid={linkProblem ? true : undefined}
            aria-describedby="say-link-note"
          />
          <p id="say-link-note" className={linkProblem ? PROBLEM : SAY_HINT}>
            {linkProblem || "Paste a message link to reply to it. Leave it empty to post."}
          </p>
        </Label>
      </div>

      <Label variant="frame" className="block space-y-1.5">
        <span className="flex items-baseline justify-between gap-3">
          <span className={SAY_LABEL}>Message</span>
          <span
            className={cn(
              "font-label text-[0.78rem] tracking-[0.06em] tabular-nums",
              length > SAY_CONTENT_MAX ? "text-destructive" : "text-faint-foreground",
            )}
          >
            {length} / {SAY_CONTENT_MAX}
          </span>
        </span>
        <Textarea
          name="content"
          rows={7}
          className="inline-block min-h-0 px-3 text-[0.95rem] leading-[1.45] field-sizing-fixed md:text-[0.95rem]"
          value={f.content}
          onChange={(e) => f.setContent(e.target.value)}
          onBlur={() => f.touch("content")}
          disabled={f.locked}
          aria-invalid={contentProblem ? true : undefined}
          aria-describedby="say-content-note"
        />
        <p id="say-content-note" className={contentProblem ? PROBLEM : SAY_HINT}>
          {contentProblem || "Line breaks are kept. Member mentions ping; @everyone, @here and roles never do."}
        </p>
      </Label>
    </>
  );
}
