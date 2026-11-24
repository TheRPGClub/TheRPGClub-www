import type { GamePlace } from "@/lib/game-lists/order";
import type { GameList } from "@/lib/game-lists/types";

// The game page's In Game Lists section as its client parts see it
// (loaded by lib/game-lists/game-section.ts). Client-safe.

export const CARDS_SHOWN = 8;

export interface GameListCard {
  list: GameList;
  place: GamePlace | null;
}

// One of the viewer's lists in the Add to list tray.
export interface OwnListChoice {
  id: number;
  name: string;
  private: boolean;
  ranked: boolean;
  count: number;
  full: boolean;
  // The game's place when it is on the list (ranked lists number it).
  place: number | null;
  inList: boolean;
}

export interface GameListsSectionData {
  cards: GameListCard[];
  count: number;
  own: OwnListChoice[];
}
