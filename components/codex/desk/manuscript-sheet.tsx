"use client";

import { useRef } from "react";
import { AtSign } from "lucide-react";
import { PlateContent, useEditorRef } from "platejs/react";
import type { LoreDesk } from "@/hooks/use-lore-desk";
import { useStoryMention } from "@/hooks/use-story-mention";
import { LORE_SCHEMA, STORY_MAX } from "@/lib/codex/story-schema";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { RichTextToolbar } from "@/components/rich-text/rich-text-toolbar";
import { ToolbarButton } from "@/components/rich-text/toolbar-button";
import { MentionList } from "@/components/codex/fun-facts/mention-list";
import { usePhotoDrop } from "@/hooks/use-photo-drop";

const STORY = cn(
  "min-h-72 max-w-[70ch] px-4 pt-5 text-[1.05rem] leading-[1.65] text-dim-foreground outline-none sm:px-14 sm:text-[1.09rem]",
  "[&_strong]:text-foreground [&_p+p]:mt-[0.9em] [&_[data-slate-placeholder]]:text-faint-foreground",
  "[&_:is(h1,h2,h3)]:mt-6 [&_:is(h1,h2,h3)]:mb-1 [&_:is(h1,h2,h3)]:text-[1.19rem] [&_:is(h1,h2,h3)]:font-semibold [&_:is(h1,h2,h3)]:text-foreground [&_:is(h1,h2,h3)]:italic",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-4 [&_blockquote]:italic",
);

// The manuscript sheet (5D): the shared editor's toolbar sticky across its
// top with Mention a member at the end, the plain-text counter, the title
// written in place in Anton, the byline, then the story. Photos dragged from
// the drawer land between paragraphs, after a yellow insertion line.
export function ManuscriptSheet({ desk, author }: { desk: LoreDesk; author: React.ReactNode }) {
  const editor = useEditorRef();
  const frame = useRef<HTMLDivElement>(null);
  const mention = useStoryMention(frame);
  const drop = usePhotoDrop(desk, frame);
  const over = desk.count > STORY_MAX;

  return (
    <section
      aria-label="The manuscript"
      className="relative rounded-[4px] bg-card pb-6.5 shadow-[inset_0_0_0_1px_var(--color-border),0_18px_40px_rgb(0_0_0/0.45)]"
    >
      <div className="sticky top-[60px] z-20 flex items-center gap-3 rounded-t-[4px] bg-muted px-3 py-2 sm:px-12">
        <RichTextToolbar schema={LORE_SCHEMA} className="min-w-0 flex-1 flex-nowrap overflow-x-auto">
          <ToolbarButton label="Mention a member" onClick={mention.begin}>
            <AtSign className="size-4" strokeWidth={1.75} />
          </ToolbarButton>
        </RichTextToolbar>
        <p
          aria-live="polite"
          className={cn("font-label shrink-0 text-[0.75rem] font-bold tracking-[0.08em] text-faint-foreground", over && "text-destructive")}
        >
          <span className={cn("font-headline mr-1 text-2xl text-foreground", over && "text-destructive")}>{desk.count}</span>
          of {STORY_MAX}
        </p>
      </div>
      <div className="px-4 pt-6 sm:px-14 sm:pt-8.5">
        <Textarea
          variant="headline"
          rows={1}
          value={desk.title}
          maxLength={100}
          aria-label="Lore Entry title"
          aria-invalid={!desk.title.trim() && desk.dirty ? true : undefined}
          placeholder="Title"
          onChange={(e) => desk.setTitle(e.currentTarget.value.replace(/\n/g, " "))}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            editor.tf.focus({ edge: "start" });
          }}
          className="font-headline min-h-0 resize-none border-x-0 border-t-0 border-b-2 px-0 pt-1.5 pb-2 text-[2.5rem] leading-[0.95] uppercase sm:text-[4.125rem] md:text-[4.125rem]"
        />
        <div className="mt-3 flex items-center gap-2 text-[0.9rem] text-dim-foreground">{author}</div>
      </div>
      <div ref={frame} className="relative">
        <PlateContent
          aria-label="The story"
          placeholder="Tell the story. Type @ to mention a member."
          disableDefaultStyles
          onKeyDown={mention.onKeyDown}
          onDragOver={drop.onDragOver}
          onDragLeave={drop.onDragLeave}
          onDrop={drop.onDrop}
          className={STORY}
        />
        {drop.line !== null && (
          <span aria-hidden className="pointer-events-none absolute inset-x-4 h-[3px] rounded-full bg-highlight sm:inset-x-14" style={{ top: drop.line }} />
        )}
        {mention.open && mention.place && (
          <div className="absolute z-30 h-0 w-[19.5rem] max-w-[calc(100%-2rem)]" style={mention.place}>
            <MentionList picker={mention} id="story-mention" footer="Arrow keys to move · Enter to mention · shows their current name" />
          </div>
        )}
      </div>
    </section>
  );
}
