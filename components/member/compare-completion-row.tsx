import Link from "next/link";
import type { CommonCompletion, CommonCompletionSide } from "@/lib/api/types";
import { formatCompletedMonth } from "@/lib/completions";
import {
  MemberAvatar,
  MemberCover,
  platformShort,
} from "@/components/issue/member-cover";

export interface CompareCompletionRowProps {
  row: CommonCompletion;
  left: { id: string; name: string };
  right: { id: string; name: string };
}

// One shared game on the contact sheet: its cover and title, then each
// member's latest completion of it (left = the page's member, right = the
// one compared with) with how many times they finished it.
export function CompareCompletionRow({
  row,
  left,
  right,
}: CompareCompletionRowProps) {
  const title = row.game?.title ?? "Unknown game";
  return (
    <li className="group/cover">
      <Link href={`/games/${row.gamedb_game_id}`} className="block">
        <MemberCover game={row.game} title={title} />
        <h3 className="font-label mt-2.5 min-h-[2.3em] text-[0.95rem] leading-[1.15] font-extrabold tracking-[0.02em] transition-colors group-hover/cover:text-highlight">
          {title}
        </h3>
      </Link>
      <dl className="mt-1.5 grid grid-cols-[1.125rem_1fr] items-start gap-x-1.5 gap-y-1">
        <CompareSide who={left} side={row.left} />
        <CompareSide who={right} side={row.right} />
      </dl>
    </li>
  );
}

function CompareSide({
  who,
  side,
}: {
  who: { id: string; name: string };
  side: CommonCompletionSide;
}) {
  const { latest, count } = side;
  const platform = platformShort(latest.platform);
  const month = formatCompletedMonth(latest.completed_at) ?? "No date";
  return (
    <>
      <dt>
        <MemberAvatar
          userId={who.id}
          name={who.name}
          className="size-4.5"
          fallbackClassName="text-[0.65rem]"
        />
        <span className="sr-only">{who.name}</span>
      </dt>
      <dd className="font-label text-[0.8rem] leading-tight font-bold tracking-[0.04em] text-paper-dim">
        <b className="font-extrabold text-paper">{month}</b>
        {platform && <> · {platform}</>}
        {count > 1 && (
          <span
            className="ml-1 text-paper-mute"
            title={`Completed ${count} times`}
          >
            ×{count}
          </span>
        )}
        {latest.completion_type && (
          <span className="block text-[0.72rem] text-paper-mute">
            {latest.completion_type}
          </span>
        )}
      </dd>
    </>
  );
}
