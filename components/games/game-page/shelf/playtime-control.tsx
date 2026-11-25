"use client";

import { useState } from "react";
import { Plus, Timer } from "lucide-react";
import { saveManualPlaytimeAction } from "@/app/actions/playtime";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PlaytimeState } from "@/hooks/use-playtime";
import { defaultPlatform, hasPlaytime, playtimeChip } from "@/lib/playtime/view";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlaytimeAddForm } from "./playtime-add-form";
import { PlaytimeEditor, type PlaytimeEditorProps } from "./playtime-editor";
import { PlaytimePanel } from "./playtime-panel";

type Open = "editor" | "add" | null;

// The game page's Playtime control (spec api#457, pick 2D+F): one light
// split control outlined in paper beside the list button, never yellow. The
// chip ("180 h · Playthrough 14 h", a yellow dot while a mismatch waits)
// opens the full editor; its "+" opens the quick Add Playtime. With no
// Playtime yet it is "+ Add Playtime" alone.
export function PlaytimeControl(props: Omit<PlaytimeEditorProps, "playtime" | "defaultPlatform"> & { playtime: PlaytimeState }) {
  const { playtime, userId, gameId, gameTitle, platforms, nowPlaying } = props;
  const mobile = useIsMobile();
  const [open, setOpen] = useState<Open>(null);
  const doc = playtime.doc;
  const has = hasPlaytime(doc);
  const platform = defaultPlatform(doc, nowPlaying?.platform_id);
  const openChange = (which: Exclude<Open, null>) => (next: boolean) => {
    playtime.clearError();
    setOpen(next ? which : null);
  };
  // On phones the segment opens a sheet itself; on desktop the popover's
  // trigger does.
  const press = (which: Exclude<Open, null>) => (mobile ? { "aria-expanded": open === which, onClick: () => openChange(which)(true) } : {});
  const chip = has ? playtimeChip(doc) : null;

  return (
    <div role="group" aria-label="Your Playtime" className={cn("flex h-9 flex-none rounded-sm", has ? "bg-background/55 inset-ring-[1.5px] inset-ring-foreground" : "outline-[1.5px] -outline-offset-[1.5px] outline-border-strong outline-dashed")}>
      {has && chip && (
        <PlaytimePanel
          open={open === "editor"}
          onOpenChange={openChange("editor")}
          title="Your Playtime"
          gameTitle={gameTitle}
          width="w-[28.75rem]"
          error={playtime.error}
          trigger={
            <Button variant="playtime" aria-label={chip.label} {...press("editor")}>
              <Timer aria-hidden />
              <b data-part="figure">{chip.total}</b>
              {chip.playthrough && (
                <>
                  <span data-part="rule" aria-hidden />
                  <span data-part="sub">
                    Playthrough <b data-part="figure">{chip.playthrough}</b>
                  </span>
                </>
              )}
              {chip.flagged && <span data-part="flag" aria-hidden />}
            </Button>
          }
        >
          <PlaytimeEditor
            {...props}
            playtime={{ ...playtime, doc }}
            defaultPlatform={platform}
            onLog={
              props.onLog &&
              (() => {
                setOpen(null);
                props.onLog?.();
              })
            }
          />
        </PlaytimePanel>
      )}
      <PlaytimePanel
        open={open === "add"}
        onOpenChange={openChange("add")}
        title="Add Playtime"
        gameTitle={gameTitle}
        width="w-[23.75rem]"
        align={has ? "end" : "start"}
        error={playtime.error}
        trigger={
          <Button variant={has ? "playtime-plus" : "playtime-add"} aria-label={has ? "Add Playtime" : undefined} title={has ? "Add Playtime" : undefined} {...press("add")}>
            <Plus aria-hidden />
            {!has && "Add Playtime"}
          </Button>
        }
      >
        <PlaytimeAddForm
          doc={doc}
          platforms={platforms}
          initialPlatform={platform}
          pending={playtime.pending}
          onCancel={() => setOpen(null)}
          onSave={(input) => playtime.run(() => saveManualPlaytimeAction(userId, gameId, input), () => setOpen(null))}
        />
      </PlaytimePanel>
    </div>
  );
}
