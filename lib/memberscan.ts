// Memberscan (/admin/memberscan): the bot reports its counts as the job's
// result text, "Member scan complete. Upserts succeeded: 412. Failed: 0.
// Marked departed: 3." (bot `buildMemberScanSummary`).

export interface MemberScanCounts {
  updated: number;
  failed: number;
  departed: number;
}

function count(text: string, label: RegExp): number | null {
  const match = label.exec(text);
  return match ? Number(match[1]) : null;
}

// The three counts from a done job's result text, or null when the text
// doesn't carry them (the page then shows the text as it is).
export function parseMemberScanCounts(text: string | null | undefined): MemberScanCounts | null {
  if (!text) return null;
  const updated = count(text, /Upserts succeeded:\s*(\d+)/i);
  const failed = count(text, /Failed:\s*(\d+)/i);
  const departed = count(text, /Marked departed:\s*(\d+)/i);
  if (updated == null || failed == null || departed == null) return null;
  return { updated, failed, departed };
}
