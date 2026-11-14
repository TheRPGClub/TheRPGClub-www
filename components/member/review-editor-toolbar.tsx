"use client";

import { KEYS } from "platejs";
import {
  Bold,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SPOILER_KEY } from "@/lib/reviews/spoiler-plugin";
import {
  BlockButton,
  LinkButtons,
  ListButton,
  MarkButton,
} from "./review-composer/toolbar-buttons";

function Divider() {
  return <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />;
}

export interface ReviewEditorToolbarProps {
  className?: string;
  // "compact" is the small editor on a game page: the ways of styling
  // lettering, and nothing else. Structure — headings, lists, quotes, links,
  // spoilers — belongs to the full-page editor, which has the room for it.
  //
  // Only the buttons are withheld. The plugins stay loaded either way, so a
  // review already carrying headings or lists still renders and survives an
  // edit made here.
  variant?: "compact" | "full";
}

export function ReviewEditorToolbar({
  className,
  variant = "full",
}: ReviewEditorToolbarProps) {
  const full = variant === "full";

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className={cn("flex flex-wrap items-center gap-0.5", className)}
    >
      <MarkButton nodeType={KEYS.bold} label="Bold">
        <Bold className="size-4" strokeWidth={2} />
      </MarkButton>
      <MarkButton nodeType={KEYS.italic} label="Italic">
        <Italic className="size-4" strokeWidth={2} />
      </MarkButton>
      <MarkButton nodeType={KEYS.strikethrough} label="Strikethrough">
        <Strikethrough className="size-4" strokeWidth={2} />
      </MarkButton>

      {full && (
        <>
          <LinkButtons />

          <Divider />

          <BlockButton nodeType={KEYS.h1} label="Title">
            <Heading1 className="size-4" strokeWidth={1.75} />
          </BlockButton>
          <BlockButton nodeType={KEYS.h2} label="Heading">
            <Heading2 className="size-4" strokeWidth={1.75} />
          </BlockButton>
          <BlockButton nodeType={KEYS.h3} label="Subheading">
            <Heading3 className="size-4" strokeWidth={1.75} />
          </BlockButton>

          <Divider />

          <ListButton nodeType={KEYS.ulClassic} label="Bulleted list">
            <List className="size-4" strokeWidth={1.75} />
          </ListButton>
          <ListButton nodeType={KEYS.olClassic} label="Numbered list">
            <ListOrdered className="size-4" strokeWidth={1.75} />
          </ListButton>
          <BlockButton nodeType={KEYS.blockquote} label="Quote">
            <Quote className="size-4" strokeWidth={1.75} />
          </BlockButton>

          <Divider />

          <MarkButton nodeType={SPOILER_KEY} label="Spoiler">
            <EyeOff className="size-4" strokeWidth={1.75} />
          </MarkButton>
        </>
      )}
    </div>
  );
}
