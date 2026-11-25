import {
  GOTY_CURRENT_PATH,
  GOTY_VOTES_PATH,
  gotyNominationsPath,
  gotyVotePath,
  readGoty,
  type GotyNomination,
  type GotyVote,
  type GotyVoteSummary,
} from "@/lib/api/goty";
import { pickGotyYear } from "@/lib/goty-desk";

// What /admin/goty reads: the year list and the Current GOTY Vote, then the
// picked year in full and its nominations, stamped with the moment they were
// read so the windows and the status line agree. `unreachable` when a read
// the desk needs failed (other than a 404), so the desk doesn't pass an
// outage off as "nothing to run".
export type GotyDeskData =
  | { state: "unreachable" }
  | { state: "empty" }
  | { state: "ready"; vote: GotyVote; years: number[]; nominations: GotyNomination[]; now: number };

// The desk opens on the Current GOTY Vote (api#482: running, else tied or
// closed, else decided within 30 days, else upcoming); an explicit `?year=`
// the API has still wins, and with no current one it falls back to the
// newest year. A failed `current` read only matters when the desk needs it
// to pick the year: an explicit year the list has still opens.
export async function loadGotyDesk(asked?: string | null): Promise<GotyDeskData> {
  const [list, current] = await Promise.all([
    readGoty<GotyVoteSummary[]>(GOTY_VOTES_PATH, []),
    readGoty<GotyVote | null>(GOTY_CURRENT_PATH, null),
  ]);
  if (!list.ok) return { state: "unreachable" };
  const wanted = Number(asked);
  const askedYear = asked && list.data.some((v) => v.year === wanted) ? wanted : null;
  if (!askedYear && !current.ok) return { state: "unreachable" };
  const currentVote = current.ok ? current.data : null;
  const year = askedYear ?? currentVote?.year ?? pickGotyYear(list.data, null);
  if (!year) return { state: "empty" };
  const [vote, nominations] = await Promise.all([
    currentVote?.year === year ? { ok: true as const, data: currentVote } : readGoty<GotyVote | null>(gotyVotePath(year), null),
    readGoty<GotyNomination[]>(gotyNominationsPath(year), []),
  ]);
  if (!vote.ok || !nominations.ok) return { state: "unreachable" };
  if (!vote.data) return { state: "empty" };
  const years = [...new Set([...list.data.map((v) => v.year), vote.data.year])].sort((a, b) => b - a);
  return { state: "ready", vote: vote.data, years, nominations: nominations.data, now: Date.now() };
}
