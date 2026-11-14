"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { deleteUserSocialAction } from "@/app/actions/socials";
import type { SocialPlatform, UserSocial } from "@/lib/api/types";
import { SectionHeading } from "@/components/templates/page-header";
import { Button } from "@/components/ui/button";
import { SocialForm, type DraftSocial } from "@/components/socials/social-form";
import { SocialRow } from "@/components/socials/social-row";

interface SocialsEditorProps {
  userId: string;
  socials: UserSocial[];
  platforms: SocialPlatform[];
}

const emptyDraft: DraftSocial = { platform_id: null, display_text: "", url: "" };

// The member's socials on their profile edit: each one as a row that opens
// into its form, and a slot at the end that adds another.
export function SocialsEditor({ userId, socials, platforms }: SocialsEditorProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const open = (id: number | null, adding: boolean) => {
    setEditingId(id);
    setAddingNew(adding);
    setError(null);
  };
  const done = () => {
    open(null, false);
    startTransition(() => router.refresh());
  };
  // After the row's confirm: an error stays in the confirm.
  const handleDelete = async (socialId: number) => {
    setError(null);
    const result = await deleteUserSocialAction(socialId, userId);
    if (!result.ok) return result.error ?? "Failed to delete.";
    startTransition(() => router.refresh());
    return null;
  };
  const form = (key: string, initial: DraftSocial, socialId: number | null, onCancel: () => void) => (
    <li key={key} className="rounded-md border border-highlight bg-card p-3 lg:col-span-2">
      <SocialForm
        userId={userId}
        platforms={platforms}
        initial={initial}
        socialId={socialId}
        onCancel={onCancel}
        onDone={done}
        onError={setError}
        pending={pending}
        startTransition={startTransition}
      />
    </li>
  );

  return (
    <section aria-label="Socials" className="space-y-4">
      <div className="space-y-2.5">
        <SectionHeading
          title="Socials"
          count={`${socials.length} linked`}
          className="[&_h2]:text-4xl sm:[&_h2]:text-[2.75rem]"
        />
        <p className="text-sm text-faint-foreground">
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
          <li className="text-sm text-faint-foreground lg:col-span-2">
            No socials yet. Link an account to share your handles.
          </li>
        )}
        {socials.map((social) =>
          editingId === social.id ? (
            form(
              String(social.id),
              { platform_id: social.platform_id, display_text: social.display_text, url: social.url ?? "" },
              social.id,
              () => setEditingId(null),
            )
          ) : (
            <SocialRow
              key={social.id}
              social={social}
              pending={pending}
              onEdit={() => open(social.id, false)}
              onDelete={() => handleDelete(social.id)}
            />
          ),
        )}
        {addingNew ? (
          form("new", emptyDraft, null, () => setAddingNew(false))
        ) : (
          <li>
            <Button
              type="button"
              variant="add"
              onClick={() => open(null, true)}
              disabled={pending}
              className="flex min-h-15 w-full gap-2 px-0 text-[0.9rem]"
            >
              <Plus aria-hidden className="size-4" />
              Link another account
            </Button>
          </li>
        )}
      </ul>
    </section>
  );
}
