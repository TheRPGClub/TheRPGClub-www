import type {
  Game,
  GotmRoundCategory,
  GotmRoundDetail,
  GotmRoundNomination,
  GotmRoundWinner,
  User,
} from "@/lib/api/types";

// Round Page fixtures for tests and component screenshots, shaped like
// GET /api/v1/gotm_rounds/:round.

let nextId = 1;

export const game = (title: string, id = nextId++): Game =>
  ({ game_id: id, title, cover_url: null, art_url: null }) as Game;

export const member = (name: string): User =>
  ({ user_id: `u-${name}`, username: name, global_name: null }) as User;

export function nomination(
  title: string,
  nominator: string | null,
  over: Partial<GotmRoundNomination> = {},
): GotmRoundNomination {
  const g = game(title);
  return {
    nomination_id: nextId++,
    round_number: 144,
    user_id: nominator ? `u-${nominator}` : "poll-import-3",
    gamedb_game_id: g.game_id,
    reason: `Why ${title}.`,
    nominated_at: "2026-11-02T12:00:00Z",
    user: nominator ? member(nominator) : null,
    game: g,
    co_nominations: [],
    votes: null,
    runoff_votes: null,
    ...over,
  };
}

export function winner(
  title: string,
  nom: GotmRoundNomination | null = null,
  gameIndex = 0,
): GotmRoundWinner {
  const g = nom?.game ?? game(title);
  return {
    game_index: gameIndex,
    gamedb_game_id: g.game_id,
    reddit_url: null,
    thread_id: null,
    game: g,
    nomination: nom,
  };
}

export const category = (over: Partial<GotmRoundCategory> = {}): GotmRoundCategory => ({
  month_year: "November 2026",
  voting_results_message_id: null,
  voted: false,
  runoff: false,
  winners: [],
  nominations: [],
  ...over,
});

export const roundDetail = (over: Partial<GotmRoundDetail> = {}): GotmRoundDetail => ({
  round_number: 144,
  month_year: "November 2026",
  previous: 143,
  next: null,
  gotm: category(),
  nr_gotm: category(),
  ...over,
});

// Round 144: both Categories voted, NR-GOTM decided in a runoff.
export const votedRound = (): GotmRoundDetail =>
  roundDetail({
    gotm: category({
      voted: true,
      winners: [winner("Resonance: A Plague Tale Legacy", nomination("Resonance: A Plague Tale Legacy", "jaguar", { votes: 9 }))],
      nominations: [
        nomination("Hollow Knight: Silksong", "mask", { votes: 4 }),
        nomination("Clair Obscur: Expedition 33", "xergg", { votes: 7 }),
        nomination("Ghost of Yotei", null, { votes: 2 }),
      ],
    }),
    nr_gotm: category({
      voted: true,
      runoff: true,
      winners: [winner("Castlevania: Dominus Collection", nomination("Castlevania: Dominus Collection", "turtle", { votes: 5, runoff_votes: 6 }))],
      nominations: [
        nomination("Kingdoms of the Dump", "jaguar", { votes: 5, runoff_votes: 5 }),
        nomination("Dragon Quest VII Reimagined", "xergg", { votes: 3 }),
      ],
    }),
  });

// Round 135: nominated, no vote.
export const unvotedRound = (): GotmRoundDetail =>
  roundDetail({
    round_number: 135,
    month_year: "February 2026",
    previous: 134,
    next: 136,
    gotm: category({
      winners: [winner("Kingdom Come: Deliverance II", nomination("Kingdom Come: Deliverance II", "xergg"))],
      nominations: [
        nomination("Dragon Quest VII Reimagined", null, { nominated_at: "2026-02-06T12:00:00Z" }),
        nomination("Avowed", "turtle", { nominated_at: "2026-02-03T12:00:00Z" }),
      ],
    }),
    nr_gotm: category({
      winners: [winner("Resident Evil 7", nomination("Resident Evil 7", "mask"))],
      nominations: [nomination("Split Fiction", null)],
    }),
  });

// Round 120: before Nominations were recorded.
export const preNominationRound = (): GotmRoundDetail =>
  roundDetail({
    round_number: 120,
    month_year: "November 2024",
    previous: 119,
    next: 121,
    gotm: category({ winners: [winner("Metaphor: ReFantazio")] }),
    nr_gotm: category({ winners: [winner("Astro Bot")] }),
  });

// Round 137: nobody won NR-GOTM.
export const noWinnerRound = (): GotmRoundDetail =>
  roundDetail({
    round_number: 137,
    month_year: "April 2026",
    previous: 136,
    next: 138,
    gotm: category({ winners: [winner("Avowed", nomination("Avowed", "turtle"))] }),
    nr_gotm: category({
      winners: [],
      nominations: [nomination("Split Fiction", "mask"), nomination("Death Stranding", "jaguar")],
    }),
  });
