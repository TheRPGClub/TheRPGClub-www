"use client";

import { staffSharing, type StaffBirthDate } from "@/lib/staff-birth-date";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { PreferenceRow } from "@/components/feature/preference-row";

const ROW = "member-birthday-shared";

// Whether the member shares their Birthday, in the /settings switch row
// (pick A). On, staff can switch it off; off, the switch stays put, dimmed
// and inert, and the line says only the member can turn it on. No control
// on the desk ever sends sharing on.
export function MemberSharingRow({
  doc,
  name,
  pending,
  error,
  saved,
  onStop,
}: {
  doc: StaffBirthDate;
  name: string;
  pending: boolean;
  error: string | null;
  // The confirmation once it's switched off.
  saved: string | null;
  onStop: () => void;
}) {
  const sharing = staffSharing(doc, name);

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
          <p role="status" className="mt-2 text-sm text-dim-foreground empty:hidden">
            {saved}
          </p>
        }
      >
        <FeatureSwitch
          checked={sharing.shared}
          pending={pending}
          unavailable={!sharing.canTurnOff}
          onChange={(next) => {
            if (!next) onStop();
          }}
          onLabel="On"
          offLabel="Off"
          labelledBy={`pref-${ROW}-name`}
          describedBy={`pref-${ROW}-where`}
        />
      </PreferenceRow>
    </ul>
  );
}
