import {
  GOTY_VOTES_PATH,
  gotyNominationsPath,
  gotyVotePath,
  readGoty,
  type GotyNomination,
  type GotyVote,
  type GotyVoteSummary,
} from "@/lib/api/goty";
import { pickGotyYear } from "@/lib/goty-desk";

// What /admin/goty reads: the year list, then the picked year in full and
// its nominations, stamped with the moment they were read so the windows
// and the status line agree. `unreachable` when any read failed (other than
// a 404), so the desk doesn't pass an outage off as "nothing to run".
export type GotyDeskData =
  | { state: "unreachable" }
  | { state: "empty" }
  | { state: "ready"; vote: GotyVote; years: number[]; nominations: GotyNomination[]; now: number };

export async function loadGotyDesk(asked?: string | null): Promise<GotyDeskData> {
  const list = await readGoty<GotyVoteSummary[]>(GOTY_VOTES_PATH, []);
  if (!list.ok) return { state: "unreachable" };
  const year = pickGotyYear(list.data, asked);
  if (!year) return { state: "empty" };
  const [vote, nominations] = await Promise.all([
    readGoty<GotyVote | null>(gotyVotePath(year), null),
    readGoty<GotyNomination[]>(gotyNominationsPath(year), []),
  ]);
  if (!vote.ok || !nominations.ok) return { state: "unreachable" };
  if (!vote.data) return { state: "empty" };
  const years = list.data.map((v) => v.year).sort((a, b) => b - a);
  return { state: "ready", vote: vote.data, years, nominations: nominations.data, now: Date.now() };
}
