"use client";

import { useRef, useState } from "react";
import type { BirthDate } from "@/lib/birth-date";
import { staffSharing } from "@/lib/staff-birth-date";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { PreferenceRow } from "@/components/feature/preference-row";
import { StopSharingConfirm } from "@/components/admin/birth-dates/stop-sharing-confirm";

const ROW = "member-birthday-shared";

// Whether the member shares their Birthday, in the /settings switch row
// (pick A). On, staff can switch it off after a one-line confirm (they
// can't undo it); off, the switch stays put, dimmed and inert, and the line
// says only the member can turn it on. No control on the desk ever sends
// sharing on.
export function MemberSharingRow({
  doc,
  name,
  pending,
  error,
  saved,
  onStop,
}: {
  doc: BirthDate;
  name: string;
  pending: boolean;
  error: string | null;
  // The confirmation once it's switched off.
  saved: string | null;
  onStop: () => void;
}) {
  const sharing = staffSharing(doc, name);
  const [confirming, setConfirming] = useState(false);
  const switchBox = useRef<HTMLSpanElement>(null);

  // The confirm goes away either way: focus goes back to the switch.
  function answer(stop: boolean) {
    setConfirming(false);
    if (stop) onStop();
    switchBox.current?.querySelector<HTMLElement>('[role="switch"]')?.focus();
  }

  return (
    <ul className="mt-6 border-t border-border">
      <PreferenceRow
        id={ROW}
        name="Shares their Birthday"
        badge={null}
        where={sharing.line}
        dim={!sharing.shared}
        error={error ?? undefined}
        nested={
          <>
            {confirming && sharing.canTurnOff && (
              <StopSharingConfirm name={name} onStop={() => answer(true)} onKeep={() => answer(false)} />
            )}
            <p role="status" className="mt-2 text-sm text-dim-foreground empty:hidden">
              {saved}
            </p>
          </>
        }
      >
        <span ref={switchBox} className="contents">
          <FeatureSwitch
            checked={sharing.shared}
            pending={pending}
            unavailable={!sharing.canTurnOff}
            onChange={(next) => setConfirming(!next)}
            onLabel="On"
            offLabel="Off"
            labelledBy={`pref-${ROW}-name`}
            describedBy={`pref-${ROW}-where`}
          />
        </span>
      </PreferenceRow>
    </ul>
  );
}
