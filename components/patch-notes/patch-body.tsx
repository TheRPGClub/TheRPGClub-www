import type { Value } from "platejs";

import { cn } from "@/lib/utils";
import { RichTextContent } from "@/components/rich-text/rich-text-content";
import { patchComponents, type PatchVoice } from "./patch-text-kit";

// A Patch's text in site styling (www#236): bold lead phrases in paper,
// everything else in dim paper; quotes, links and spoilers as the shared
// kit draws them. `value` is already sanitized (and cut, on the card).
export function PatchBody({ value, voice, className }: { value: Value; voice: PatchVoice; className?: string }) {
  return (
    <RichTextContent
      value={value}
      variant={voice === "page" ? "article" : "compact"}
      components={patchComponents(voice)}
      className={cn(
        "text-dim-foreground [&_strong]:font-bold [&_strong]:text-foreground",
        voice === "card" ? "text-[0.9375rem] leading-[1.45]" : "max-w-[68ch] text-[1.0625rem] leading-[1.75] text-foreground/85",
        className,
      )}
    />
  );
}
