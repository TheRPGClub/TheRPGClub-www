"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Copies a key to the clipboard, and says so for a moment.
export function CopyKeyButton({
  value,
  size = "default",
  variant = "highlight",
  label = "Copy key",
}: {
  value: string;
  size?: "default" | "sm";
  variant?: "highlight" | "outline";
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  };

  return (
    <Button type="button" variant={variant} size={size} onClick={copy} aria-live="polite">
      {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
      {copied ? "Copied" : failed ? "Select and copy it" : label}
    </Button>
  );
}
