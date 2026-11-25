import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

// The signed-in member's API token, from their cookie.
export async function apiToken(): Promise<string | undefined> {
  return (await cookies()).get("rpgclub_token")?.value;
}

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return apiFetchAs(await apiToken(), path, init);
}

// apiFetch with the token given rather than read from the cookie, for a
// cache scope (lib/api/shared.ts), where cookies() can't be read.
export function apiFetchAs(
  token: string | undefined,
  path: string,
  init?: RequestInit
): Promise<Response> {
  // A FormData body is multipart: fetch sets the Content-Type with its
  // boundary, so the JSON default must stay off.
  const multipart = init?.body instanceof FormData;

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(multipart ? { Accept: "application/json" } : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}
