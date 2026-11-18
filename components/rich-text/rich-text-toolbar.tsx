"use client";

import { Fragment } from "react";
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
  type LucideIcon,
} from "lucide-react";

import { LINK_TYPE, type RichTextSchema } from "@/lib/rich-text/schema";
import { SPOILER_KEY } from "@/lib/rich-text/spoiler-plugin";
import { cn } from "@/lib/utils";
import {
  BlockButton,
  LinkButtons,
  ListButton,
  MarkButton,
} from "./toolbar-buttons";

function Divider() {
  return <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />;
}

type Kind = "mark" | "block" | "list";
type Tool = [Kind, string, string, LucideIcon];
const BUTTONS = { mark: MarkButton, block: BlockButton, list: ListButton };

// The buttons, in groups a divider separates. A button shows only when the
// schema allows its node type, so a field with fewer types gets fewer buttons.
const LETTERING: Tool[] = [
  ["mark", KEYS.bold, "Bold", Bold],
  ["mark", KEYS.italic, "Italic", Italic],
  ["mark", KEYS.strikethrough, "Strikethrough", Strikethrough],
];
const STRUCTURE: Tool[][] = [
  [
    ["block", KEYS.h1, "Title", Heading1],
    ["block", KEYS.h2, "Heading", Heading2],
    ["block", KEYS.h3, "Subheading", Heading3],
  ],
  [
    ["list", KEYS.ulClassic, "Bulleted list", List],
    ["list", KEYS.olClassic, "Numbered list", ListOrdered],
    ["block", KEYS.blockquote, "Quote", Quote],
  ],
  [["mark", SPOILER_KEY, "Spoiler", EyeOff]],
];

export interface RichTextToolbarProps {
  schema: RichTextSchema;
  className?: string;
  // "compact" is a small inline editor (a game page's): the ways of styling
  // lettering, and nothing else. Structure (headings, lists, quotes, links,
  // spoilers) belongs to the full-page editor, which has the room for it.
  //
  // Only the buttons are withheld. The plugins stay loaded either way, so a
  // value already carrying headings or lists still renders and survives an
  // edit made here.
  variant?: "compact" | "full";
  // Extra buttons for a feature's own plugins (a mention, say), as a last
  // group in the full toolbar.
  children?: React.ReactNode;
}

export function RichTextToolbar({
  schema,
  className,
  variant = "full",
  children,
}: RichTextToolbarProps) {
  const full = variant === "full";
  const allowed = ([kind, type]: Tool) =>
    kind === "mark"
      ? schema.marks.includes(type)
      : Object.hasOwn(schema.blocks, type);
  const render = (tools: Tool[]) =>
    tools.filter(allowed).map((tool) => {
      const [kind, type, label, Icon] = tool;
      const Button = BUTTONS[kind];
      return (
        <Button key={type} nodeType={type} label={label}>
          <Icon className="size-4" strokeWidth={tools === LETTERING ? 2 : 1.75} />
        </Button>
      );
    });

  const groups = [
    [
      ...render(LETTERING),
      full && Object.hasOwn(schema.inlines, LINK_TYPE) && (
        <LinkButtons key="link" />
      ),
    ],
    ...(full ? STRUCTURE.map(render) : []),
    [full && children],
  ].filter((group) => group.some(Boolean));

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className={cn("flex flex-wrap items-center gap-0.5", className)}
    >
      {groups.map((group, i) => (
        <Fragment key={i}>
          {i > 0 && <Divider />}
          {group}
        </Fragment>
      ))}
    </div>
  );
}
