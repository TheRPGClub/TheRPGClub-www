"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { maskKey } from "@/lib/giveaways";
import { Button } from "@/components/ui/button";
import { CopyKeyButton } from "@/components/giveaways/copy-key-button";

// A claimed key in the table: masked until the member asks to see it.
export function ClaimedKeyCell({ value, title }: { value: string | null | undefined; title: string }) {
  const [shown, setShown] = useState(false);
  if (!value) return <span className="text-sm text-paper-mute">Not readable here</span>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="font-label mr-1 text-[0.95rem] tracking-[0.14em] break-all text-paper-dim normal-case">
        {shown ? value : maskKey(value)}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? `Hide the key for ${title}` : `Show the key for ${title}`}
      >
        {shown ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
        {shown ? "Hide" : "Show"}
      </Button>
      <CopyKeyButton value={value} size="sm" variant="outline" label="Copy" />
    </div>
  );
}
