"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { UserSocial } from "@/lib/api/types";
import { SocialIcon } from "@/components/social-icon";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

// A linked social as a row: its platform, the handle (a link when it has
// one), and edit and delete (after a confirm). `onDelete` answers with an
// error to show in the confirm, or null once the social is gone.
export function SocialRow({
  social,
  pending,
  onEdit,
  onDelete,
}: {
  social: UserSocial;
  pending: boolean;
  onEdit: () => void;
  onDelete: () => Promise<string | null>;
}) {
  const platform = social.social_platform?.label;
  return (
    <li className="flex min-h-15 items-center gap-3 rounded-md border border-border bg-card py-2 pr-2 pl-3.5 text-sm">
      <SocialIcon label={platform} className="shrink-0 text-faint-foreground" />
      <span className="font-label w-24 shrink-0 truncate text-[0.82rem] font-extrabold tracking-[0.08em] text-faint-foreground">
        {platform ?? "Unknown"}
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
          <span className="block truncate font-semibold">{social.display_text}</span>
        )}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onEdit}
        disabled={pending}
        aria-label={`Edit ${platform ?? "social"}`}
      >
        <Pencil />
      </Button>
      <ConfirmDialog
        trigger={
          <Button type="button" variant="ghost" size="icon-sm" disabled={pending} aria-label={`Delete ${platform ?? "social"}`}>
            <Trash2 />
          </Button>
        }
        title="Delete this social?"
        description={`${platform ?? "This social"} comes off your profile.`}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        onConfirm={onDelete}
      />
    </li>
  );
}
