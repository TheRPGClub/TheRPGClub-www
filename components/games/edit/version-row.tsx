"use client";

import Link from "next/link";
import { Undo2, Unlink, X } from "lucide-react";
import type { AlternateVersion } from "@/lib/games/game-edit";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StagedMark } from "@/components/games/edit/edit-section";

// One Alternate Version on the Versions tab (design www#156, round 3): its
// cover, title and "year · platform", then Unlink. A staged unlink strikes
// the row through with Unlinking and an Undo; a staged link is marked Added
// with an X that drops it.
export function VersionRow({
  version,
  state,
  onUnlink,
  onUndo,
}: {
  version: AlternateVersion;
  state: "linked" | "added" | "unlinking";
  onUnlink: () => void;
  onUndo: () => void;
}) {
  const removing = state === "unlinking";
  const meta = [version.year, version.platform].filter(Boolean).join(" · ");
  return (
    <li className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 border-b border-border py-2.5 sm:grid-cols-[40px_minmax(0,1fr)_auto]">
      <span
        className={cn(
          "font-headline grid aspect-[3/4] w-10 place-items-center overflow-hidden rounded-[2px] bg-muted p-0.5 text-center text-[0.65rem] leading-none text-faint-foreground uppercase",
          removing && "opacity-50",
        )}
      >
        {version.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img src={version.cover_url} alt="" className="size-full object-cover" />
        ) : (
          version.platform
        )}
      </span>
      <div className="min-w-0">
        <Link
          href={`/games/${version.game_id}`}
          className={cn(
            "font-semibold leading-tight hover:underline",
            removing && "text-faint-foreground line-through decoration-destructive decoration-[1.5px]",
          )}
        >
          {version.title}
        </Link>
        {meta && <p className={cn("mt-0.5 text-[0.8rem] text-faint-foreground", removing && "opacity-50")}>{meta}</p>}
      </div>
      <div className="col-start-2 flex items-center gap-2.5 sm:col-start-3">
        {state === "linked" && (
          <Button variant="ghost" size="sm" onClick={onUnlink}>
            <Unlink data-icon="inline-start" />
            Unlink
          </Button>
        )}
        {state === "unlinking" && (
          <>
            <StagedMark kind="removing">Unlinking</StagedMark>
            <Button variant="inline-link" size="inline" onClick={onUndo} className="text-[0.8rem]">
              <Undo2 aria-hidden className="mr-1 inline size-3.5" />
              Undo
            </Button>
          </>
        )}
        {state === "added" && (
          <>
            <StagedMark kind="added">Added</StagedMark>
            <Button variant="ghost" size="icon-sm" onClick={onUndo} aria-label={`Don't link ${version.title}`}>
              <X />
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
