import Link from "next/link";
import type { GameKey } from "@/lib/api/types";
import { platformFamily, shortDate } from "@/lib/giveaways";
import { GameCover } from "@/components/issue/game-cover";
import { PlatformChip } from "@/components/giveaways/platform-chip";
import { ClaimedKeyCell } from "@/components/giveaways/claimed-key-cell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const HEAD = "h-auto px-2 py-1";
const CELL = "px-2 py-2.5 whitespace-normal";

// Every key the member has claimed, one row each, with the key itself
// (masked until asked) and who gave it.
export function ClaimedKeysTable({ keys, names }: { keys: GameKey[]; names: Map<string, string> }) {
  return (
    <Table variant="records" className="min-w-[40rem] border-collapse text-[0.93rem]">
      <TableHeader>
        <TableRow className="text-[0.78rem]">
          <TableHead className={HEAD}>
            <span className="sr-only">Cover</span>
          </TableHead>
          <TableHead className={HEAD}>Game</TableHead>
          <TableHead className={HEAD}>Platform</TableHead>
          <TableHead className={HEAD}>Key</TableHead>
          <TableHead className={HEAD}>From</TableHead>
          <TableHead className={HEAD}>Claimed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((k) => {
          const title = k.game?.title ?? k.game_title;
          return (
            <TableRow key={k.key_id}>
              <TableCell className={CELL}>
                <GameCover title="" coverUrl={k.game?.cover_url} className="w-[34px]" />
              </TableCell>
              <TableCell className={`${CELL} font-semibold`}>
                {k.game ? (
                  <Link href={`/games/${k.game.game_id}`} className="hover:text-highlight">
                    {title}
                  </Link>
                ) : (
                  title
                )}
                {k.region !== "Global" && <span className="ml-2 text-xs text-faint-foreground">{k.region}</span>}
              </TableCell>
              <TableCell className={CELL}>
                <PlatformChip ink={platformFamily(k.platform).ink}>{k.platform}</PlatformChip>
              </TableCell>
              <TableCell className={CELL}>
                <ClaimedKeyCell value={k.key_value} title={title} />
              </TableCell>
              <TableCell className={CELL}>
                <span className="text-dim-foreground">{names.get(k.donor_user_id) ?? "A member"}</span>
              </TableCell>
              <TableCell className={`${CELL} whitespace-nowrap`}>
                <span className="text-dim-foreground">{shortDate(k.claimed_at)}</span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
