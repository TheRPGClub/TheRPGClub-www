import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("rpgclub_token")?.value;
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
