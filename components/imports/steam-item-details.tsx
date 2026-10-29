"use client";

import { useState } from "react";
import { ExternalLink, Gamepad2 } from "lucide-react";
import type { SteamCollectionImportItem } from "@/lib/api/types";
import { formatPlaytime, steamHeaderImageUrl, steamStoreUrl } from "@/lib/imports/steam";
import { cn } from "@/lib/utils";

// The Steam app under review: its store header art, a store link and the
// playtime Steam reported, so the member can tell which game it is before
// choosing a GameDB match.
export function SteamItemDetails({ item }: { item: SteamCollectionImportItem }) {
  const playtime = formatPlaytime(item.playtime_forever_min);
  const lastPlayed = item.last_played_at ? new Date(item.last_played_at) : null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <SteamHeaderImage key={item.steam_app_id} appId={item.steam_app_id} name={item.steam_app_name} />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Steam app</dt>
        <dd>
          <a
            href={steamStoreUrl(item.steam_app_id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 tabular-nums underline-offset-4 hover:underline"
          >
            {item.steam_app_id} <ExternalLink className="size-3.5" />
          </a>
        </dd>
        <dt className="text-muted-foreground">Playtime</dt>
        <dd className="tabular-nums">{playtime ?? <span className="text-muted-foreground">Never played</span>}</dd>
        {lastPlayed && !Number.isNaN(lastPlayed.getTime()) && (
          <>
            <dt className="text-muted-foreground">Last played</dt>
            <dd>{lastPlayed.toLocaleDateString()}</dd>
          </>
        )}
        <dt className="text-muted-foreground">Adds as</dt>
        <dd>Digital, on Steam</dd>
        {item.result_reason === "skip_mapped" && (
          <dd className="col-span-2 text-muted-foreground">
            Someone skipped this Steam app in an earlier import, so no matches
            were looked up. Pick a game below if you want it in your collection.
          </dd>
        )}
        {item.error_text && (
          <>
            <dt className="text-muted-foreground">Problem</dt>
            <dd className="min-w-0 break-words">{item.error_text}</dd>
          </>
        )}
      </dl>
    </div>
  );
}

const HEADER_CLASS = "aspect-[460/215] w-full shrink-0 rounded-lg border bg-muted sm:w-56";

// Steam's store header art, or a neutral placeholder when the app has none
// (delisted apps, tools) or the CDN fails.
function SteamHeaderImage({ appId, name }: { appId: number; name: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div aria-hidden className={cn(HEADER_CLASS, "flex items-center justify-center text-muted-foreground")}>
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
