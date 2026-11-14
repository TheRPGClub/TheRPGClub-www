import type { ImportJob, UserSocial } from "@/lib/api/types";
import { importKindHref, type ImportKind } from "@/lib/imports/kinds";
import {
  hasRequiredAccount,
  linkAccountsHref,
  requiredAccount,
} from "@/lib/imports/linked-account";
import { ImportKindRow } from "@/components/imports/import-kind-row";

// Every import kind the member can see, one row each; a kind whose account
// isn't linked yet asks for the link instead of starting.
export function ImportKindList({
  userId,
  kinds,
  socials,
}: {
  userId: string;
  kinds: { kind: ImportKind; active: ImportJob | null }[];
  socials: UserSocial[] | null;
}) {
  if (kinds.length === 0) {
    // Every list an import writes to is hidden (flag or preference).
    return (
      <p className="rounded-md border border-dashed border-border-strong px-4 py-8 text-center text-sm text-dim-foreground">
        Nothing to import right now. Imports add to your Collection and Completed lists, and
        neither is shown to you.
      </p>
    );
  }

  return (
    <ul className="border-t-2 border-foreground">
      {kinds.map(({ kind, active }) => {
        const account = requiredAccount(kind);
        const blocked = !active && account !== null && !hasRequiredAccount(kind, socials);
        return (
          <ImportKindRow
            key={kind}
            kind={kind}
            href={importKindHref(userId, kind)}
            active={active}
            blockedBy={blocked ? account : null}
            linkHref={linkAccountsHref(userId)}
          />
        );
      })}
    </ul>
  );
}
