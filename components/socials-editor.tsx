"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import {
  createSocialPlatformAction,
  createUserSocialAction,
  deleteUserSocialAction,
  updateUserSocialAction,
} from "@/app/actions/socials";
import type { SocialPlatform, UserSocial } from "@/lib/api/types";
import { SocialIcon } from "@/components/social-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SocialsEditorProps {
  userId: string;
  socials: UserSocial[];
  platforms: SocialPlatform[];
}

const NEW_PLATFORM_OPTION = "__new__";

type DraftSocial = {
  platform_id: number | null;
  display_text: string;
  url: string;
};

const emptyDraft: DraftSocial = {
  platform_id: null,
  display_text: "",
  url: "",
};

export function SocialsEditor({ userId, socials, platforms }: SocialsEditorProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = () => {
    setError(null);
    startTransition(() => router.refresh());
  };

  const handleDelete = (socialId: number) => {
    if (!confirm("Delete this social?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteUserSocialAction(socialId, userId);
      if (!result.ok) {
        setError(result.error ?? "Failed to delete.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <section className="w-full space-y-3 border-t pt-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Socials
        </h3>
        {!addingNew && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAddingNew(true);
              setEditingId(null);
              setError(null);
            }}
            disabled={pending}
          >
            <Plus />
            Add
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <ul className="divide-y rounded-lg border">
        {socials.length === 0 && !addingNew && (
          <li className="px-4 py-3 text-sm text-muted-foreground">
            No socials yet. Click Add to share your handles.
          </li>
        )}
        {socials.map((social) =>
          editingId === social.id ? (
            <li key={social.id} className="p-3">
              <SocialForm
                userId={userId}
                platforms={platforms}
                initial={{
                  platform_id: social.platform_id,
                  display_text: social.display_text,
                  url: social.url ?? "",
                }}
                socialId={social.id}
                onCancel={() => setEditingId(null)}
                onDone={() => {
                  setEditingId(null);
                  refresh();
                }}
                onError={setError}
                pending={pending}
                startTransition={startTransition}
              />
            </li>
          ) : (
            <li
              key={social.id}
              className="flex items-center gap-3 px-3 py-2 text-sm"
            >
              <SocialIcon
                label={social.social_platform?.label}
                className="shrink-0 text-muted-foreground"
              />
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {social.social_platform?.label ?? "Unknown"}
                </span>
                {social.url ? (
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate underline-offset-2 hover:underline"
                  >
                    {social.display_text}
                  </a>
                ) : (
                  <span className="truncate">{social.display_text}</span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setEditingId(social.id);
                  setAddingNew(false);
                  setError(null);
                }}
                disabled={pending}
                aria-label="Edit"
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(social.id)}
                disabled={pending}
                aria-label="Delete"
              >
                <Trash2 />
              </Button>
            </li>
          ),
        )}
        {addingNew && (
          <li className="p-3">
            <SocialForm
              userId={userId}
              platforms={platforms}
              initial={emptyDraft}
              socialId={null}
              onCancel={() => setAddingNew(false)}
              onDone={() => {
                setAddingNew(false);
                refresh();
              }}
              onError={setError}
              pending={pending}
              startTransition={startTransition}
            />
          </li>
        )}
      </ul>
    </section>
  );
}

interface SocialFormProps {
  userId: string;
  platforms: SocialPlatform[];
  initial: DraftSocial;
  socialId: number | null;
  onCancel: () => void;
  onDone: () => void;
  onError: (message: string | null) => void;
  pending: boolean;
  startTransition: (cb: () => void | Promise<void>) => void;
}

function SocialForm({
  userId,
  platforms,
  initial,
  socialId,
  onCancel,
  onDone,
  onError,
  pending,
  startTransition,
}: SocialFormProps) {
  const [platformId, setPlatformId] = useState<number | null>(initial.platform_id);
  const [displayText, setDisplayText] = useState(initial.display_text);
  const [url, setUrl] = useState(initial.url);
  const [newPlatformMode, setNewPlatformMode] = useState(false);
  const [newPlatformLabel, setNewPlatformLabel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);

    startTransition(async () => {
      let resolvedPlatformId = platformId;

      if (newPlatformMode) {
        const trimmed = newPlatformLabel.trim();
        if (!trimmed) {
          onError("Enter a name for the new platform.");
          return;
        }
        const result = await createSocialPlatformAction(trimmed);
        if (!result.ok || !result.data) {
          onError(result.error ?? "Failed to create platform.");
          return;
        }
        resolvedPlatformId = result.data.id;
      }

      if (!resolvedPlatformId) {
        onError("Pick a platform.");
        return;
      }

      const payload = {
        platform_id: resolvedPlatformId,
        display_text: displayText,
        url: url.trim() || null,
      };

      const result =
        socialId === null
          ? await createUserSocialAction(userId, payload)
          : await updateUserSocialAction(socialId, userId, payload);

      if (!result.ok) {
        onError(result.error ?? "Failed to save.");
        return;
      }
      onDone();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
      {newPlatformMode ? (
        <div className="flex gap-1">
          <Input
            type="text"
            placeholder="e.g. Bluesky"
            maxLength={80}
            value={newPlatformLabel}
            onChange={(e) => setNewPlatformLabel(e.target.value)}
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setNewPlatformMode(false);
              setNewPlatformLabel("");
            }}
            aria-label="Cancel new platform"
          >
            <X />
          </Button>
        </div>
      ) : (
        <select
          name="platform_id"
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={platformId ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v === NEW_PLATFORM_OPTION) {
              setNewPlatformMode(true);
              setPlatformId(null);
            } else {
              setPlatformId(v ? Number(v) : null);
            }
          }}
        >
          <option value="" disabled>
            Platform…
          </option>
          {platforms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          <option value={NEW_PLATFORM_OPTION}>+ Add new platform…</option>
        </select>
      )}
      <Input
        type="text"
        placeholder="Display text (gamertag, friend code, …)"
        maxLength={80}
        required
        value={displayText}
        onChange={(e) => setDisplayText(e.target.value)}
      />
      <Input
        type="url"
        placeholder="https://… (optional)"
        maxLength={512}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="flex gap-1">
        <Button type="submit" variant="default" size="icon-sm" disabled={pending} aria-label="Save">
          <Check />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onCancel}
          disabled={pending}
          aria-label="Cancel"
        >
          <X />
        </Button>
      </div>
    </form>
  );
}
