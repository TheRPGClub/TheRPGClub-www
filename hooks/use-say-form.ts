"use client";

import { useState, useTransition } from "react";
import { sayAction } from "@/app/actions/superadmin-tools";
import type { BotJob, GuildChannel } from "@/lib/api/types";
import { hasSayProblems, parseMessageLink, validateSay } from "@/lib/say";

type Field = "channel" | "content" | "replyLink";
const UNTOUCHED: Record<Field, boolean> = { channel: false, content: false, replyLink: false };

// The say form's state: the channel, the reply link and the message, their
// problems (shown once the form was tried or the field left), and the job
// once sent. A pasted link picks its channel when none is chosen yet.
export function useSayForm(channels: GuildChannel[], guildId: string | null) {
  const [channelId, setChannelId] = useState("");
  const [replyLink, setReplyLink] = useState("");
  const [content, setContent] = useState("");
  const [touched, setTouched] = useState(UNTOUCHED);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<BotJob | null>(null);
  const [pending, startTransition] = useTransition();

  const channelById = (id: string) => channels.find((c) => c.channel_id === id);
  const channelName = (id: string) => {
    const channel = channelById(id);
    return channel ? `#${channel.name}` : "that channel";
  };
  const problems = validateSay({ channelId, content, replyLink }, channelName, guildId);

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
    setTouched(UNTOUCHED);
  };

  return {
    channelId,
    setChannelId,
    replyLink,
    changeReplyLink,
    content,
    setContent,
    touch: (field: Field) => setTouched((t) => ({ ...t, [field]: true })),
    // The field's problem, once it should show.
    show: (field: Field) => (touched[field] && problems[field]) || null,
    replying: replyLink.trim() !== "" && !problems.replyLink ? parseMessageLink(replyLink) : null,
    channelName,
    error,
    sent,
    pending,
    locked: pending || sent !== null,
    send,
    sayAnother,
  };
}
