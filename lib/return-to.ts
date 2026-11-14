// The return-to is where a Visitor was going when sign-in began: a path on
// this website, handed through Discord sign-in and back. It is only ever
// honoured as a same-origin path, the same check the API makes: a single
// leading slash (so no scheme or host; "//host" is protocol-relative), no
// backslash (browsers read "/\host" as "//host"), no control characters
// (browsers drop tabs and newlines, so "/\t/host" is "//host"), and at most
// 2048 characters. Anything else is discarded, never repaired. Client-safe.

export const RETURN_TO_PARAM = "return_to";
const MAX_LENGTH = 2048;

export function safeReturnTo(value: string | null | undefined): string | null {
  if (typeof value !== "string" || value.length > MAX_LENGTH) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return null;
  return value;
}
