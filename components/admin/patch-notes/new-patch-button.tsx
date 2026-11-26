"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { createPatchAction } from "@/app/actions/patch-notes";
import { patchEditPath } from "@/lib/patch-notes/editor-paths";
import { Button } from "@/components/ui/button";

// Starts a draft (www#237): the API numbers it at once, and the editor
// opens on it. Its error shows beside the button.
export function NewPatchButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const create = () =>
    start(async () => {
      setError(null);
      try {
        const result = await createPatchAction();
        if (result.ok && result.patch) router.push(patchEditPath(result.patch.number));
        else setError(result.error ?? "That didn't start. Try again.");
      } catch {
        setError("Couldn't reach the site. Check your connection and try again.");
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="highlight" onClick={create} disabled={pending}>
        {pending ? <Loader2 aria-hidden className="motion-safe:animate-spin" /> : <Plus aria-hidden />}
        {pending ? "Starting" : "New Patch"}
      </Button>
      {error && (
        <p role="alert" className="text-[0.875rem] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
