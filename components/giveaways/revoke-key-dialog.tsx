"use client";

import type { ReactElement } from "react";
import { revokeKeyAction } from "@/app/actions/giveaways";
import type { GameKey } from "@/lib/api/types";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Takes an unclaimed key off the shelf, after a confirm: the donor's own
// (Your donations) or any key, for an Admin on the shelf.
export function RevokeKeyDialog({
  gameKey,
  title,
  trigger,
  mine = false,
}: {
  gameKey: GameKey;
  title: string;
  trigger: ReactElement;
  // The viewer donated it: the key comes back to them.
  mine?: boolean;
}) {
  return (
    <ConfirmDialog
      trigger={trigger}
      title={`Take ${title} off the shelf?`}
      description={mine ? "The key comes back to you." : "The key goes back to its donor."}
      confirmLabel="Revoke key"
      pendingLabel="Revoking…"
      onConfirm={async () => {
        const result = await revokeKeyAction(gameKey.key_id);
        return result.ok ? null : (result.error ?? "Couldn't take that key off the shelf.");
      }}
    />
  );
}
