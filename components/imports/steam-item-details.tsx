"use client";

import { useState } from "react";
import { ExternalLink, Gamepad2 } from "lucide-react";
import type { SteamCollectionImportItem } from "@/lib/api/types";
import { formatPlaytime, steamHeaderImageUrl, steamStoreUrl } from "@/lib/imports/steam";
import { cn } from "@/lib/utils";
import { DetailList } from "@/components/issue/import-facts";

// The Steam app under review: its store header art, a store link and the
// playtime Steam reported, so the member can tell which game it is before
// choosing a GameDB match.
export function SteamItemDetails({ item }: { item: SteamCollectionImportItem }) {
  const playtime = formatPlaytime(item.playtime_forever_min);
  const lastPlayed = item.last_played_at ? new Date(item.last_played_at) : null;
  const rows: [string, React.ReactNode][] = [
    [
      "Steam app",
      <a
        key="app"
        href={steamStoreUrl(item.steam_app_id)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 tabular-nums underline-offset-4 hover:text-highlight hover:underline"
      >
        {item.steam_app_id} <ExternalLink aria-hidden className="size-3.5" />
      </a>,
    ],
    ["Playtime", playtime ?? "Never played"],
  ];
  if (lastPlayed && !Number.isNaN(lastPlayed.getTime())) {
    rows.push(["Last played", lastPlayed.toLocaleDateString()]);
  }
  rows.push(["Adds as", "Digital, on Steam"]);

  return (
    <div className="space-y-2">
      <DetailList rows={rows} problem={item.error_text} />
      {item.result_reason === "skip_mapped" && (
        <p className="max-w-[65ch] text-sm text-paper-dim">
          Someone skipped this Steam app in an earlier import, so no matches
          were looked up. Pick a game if you want it in your collection.
        </p>
      )}
    </div>
  );
}

const HEADER_CLASS = "size-full bg-ink-3";

// Steam's store header art, or a neutral placeholder when the app has none
// (delisted apps, tools) or the CDN fails.
export function SteamHeaderImage({ appId, name }: { appId: number; name: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div aria-hidden className={cn(HEADER_CLASS, "flex items-center justify-center text-paper-mute")}>
        <Gamepad2 className="size-8" />
      </div>
    );
  }

  return (
    // Steam's CDN art: a plain img avoids adding the host to next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={steamHeaderImageUrl(appId)}
      alt={`${name} on Steam`}
      width={460}
      height={215}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(HEADER_CLASS, "object-cover")}
    />
  );
}
