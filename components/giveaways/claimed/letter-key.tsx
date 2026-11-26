"use client";

import { useState } from "react";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { maskKey, redeemLink } from "@/lib/giveaways";
import { Button, ButtonLink } from "@/components/ui/button";
import { CopyKeyButton } from "@/components/giveaways/copy-key-button";

// The key on the letter, in a dashed well: masked until the member reveals
// it (shown at once just after a claim), with Copy and the platform's Redeem.
export function LetterKey({
  value,
  platform,
  title,
  revealed = false,
}: {
  value: string | null | undefined;
  platform: string;
  title: string;
  revealed?: boolean;
}) {
  const [shown, setShown] = useState(revealed);
  if (!value) {
    return (
      <p className="rounded-sm border-[1.5px] border-dashed border-background/60 px-5 py-4 text-slip-muted-foreground">
        {"Couldn't read the key just now. It's still yours: refresh to try again."}
      </p>
    );
  }
  const redeem = redeemLink(platform, value);
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-sm border-[1.5px] border-dashed border-background px-4 py-3.5 sm:px-5">
      <code className="font-label basis-full text-[1.15rem] leading-none tracking-[0.12em] break-all normal-case sm:text-[1.9rem]">
        {shown ? value : maskKey(value)}
      </code>
      <Button
        type="button"
        variant="inverse-outline"
        className="mt-1"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? `Hide the key for ${title}` : `Reveal the key for ${title}`}
      >
        {shown ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
        {shown ? "Hide" : "Reveal"}
      </Button>
      <CopyKeyButton value={value} variant="inverse-outline" label="Copy" />
      {redeem && (
        <ButtonLink render={<a />} href={redeem.href} target="_blank" rel="noreferrer" variant="highlight">
          {redeem.label}
          <ExternalLink data-icon="inline-end" />
        </ButtonLink>
      )}
    </div>
  );
}
