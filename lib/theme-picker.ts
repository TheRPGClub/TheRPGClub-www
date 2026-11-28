// The Theme picker's data (spec api#523 item 8, ticket www#250): the top row
// of Settings → Your layout, read from the session's `themes`. Client-safe:
// no server imports.

import type { SessionThemes } from "@/lib/auth-types";
import { DEFAULT_THEME, shipsTheme } from "@/themes/registry";

export interface ThemeCard {
  key: string;
  name: string;
  // The club's default Theme, marked "Club default".
  clubDefault: boolean;
  // The Member's Theme: their stored one, or the default when they have
  // none (or the API no longer lists theirs).
  chosen: boolean;
  // False for a stored Theme they may not choose right now: still chosen,
  // shown as unavailable ("Back when staff release it").
  available: boolean;
  // An unreleased Theme, which only staff are offered: "Staff preview".
  staffPreview: boolean;
}

// One card per Theme the session lists and this website can draw, in the
// API's order; null when that is only the default (the Themes Feature lets
// this Member choose nothing else, or an older API sent no `themes`), so the
// row is left out.
export function themeCards(themes: SessionThemes | undefined): ThemeCard[] | null {
  const list = (themes?.list ?? []).filter((theme) => shipsTheme(theme.key));
  if (list.length <= 1) return null;
  const stored = list.some((theme) => theme.key === themes?.chosen) ? themes?.chosen : DEFAULT_THEME.name;
  return list.map((theme) => ({
    key: theme.key,
    name: theme.name,
    clubDefault: theme.key === DEFAULT_THEME.name,
    chosen: theme.key === stored,
    available: theme.available,
    staffPreview: !theme.released && theme.available,
  }));
}

// Which Theme a press in the picker's toggle group asks to save, if any: the
// newly pressed key, when it isn't the Member's Theme already, is one they
// may choose, and no save is still on its way. Pressing the chosen card again
// un-presses it (an empty list), which saves nothing. Arrow keys only move
// focus in a toggle group, so they never get here.
export function themeToSave(pressed: readonly unknown[], cards: readonly ThemeCard[], busy: boolean): string | null {
  const key = pressed.at(-1);
  if (busy || typeof key !== "string") return null;
  const card = cards.find((c) => c.key === key);
  return card && card.available && !card.chosen ? key : null;
}

// The body of `PUT /api/v1/me/theme`: choosing the default stores nothing
// (null), so the Member follows the club default if it ever changes.
export function themeChoiceBody(key: string): { theme: string | null } {
  return { theme: key === DEFAULT_THEME.name ? null : key };
}
