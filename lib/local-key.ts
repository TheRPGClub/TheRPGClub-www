// A key unique within this page load, for a staged item that has no id yet
// (a pending upload, a new Release). Unlike crypto.randomUUID it works
// outside a secure context (plain-http LAN or preview hosts).
let counter = 0;

export function localKey(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}
