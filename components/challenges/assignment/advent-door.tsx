import { Check } from "lucide-react";
import type { Door } from "@/lib/challenges/edition";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";

const SHUT = "bg-[color-mix(in_srgb,var(--challenge-tint)_55%,var(--color-background))] shadow-[inset_0_0_0_2px_var(--color-tinsel)]";
const DIM =
  "bg-[color-mix(in_srgb,var(--challenge-tint)_35%,var(--color-background))] shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--color-tinsel)_35%,transparent)]";

const TAG = {
  finished: "bg-foreground text-background",
  progress: "bg-background text-foreground shadow-[inset_0_0_0_1.5px_var(--color-foreground)]",
  muted: "bg-background text-faint-foreground shadow-[inset_0_0_0_1.5px_var(--color-border-strong)]",
};

// One advent door (surface brief challenges-assignment, 4A): shut, dark holly
// with a tinsel edge, its number in Anton tinsel and the member's name in
// label type; sealed in tinsel once their Santa picked, dimmer while they
// wait; open after the reveal on the game's cover with the name, the game and
// who picked under a foot scrim, and the Run's tag at the top right.
export function AdventDoor({ door }: { door: Door }) {
  if (door.state === "open" && door.game) {
    return (
      <li className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted shadow-[inset_0_0_0_2px_var(--color-border-strong)]">
        <GameCover
          title={door.game.title}
          coverUrl={door.game.cover_url}
          className="absolute inset-0 size-full rounded-sm"
          fallbackClassName="text-base p-2 items-start"
        />
        {door.tag && <Tag tag={door.tag} />}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background from-30% to-background/0 px-2 pt-5 pb-2">
          <b className="font-label block text-[0.82rem] leading-[1.1] tracking-[0.06em] text-foreground">
            {door.name}
          </b>
          <small className="line-clamp-3 text-[0.75rem] leading-[1.25] text-foreground/85">{door.game.title}</small>
          {door.foot && (
            <small className="mt-0.5 line-clamp-3 text-[0.68rem] leading-[1.2] whitespace-pre-line text-dim-foreground">
              {door.foot}
            </small>
          )}
        </div>
      </li>
    );
  }
  return (
    <li
      className={cn(
        "relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-sm p-2.5",
        door.state === "waiting" || door.state === "empty" ? DIM : SHUT,
      )}
    >
      <span className="font-headline text-[1.875rem] leading-[0.9] text-tinsel">{door.number}</span>
      {door.state === "picked" && (
        <span
          aria-hidden
          className="absolute top-2.5 right-2 grid size-6 place-items-center rounded-full bg-tinsel text-background"
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      )}
      {door.tag && <Tag tag={door.tag} />}
      <span className="font-label text-[0.84rem] leading-[1.15] font-bold tracking-[0.06em] break-words text-foreground">
        {door.name}
        {door.caption && (
          <small className="block text-[0.72rem] font-medium tracking-[0.04em] text-foreground/80">
            {door.caption}
          </small>
        )}
      </span>
    </li>
  );
}

function Tag({ tag }: { tag: NonNullable<Door["tag"]> }) {
  return (
    <span
      className={cn(
        "font-label absolute top-1.5 right-1.5 z-10 rounded-xs px-[5px] pt-1 pb-[3px] text-[0.66rem] leading-none font-extrabold tracking-[0.06em]",
        TAG[tag.tone],
      )}
    >
      {tag.label}
    </span>
  );
}
