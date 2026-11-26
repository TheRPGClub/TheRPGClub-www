import { cookies } from "next/headers";
import type { AppSession } from "@/lib/auth-types";
import { featureView } from "@/lib/features";
import { fetchCurrentPhase } from "@/lib/api/voting-round";
import { patchSeen } from "@/lib/patch-notes/patch-mark";
import { pinRules } from "@/lib/pinned-pages";
import { SIDEBAR_COOKIE, sidebarOpenFromCookie } from "@/lib/sidebar-state";

// What the signed-in site's frame (components/shell/app-shell) shows for a
// Member: the protected layout's, and a public page's when a Member reads it
// (Club History, www#126).
export async function appShellProps(session: AppSession) {
  // voting_rounds/current requires auth and 401s without it. Next's Data
  // Cache key includes the request headers (and so the member's
  // Authorization), so cached reads are per member and a 401 is never shared.
  //
  // Voting & GOTM hidden from this viewer: no round to name the nav item by.
  const features = featureView(session.features);
  const votingPhase = features.shown("voting_gotm") ? await fetchCurrentPhase() : null;
  return {
    principal: session.principal,
    membership: session.membership,
    votingPhase,
    features: session.features,
    pinnedPages: session.pinned_pages,
    pinRules: pinRules(session),
    // Patch Notes' NEW mark on the sidebar and the tab bar (www#238).
    patchSeen: patchSeen(session),
    // The member's collapsed/expanded sidebar, as they left it.
    sidebarOpen: sidebarOpenFromCookie((await cookies()).get(SIDEBAR_COOKIE)?.value),
  };
}
