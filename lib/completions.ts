// "Mar 2024" for a completion's `completed_at`, or null when the member didn't
// record a date (the API sends `completed_at: null` for those).
export function formatCompletedMonth(
  completedAt: string | null | undefined,
): string | null {
  if (!completedAt) return null;
  const date = new Date(completedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}
