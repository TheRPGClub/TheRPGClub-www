"use client";

import { RotateCcw } from "lucide-react";
import { resetPinnedPagesAction } from "@/app/actions/pinned-pages";
import { clubDefaultNames } from "@/lib/pinned-pages";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PreferenceRow } from "@/components/feature/preference-row";

const ID = "pinned_pages";

// Under the Feature switches, for a member whose Pinned Pages are their own
// (ticket api#419): one row in the switches' style, its Reset asking first.
// Once reset, the session says the member follows the club default, so the
// refreshed page drops this row and the sidebar shows the default.
export function PinnedPagesReset() {
  const names = clubDefaultNames();
  return (
    <ul className="mt-8 border-t border-border">
      <PreferenceRow
        id={ID}
        name="Pinned Pages"
        badge={null}
        where={`Your own list, top of your sidebar. Reset to follow the club's: ${names}.`}
        dim={false}
      >
        <ConfirmDialog
          trigger={
            <Button variant="outline" aria-describedby={`pref-${ID}-where`}>
              <RotateCcw aria-hidden />
              Reset
            </Button>
          }
          title="Reset your Pinned Pages?"
          description={`Your sidebar goes back to the club's Pinned Pages (${names}) and follows them if the club changes them. Your own list can't be brought back.`}
          confirmLabel="Reset Pinned Pages"
          pendingLabel="Resetting…"
          confirmIcon={<RotateCcw aria-hidden />}
          cancelLabel="Keep mine"
          onConfirm={async () => {
            const result = await resetPinnedPagesAction();
            return result.ok ? null : "Couldn't reset your Pinned Pages. Try again.";
          }}
        />
      </PreferenceRow>
    </ul>
  );
}
