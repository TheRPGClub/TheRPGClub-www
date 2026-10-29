// Reads an API error response. Error bodies are `{ error, message }`, where
// `error` is a machine code (e.g. `already_playing`) and `message` is prose;
// some add `errors` (e.g. 422 `invalid_csv`). A non-JSON body leaves them unset.

export interface ApiErrorBody {
  status: number;
  code?: string;
  message?: string;
  errors?: unknown;
}

export async function readApiError(res: Response): Promise<ApiErrorBody> {
  const parsed: ApiErrorBody = { status: res.status };
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object") {
      const { error, message, errors } = body as Record<string, unknown>;
      if (typeof error === "string" && error) parsed.code = error;
      if (typeof message === "string" && message) parsed.message = message;
      if (errors !== undefined) parsed.errors = errors;
    }
  } catch {
    // non-JSON error body
  }
  return parsed;
}

// A message a member can read: the mapped text for a known code, else the
// API's own message, else the raw code, else the HTTP status.
export function apiErrorMessage(
  err: ApiErrorBody,
  messages: Readonly<Record<string, string>> = {},
): string {
  if (err.code && Object.hasOwn(messages, err.code)) return messages[err.code];
  return err.message ?? err.code ?? `Request failed (HTTP ${err.status}).`;
}
