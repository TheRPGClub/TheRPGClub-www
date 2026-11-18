import { describe, expect, it } from "vitest";
import { readApiError } from "@/lib/api/errors";

const response = (status: number, body: string) => new Response(body, { status });

describe("readApiError", () => {
  it("reads the code and message, and keeps the body for codes that carry more", async () => {
    const res = response(422, JSON.stringify({ error: "backlog_too_small", message: "Too few.", minimum: 5, backlog_count: 3 }));
    expect(await readApiError(res)).toEqual({
      status: 422,
      code: "backlog_too_small",
      message: "Too few.",
      body: { error: "backlog_too_small", message: "Too few.", minimum: 5, backlog_count: 3 },
    });
  });

  it("leaves a non-JSON body unread", async () => {
    expect(await readApiError(response(502, "<html>"))).toEqual({ status: 502 });
  });
});
