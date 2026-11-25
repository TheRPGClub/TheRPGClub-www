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
// read so the windows and the status line agree. `unreachable` when any read
// failed (other than a 404), so the desk doesn't pass an outage off as
// "nothing to run".
export type GotyDeskData =
  | { state: "unreachable" }
  | { state: "empty" }
  | { state: "ready"; vote: GotyVote; years: number[]; nominations: GotyNomination[]; now: number };

// The desk opens on the Current GOTY Vote (api#482); an explicit `?year=`
// the API has still wins, and with no current one (none undecided) it
// falls back to the newest year.
export async function loadGotyDesk(asked?: string | null): Promise<GotyDeskData> {
  const [list, current] = await Promise.all([
    readGoty<GotyVoteSummary[]>(GOTY_VOTES_PATH, []),
    readGoty<GotyVote | null>(GOTY_CURRENT_PATH, null),
  ]);
  if (!list.ok || !current.ok) return { state: "unreachable" };
  const wanted = Number(asked);
  const askedYear = asked && list.data.some((v) => v.year === wanted) ? wanted : null;
  const year = askedYear ?? current.data?.year ?? pickGotyYear(list.data, null);
  if (!year) return { state: "empty" };
  const [vote, nominations] = await Promise.all([
    current.data?.year === year ? current : readGoty<GotyVote | null>(gotyVotePath(year), null),
    readGoty<GotyNomination[]>(gotyNominationsPath(year), []),
  ]);
  if (!vote.ok || !nominations.ok) return { state: "unreachable" };
  if (!vote.data) return { state: "empty" };
  const years = [...new Set([...list.data.map((v) => v.year), vote.data.year])].sort((a, b) => b - a);
  return { state: "ready", vote: vote.data, years, nominations: nominations.data, now: Date.now() };
}
