"use client";

import { useActionState } from "react";
import { Upload } from "lucide-react";
import {
  uploadGameImage,
  type UploadGameImageState,
} from "@/app/actions/game-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: UploadGameImageState = {
  status: "idle",
  message: null,
};

interface GameImageUploadFormProps {
  gameId: number;
}

export function GameImageUploadForm({ gameId }: GameImageUploadFormProps) {
  const [state, formAction, pending] = useActionState(
    uploadGameImage.bind(null, gameId),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      {/* Admin-only: the API refuses uploads from anyone else. */}
      <select
        name="kind"
        aria-label="Image kind"
        className="h-9 rounded-sm border border-rule-strong bg-ink-2 px-2 text-sm text-paper outline-none focus-visible:border-paper-mute focus-visible:ring-3 focus-visible:ring-ring/50"
        defaultValue="cover"
      >
        <option value="cover">Cover</option>
        <option value="artwork">Artwork</option>
        <option value="logo">Logo</option>
      </select>
      <select
        name="is_primary"
        aria-label="Primary or extra image"
        className="h-9 rounded-sm border border-rule-strong bg-ink-2 px-2 text-sm text-paper outline-none focus-visible:border-paper-mute focus-visible:ring-3 focus-visible:ring-ring/50"
        defaultValue="true"
      >
        <option value="true">Primary</option>
        <option value="false">Extra</option>
      </select>
      <Input
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        aria-label="Image file"
        className="max-w-64"
      />
      <Button type="submit" variant="outline" disabled={pending}>
        <Upload />
        {pending ? "Uploading" : "Upload"}
      </Button>
      {state.message && (
        <span
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-paper-dim"
          }
        >
          {state.message}
        </span>
      )}
    </form>
  );
}
