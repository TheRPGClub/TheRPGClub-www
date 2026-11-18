"use client";

import { X } from "lucide-react";
import { PlateElement, useEditorRef, type PlateElementProps } from "platejs/react";
import { CAPTION_MAX, type ImageNode } from "@/lib/codex/story-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// A photo placed in the story, as the writer sees it (5D): a small taped
// thumbnail between paragraphs with its caption field. Taking it out returns
// the photo to the drawer as "Not in the story".
export function StoryImageBlock(props: PlateElementProps) {
  const editor = useEditorRef();
  const node = props.element as unknown as ImageNode;
  const path = () => editor.api.findPath(props.element);

  return (
    <PlateElement {...props} className="my-5 first:mt-0">
      <div
        contentEditable={false}
        className="flex items-end gap-4 rounded-[2px] border border-dashed border-border-strong/70 bg-background/40 p-2.5 select-none"
      >
        <figure className="relative w-32 shrink-0 -rotate-2 rounded-[2px] bg-foreground p-1.5 pb-2 shadow-[0_6px_14px_rgb(0_0_0/0.45)]">
          <span aria-hidden className="absolute -top-2 left-1/2 h-3.5 w-14 -translate-x-1/2 rotate-3 bg-codex-history/70" />
          {/* eslint-disable-next-line @next/next/no-img-element -- an uploaded photo or a local preview (blob:), which next/image can't load */}
          <img src={node.url} alt="" className="aspect-[4/3] w-full object-cover" />
        </figure>
        <div className="min-w-0 flex-1">
          <Input
            variant="readout"
            aria-label="Caption"
            placeholder="Add a caption"
            maxLength={CAPTION_MAX}
            defaultValue={node.caption ?? ""}
            onKeyDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const at = path();
              if (at) editor.tf.setNodes({ caption: e.currentTarget.value } as Partial<ImageNode>, { at });
            }}
            className="h-8 border-0 px-1.5 text-[0.95rem] italic"
          />
          <p className="font-label mt-1 text-[0.72rem] font-bold tracking-[0.08em] text-faint-foreground">
            Photo in the story
          </p>
        </div>
        <Button
          type="button"
          variant="editor-tool"
          size="icon-sm"
          aria-label="Take this photo out of the story"
          title="Take out of the story"
          onClick={() => {
            const at = path();
            if (at) editor.tf.removeNodes({ at });
          }}
        >
          <X />
        </Button>
      </div>
      {props.children}
    </PlateElement>
  );
}
