"use client";

import { Calendar, ChevronDown, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// A setting written as a word in the rule sentence (surface brief
// challenges-form, 5D): underlined, it opens its control beneath the
// sentence; Escape there closes it. While open it wears the yellow wash; an
// invalid one is underlined in signal orange. Once the rules are locked it
// is plain type with a lock.
export function RuleWord({
  children,
  label,
  open,
  invalid,
  locked,
  icon = "chevron",
  onToggle,
  controls,
}: {
  children: React.ReactNode;
  // What the word sets, for a screen reader ("Games to Clear").
  label: string;
  open: boolean;
  invalid?: boolean;
  locked?: boolean;
  icon?: "chevron" | "calendar";
  onToggle: () => void;
  controls: string;
}) {
  const Icon = locked ? Lock : icon === "calendar" ? Calendar : ChevronDown;
  return (
    <Button
      type="button"
      variant="rule-word"
      size="inline"
      aria-expanded={locked ? undefined : open}
      aria-controls={locked ? undefined : controls}
      aria-invalid={invalid || undefined}
      aria-label={`${label}: ${typeof children === "string" ? children : ""}`.replace(/: $/, "")}
      disabled={locked}
      onClick={onToggle}
      className="mx-0.5 inline-flex items-center gap-2 leading-[1.15] whitespace-nowrap [&_svg]:size-[0.5em]"
    >
      {children}
      <Icon aria-hidden className="opacity-60" />
    </Button>
  );
}

// A source in the sentence ("Final Fantasy ×"): the word opens the search,
// the cross takes it out of the Pool.
export function SourceWord({
  name,
  open,
  locked,
  onToggle,
  onRemove,
  controls,
}: {
  name: string;
  open: boolean;
  locked: boolean;
  onToggle: () => void;
  onRemove: () => void;
  controls: string;
}) {
  return (
    <span className="inline-flex items-center whitespace-nowrap">
      <RuleWord label="Built from" open={open} locked={locked} onToggle={onToggle} controls={controls}>
        {name}
      </RuleWord>
      {!locked && (
        <Button
          type="button"
          variant="chip-remove"
          size="icon-sm"
          aria-label={`Take ${name} out of the Pool`}
          onClick={onRemove}
          className="-ml-0.5 mr-1 [&_svg]:size-[0.55em]"
        >
          <X aria-hidden />
        </Button>
      )}
    </span>
  );
}
