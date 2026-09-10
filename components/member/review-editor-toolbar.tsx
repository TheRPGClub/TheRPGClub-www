"use client";

import { unwrapLink, upsertLink } from "@platejs/link";
import {
  useListToolbarButton,
  useListToolbarButtonState,
} from "@platejs/list-classic/react";
import { KEYS } from "platejs";
// platejs/react re-exports @platejs/utils/react, where the toolbar hooks live.
import {
  useEditorRef,
  useEditorSelector,
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from "platejs/react";
import {
  Bold,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SPOILER_KEY } from "@/lib/reviews/spoiler-plugin";

// Built on the project's own button styling rather than Plate's shadcn
// registry, which is Radix-based — this app is on @base-ui/react.

interface ToolbarButtonProps {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

function ToolbarButton({
  label,
  pressed,
  disabled,
  onClick,
  onMouseDown,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      // Without this the editor loses its selection the moment the button
      // takes focus, and the transform has nothing to act on.
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown?.(e);
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        pressed && "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function MarkButton({
  nodeType,
  label,
  children,
}: {
  nodeType: string;
  label: string;
  children: React.ReactNode;
}) {
  const state = useMarkToolbarButtonState({ nodeType });
  const { props } = useMarkToolbarButton(state);
  return (
    <ToolbarButton label={label} {...props}>
      {children}
    </ToolbarButton>
  );
}

function BlockButton({
  nodeType,
  label,
  children,
}: {
  nodeType: string;
  label: string;
  children: React.ReactNode;
}) {
  const editor = useEditorRef();
  const pressed = useEditorSelector(
    (ed) => ed.api.block()?.[0]?.type === nodeType,
    [nodeType],
  );

  return (
    <ToolbarButton
      label={label}
      pressed={pressed}
      onClick={() => {
        // Every block plugin exposes `toggle`, keyed by its own type.
        const tf = editor.tf as unknown as Record<
          string,
          { toggle?: () => void } | undefined
        >;
        tf[nodeType]?.toggle?.();
      }}
    >
      {children}
    </ToolbarButton>
  );
}

function ListButton({
  nodeType,
  label,
  children,
}: {
  nodeType: string;
  label: string;
  children: React.ReactNode;
}) {
  const state = useListToolbarButtonState({ nodeType });
  const { props } = useListToolbarButton(state);
  return (
    <ToolbarButton label={label} {...props}>
      {children}
    </ToolbarButton>
  );
}

function LinkButtons() {
  const editor = useEditorRef();
  const inLink = useEditorSelector(
    (ed) => ed.api.some({ match: { type: ed.getType(KEYS.link) } }),
    [],
  );

  return (
    <>
      <ToolbarButton
        label={inLink ? "Change link" : "Add link"}
        pressed={inLink}
        onClick={() => {
          // A prompt keeps this to one dependency-free button. Plate's
          // floating link input is a whole UI surface, and a review needs the
          // occasional citation, not link management.
          const url = window.prompt("Link URL");
          if (!url) return;
          upsertLink(editor, { url });
        }}
      >
        <Link2 className="size-4" strokeWidth={1.75} />
      </ToolbarButton>

      {inLink && (
        <ToolbarButton
          label="Remove link"
          onClick={() => unwrapLink(editor, { split: true })}
        >
          <Link2Off className="size-4" strokeWidth={1.75} />
        </ToolbarButton>
      )}
    </>
  );
}

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
