// The sidebar's collapsed/expanded preference. The sidebar primitive
// (components/ui/sidebar.tsx) writes it to this cookie on every toggle as
// "true" (expanded) or "false" (collapsed to the icon rail); the server
// reads it back so a page load draws the sidebar the way the member left it.
export const SIDEBAR_COOKIE = "sidebar_state";

// Expanded unless the member collapsed it: no cookie, or anything else,
// keeps the default.
export function sidebarOpenFromCookie(value: string | undefined): boolean {
  return value !== "false";
}
