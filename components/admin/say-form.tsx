"use client";

import { useState, useTransition } from "react";
import { Bot, CornerUpLeft, Plus, Send } from "lucide-react";
import { sayAction } from "@/app/actions/superadmin-tools";
import type { BotJob, GuildChannel } from "@/lib/api/types";
import { guildChannelLabel } from "@/lib/api/guild-channel-label";
import { hasSayProblems, parseMessageLink, SAY_CONTENT_MAX, validateSay } from "@/lib/say";
import { EDIT_SELECT_CLASS } from "@/components/member/game-list-editor";
import { ProofCard } from "@/components/admin/desk/proof-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LABEL = "font-label block text-[0.82rem] tracking-[0.06em] text-faint-foreground";
const HINT = "text-[0.82rem] text-faint-foreground";
const PROBLEM = "text-[0.82rem] text-destructive";

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
  const [channelId, setChannelId] = useState("");
  const [replyLink, setReplyLink] = useState("");
  const [content, setContent] = useState("");
  // Field problems show once the form has been tried, or the field left.
  const [touched, setTouched] = useState({
    channel: false,
    content: false,
    replyLink: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<BotJob | null>(null);
  const [pending, startTransition] = useTransition();

  const channelById = (id: string) => channels.find((c) => c.channel_id === id);
  const channelName = (id: string) => {
    const channel = channelById(id);
    return channel ? `#${channel.name}` : "that channel";
  };
  const problems = validateSay({ channelId, content, replyLink }, channelName, guildId);
  const locked = pending || sent !== null;
  const length = content.trim().length;

  // A pasted link picks its channel when none is chosen yet.
  const changeReplyLink = (value: string) => {
    setReplyLink(value);
    const parsed = parseMessageLink(value);
    if (parsed && !channelId && channelById(parsed.channelId)) setChannelId(parsed.channelId);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ channel: true, content: true, replyLink: true });
    if (hasSayProblems(problems)) return;
    setError(null);
    startTransition(async () => {
      const result = await sayAction({ channelId, content, replyLink }).catch(() => null);
      if (!result?.ok || !result.job) {
        setError(result?.error ?? "Lost touch with the club's server. Try again.");
        return;
      }
      setSent(result.job);
    });
  };

  const sayAnother = () => {
    setSent(null);
    setContent("");
    setReplyLink("");
    setTouched({ channel: false, content: false, replyLink: false });
  };

  const show = (field: keyof typeof touched) => touched[field] && problems[field];
  const replying =
    replyLink.trim() !== "" && !problems.replyLink ? parseMessageLink(replyLink) : null;

  return (
    <div className="mt-6 grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <form onSubmit={send} aria-label="Say as the bot" noValidate className="min-w-0 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className={LABEL}>Channel</span>
            <select
              name="channel_id"
              className={EDIT_SELECT_CLASS}
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, channel: true }))}
              disabled={locked}
              aria-invalid={show("channel") ? true : undefined}
              aria-describedby={show("channel") ? "say-channel-problem" : undefined}
            >
              <option value="" disabled>
                Pick a text channel...
              </option>
              {channels.map((c) => (
                <option key={c.channel_id} value={c.channel_id}>
                  {guildChannelLabel(c)}
                </option>
              ))}
            </select>
            {show("channel") && (
              <p id="say-channel-problem" className={PROBLEM}>
                {problems.channel}
              </p>
            )}
          </label>
          <label className="block space-y-1.5">
            <span className={LABEL}>Reply to (optional)</span>
            <Input
              name="reply_to_message_link"
              type="url"
              inputMode="url"
              placeholder="https://discord.com/channels/..."
              value={replyLink}
              onChange={(e) => changeReplyLink(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, replyLink: true }))}
              disabled={locked}
              aria-invalid={show("replyLink") ? true : undefined}
              aria-describedby="say-link-note"
            />
            <p id="say-link-note" className={show("replyLink") ? PROBLEM : HINT}>
              {show("replyLink") || "Paste a message link to reply to it. Leave it empty to post."}
            </p>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="flex items-baseline justify-between gap-3">
            <span className={LABEL}>Message</span>
            <span
              className={cn(
                "font-label text-[0.78rem] tracking-[0.06em] tabular-nums",
                length > SAY_CONTENT_MAX ? "text-destructive" : "text-faint-foreground",
              )}
            >
              {length} / {SAY_CONTENT_MAX}
            </span>
          </span>
          <textarea
            name="content"
            rows={7}
            className="w-full min-w-0 rounded-sm border border-border bg-card px-3 py-2 text-[0.95rem] leading-[1.45] text-foreground caret-highlight outline-none focus-visible:border-faint-foreground focus-visible:ring-2 focus-visible:ring-highlight/40 disabled:opacity-60 aria-invalid:border-destructive"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, content: true }))}
            disabled={locked}
            aria-invalid={show("content") ? true : undefined}
            aria-describedby="say-content-note"
          />
          <p id="say-content-note" className={show("content") ? PROBLEM : HINT}>
            {show("content") ||
              "Line breaks are kept. Member mentions ping; @everyone, @here and roles never do."}
          </p>
        </label>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {sent ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Button type="button" variant="outline" onClick={sayAnother}>
              <Plus data-icon="inline-start" />
              Say another
            </Button>
            <span className={HINT}>
              {"This one's with the bot. Its status is under the proof."}
            </span>
          </div>
        ) : (
          <Button type="submit" variant="highlight" disabled={pending}>
            <Send data-icon="inline-start" />
            {pending ? "Sending..." : replying ? "Send the reply" : "Send the message"}
          </Button>
        )}
      </form>

      <ProofCard
        jobId={sent?.id}
        initialJob={sent}
        what="The message"
        overhang
        caption="The proof shows the message as the bot will post it."
      >
        <MessageProof
          channel={channelId ? channelName(channelId) : null}
          content={content}
          replyingTo={replying?.messageId ?? null}
        />
      </ProofCard>
    </div>
  );
}

// The message as Discord will show it: the bot's name, the reply line when
// it answers a message, and the text with its line breaks.
function MessageProof({
  channel,
  content,
  replyingTo,
}: {
  channel: string | null;
  content: string;
  replyingTo: string | null;
}) {
  const text = content.trim();
  return (
    <div className="bg-card p-5">
      <p className="font-label text-[0.85rem] tracking-[0.08em] text-dim-foreground">
        {replyingTo ? "Reply" : "Message"} · {channel ?? "No channel yet"}
      </p>
      <div className="mt-4 border-t border-border pt-4">
        {replyingTo && (
          <p className="mb-1.5 flex items-center gap-1.5 pl-1 text-[0.82rem] text-faint-foreground">
            <CornerUpLeft aria-hidden className="size-3.5 shrink-0" />
            <span className="min-w-0 truncate">Replying to message {replyingTo}</span>
          </p>
        )}
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-muted text-dim-foreground">
            <Bot aria-hidden className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <span className="font-semibold">The bot</span>
              <span className="font-label rounded-xs bg-muted px-1.5 pt-0.5 text-[0.68rem] tracking-[0.06em] text-dim-foreground">
                App
              </span>
            </p>
            {text ? (
              <p className="mt-1 text-[0.95rem] leading-[1.45] break-words whitespace-pre-wrap">
                {text}
              </p>
            ) : (
              <p className="mt-1 text-[0.95rem] text-faint-foreground italic">Your message shows here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
