"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  createSocialPlatformAction,
  createUserSocialAction,
  updateUserSocialAction,
} from "@/app/actions/socials";
import type { SocialPlatform } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlatformField } from "@/components/socials/platform-field";

export type DraftSocial = {
  platform_id: number | null;
  display_text: string;
  url: string;
};

interface SocialFormProps {
  userId: string;
  platforms: SocialPlatform[];
  initial: DraftSocial;
  // null adds a new social; otherwise the one being edited.
  socialId: number | null;
  onCancel: () => void;
  onDone: () => void;
  onError: (message: string | null) => void;
  pending: boolean;
  startTransition: (cb: () => void | Promise<void>) => void;
}

// One social's fields: platform, display text and an optional link. A new
// platform is created first, then the social is saved with it.
export function SocialForm(props: SocialFormProps) {
  const { userId, platforms, initial, socialId, onCancel, onDone, onError, pending, startTransition } = props;
  const [platformId, setPlatformId] = useState<number | null>(initial.platform_id);
  const [displayText, setDisplayText] = useState(initial.display_text);
  const [url, setUrl] = useState(initial.url);
  const [newLabel, setNewLabel] = useState<string | null>(null);

  const save = async () => {
    let resolvedPlatformId = platformId;
    if (newLabel !== null) {
      const trimmed = newLabel.trim();
      if (!trimmed) return onError("Enter a name for the new platform.");
      const result = await createSocialPlatformAction(trimmed);
      if (!result.ok || !result.data) return onError(result.error ?? "Failed to create platform.");
      resolvedPlatformId = result.data.id;
    }
    if (!resolvedPlatformId) return onError("Pick a platform.");

    const payload = { platform_id: resolvedPlatformId, display_text: displayText, url: url.trim() || null };
    const result =
      socialId === null
        ? await createUserSocialAction(userId, payload)
        : await updateUserSocialAction(socialId, userId, payload);
    if (!result.ok) return onError(result.error ?? "Failed to save.");
    onDone();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    startTransition(save);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <PlatformField
        platforms={platforms}
        platformId={platformId}
        onPlatformChange={setPlatformId}
        newLabel={newLabel}
        onNewLabelChange={setNewLabel}
      />
      <Input
        type="text"
        placeholder="Display text (gamertag, friend code, …)"
        aria-label="Display text"
        maxLength={80}
        required
        value={displayText}
        onChange={(e) => setDisplayText(e.target.value)}
      />
      <Input
        type="url"
        placeholder="https://… (optional)"
        aria-label="Link"
        maxLength={512}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="flex gap-1">
        <Button type="submit" variant="highlight" disabled={pending}>
          <Check data-icon="inline-start" />
          Save
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
