"use client";

import { useActionState } from "react";
import { Upload } from "lucide-react";
import {
  uploadGameImage,
  type UploadGameImageState,
} from "@/app/actions/game-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: UploadGameImageState = {
  status: "idle",
  message: null,
};

const KINDS = { cover: "Cover", artwork: "Artwork", logo: "Logo" };
const ROLES = { true: "Primary", false: "Extra" };

function SelectOptions({ items }: { items: Record<string, string> }) {
  return (
    <SelectContent>
      {Object.entries(items).map(([value, label]) => (
        <SelectItem key={value} value={value}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  );
}

interface GameImageUploadFormProps {
  gameId: number;
}

// Admin-only: the API refuses uploads from anyone else.
export function GameImageUploadForm({ gameId }: GameImageUploadFormProps) {
  const [state, formAction, pending] = useActionState(
    uploadGameImage.bind(null, gameId),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <Select name="kind" items={KINDS} defaultValue="cover">
        <SelectTrigger aria-label="Image kind" className="data-[size=default]:h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectOptions items={KINDS} />
      </Select>
      <Select name="is_primary" items={ROLES} defaultValue="true">
        <SelectTrigger aria-label="Primary or extra image" className="data-[size=default]:h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectOptions items={ROLES} />
      </Select>
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
              : "text-sm text-dim-foreground"
          }
        >
          {state.message}
        </span>
      )}
    </form>
  );
}
