"use client";

import { CirclePlay, Undo2 } from "lucide-react";
import type { GameText, TextStage } from "@/lib/games/game-edit";
import { featuredVideoEmbed } from "@/lib/games/featured-video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EditSection, StagedMark } from "@/components/games/edit/edit-section";

type Field = keyof GameText;

// The Text & video tab: the description beside the Featured Video, with a
// preview of the video (YouTube embeds) under its link. Typing stages the
// field; a staged field is ringed in yellow, marked Edited, with an Undo.
export function TextVideoTab({
  loaded,
  staged,
  error,
  onStage,
}: {
  loaded: GameText;
  staged: TextStage | undefined;
  error?: string;
  onStage: (next: TextStage | undefined) => void;
}) {
  const value = (f: Field) => (staged && f in staged ? staged[f] : loaded[f]) ?? "";
  const edited = (f: Field) => !!staged && f in staged && (staged[f] ?? "") !== (loaded[f] ?? "");
  const set = (f: Field, v: string) => onStage({ ...staged, [f]: v });
  const undo = (f: Field) => {
    const rest = { ...staged };
    delete rest[f];
    onStage(Object.keys(rest).length > 0 ? rest : undefined);
  };
  const embed = featuredVideoEmbed(value("featured_video_url"));

  const label = (f: Field, text: string) => (
    <div className="mb-2 flex min-h-6 items-center gap-2">
      <Label htmlFor={`game-${f}`} className="font-label text-[0.78rem] font-bold tracking-[0.08em]">
        {text}
      </Label>
      {edited(f) && (
        <>
          <StagedMark kind="edited">Edited</StagedMark>
          <Button variant="inline-link" size="inline" onClick={() => undo(f)} className="gap-1 text-[0.8rem]">
            <Undo2 aria-hidden className="mr-1 inline size-3.5" />
            Undo
          </Button>
        </>
      )}
    </div>
  );

  return (
    <EditSection title="Description & video" error={error}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col">
          {label("description", "Description")}
          <Textarea
            id="game-description"
            variant={edited("description") ? "staged" : "default"}
            value={value("description")}
            onChange={(e) => set("description", e.target.value)}
            className="min-h-36 flex-1 text-[0.95rem] leading-[1.55]"
          />
        </div>
        <div className="flex min-w-0 flex-col">
          {label("featured_video_url", "Featured Video")}
          <div className="relative">
            <CirclePlay aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-faint-foreground" />
            <Input
              id="game-featured_video_url"
              type="url"
              inputMode="url"
              placeholder="https://www.youtube.com/watch?v=…"
              variant={edited("featured_video_url") ? "staged" : "default"}
              value={value("featured_video_url")}
              onChange={(e) => set("featured_video_url", e.target.value)}
              className="pl-8"
            />
          </div>
          {embed && (
            <iframe
              key={embed}
              src={embed}
              title="Featured Video preview"
              loading="lazy"
              allow="encrypted-media; picture-in-picture"
              allowFullScreen
              className="mt-2 aspect-video w-full rounded-sm bg-black"
            />
          )}
        </div>
      </div>
    </EditSection>
  );
}
