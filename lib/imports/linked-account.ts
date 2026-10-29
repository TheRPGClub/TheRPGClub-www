import type { UserSocial } from "@/lib/api/types";
import { IMPORT_KINDS, type ImportKind } from "@/lib/imports/kinds";

// Imports that read an outside account (Steam, Completionator) only start once
// the member has linked that account on their profile, so nothing reaches the
// API, or Steam, for an account they haven't claimed. Client-safe.

// The social platform label this kind needs linked, or null when none.
export function requiredAccount(kind: ImportKind): string | null {
  return IMPORT_KINDS[kind].linkedAccount ?? null;
}

// The member's social on the platform with this label, matched the way the
// socials editor names platforms: by label, ignoring case and spaces.
export function linkedSocial(
  socials: UserSocial[],
  platformLabel: string,
): UserSocial | undefined {
  const wanted = platformLabel.trim().toLowerCase();
  return socials.find((s) => s.social_platform?.label.trim().toLowerCase() === wanted);
}

// Whether the member may start this kind of import. Unreadable socials (null)
// count as not linked, so a failed read never lets an import through.
export function hasRequiredAccount(kind: ImportKind, socials: UserSocial[] | null): boolean {
  const account = requiredAccount(kind);
  if (!account) return true;
  return socials !== null && linkedSocial(socials, account) !== undefined;
}

// Where the member links accounts: the socials editor on their edit page.
export const linkAccountsHref = (userId: string) => `/members/${userId}/edit#socials`;
