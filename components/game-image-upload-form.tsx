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
      <select
        name="kind"
        className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        defaultValue="cover"
      >
        <option value="cover">Cover</option>
        <option value="artwork">Artwork</option>
        <option value="logo">Logo</option>
      </select>
      <select
        name="is_primary"
        className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        defaultValue="true"
      >
        <option value="true">Primary</option>
        <option value="false">Extra</option>
      </select>
      <Input
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="max-w-64"
      />
      <Button type="submit" disabled={pending} size="sm">
        <Upload />
        {pending ? "Uploading" : "Upload"}
      </Button>
      {state.message && (
        <span
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
        >
          {state.message}
        </span>
      )}
    </form>
  );
}
