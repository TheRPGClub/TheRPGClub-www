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
import { SectionHeading } from "@/components/issue/page-header";
import { EDIT_SELECT_CLASS } from "@/components/member/game-list-editor";
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
    <section aria-label="Socials" className="space-y-4">
      <div className="space-y-2.5">
        <SectionHeading
          title="Socials"
          count={`${socials.length} linked`}
          className="[&_h2]:text-4xl sm:[&_h2]:text-[2.75rem]"
        />
        <p className="text-sm text-paper-mute">
          Handles, friend codes and profiles. Imports from Steam and
          Completionator read the accounts linked here.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <ul className="grid gap-2.5 lg:grid-cols-2">
        {socials.length === 0 && !addingNew && (
          <li className="text-sm text-paper-mute lg:col-span-2">
            No socials yet. Link an account to share your handles.
          </li>
        )}
        {socials.map((social) =>
          editingId === social.id ? (
            <li
              key={social.id}
              className="rounded-md border border-highlight bg-ink-2 p-3 lg:col-span-2"
            >
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
              className="flex min-h-15 items-center gap-3 rounded-md border border-rule bg-ink-2 py-2 pr-2 pl-3.5 text-sm"
            >
              <SocialIcon
                label={social.social_platform?.label}
                className="shrink-0 text-paper-mute"
              />
              <span className="font-label w-24 shrink-0 truncate text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-mute">
                {social.social_platform?.label ?? "Unknown"}
              </span>
              <span className="min-w-0 flex-1">
                {social.url ? (
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-semibold underline-offset-3 hover:text-highlight hover:underline"
                  >
                    {social.display_text}
                  </a>
                ) : (
                  <span className="block truncate font-semibold">
                    {social.display_text}
                  </span>
                )}
              </span>
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
                aria-label={`Edit ${social.social_platform?.label ?? "social"}`}
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(social.id)}
                disabled={pending}
                aria-label={`Delete ${social.social_platform?.label ?? "social"}`}
              >
                <Trash2 />
              </Button>
            </li>
          ),
        )}
        {addingNew ? (
          <li className="rounded-md border border-highlight bg-ink-2 p-3 lg:col-span-2">
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
        ) : (
          <li>
            <button
              type="button"
              onClick={() => {
                setAddingNew(true);
                setEditingId(null);
                setError(null);
              }}
              disabled={pending}
              className="font-label flex min-h-15 w-full items-center justify-center gap-2 rounded-md border border-dashed border-rule-strong text-[0.9rem] font-extrabold tracking-[0.06em] text-paper-dim transition-colors hover:border-highlight hover:text-highlight disabled:opacity-50"
            >
              <Plus aria-hidden className="size-4" />
              Link another account
            </button>
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
            aria-label="New platform name"
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
          aria-label="Platform"
          className={EDIT_SELECT_CLASS}
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
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
