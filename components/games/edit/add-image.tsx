"use client";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import type { ImageKind } from "@/lib/games/game-edit";
import { IMAGE_TYPES, imageFileProblem } from "@/lib/games/game-edit/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { localKey } from "@/lib/local-key";

// A kind's add: picks a file and stages it, or says why it can't be used.
export function AddImage(p: { kind: ImageKind; label: string; onPick: (file: File, key: string) => void; onNote: (note: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        aria-label={p.label}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const problem = imageFileProblem(file);
          p.onNote(problem);
          if (!problem) p.onPick(file, localKey(p.kind));
        }}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
        <ImagePlus />
        {p.label}
      </Button>
    </>
  );
}
