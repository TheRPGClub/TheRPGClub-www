import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag }));

const { POST } = await import("./route");

function post(authorization?: string) {
  const headers = new Headers();
  if (authorization !== undefined) headers.set("authorization", authorization);
  return POST(new Request("https://www.rpgclub.test/api/revalidate", { method: "POST", headers }));
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTag.mockClear();
    vi.stubEnv("REVALIDATE_SECRET", "s3cret-value");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("revalidates the gotm tag with the right secret", async () => {
    const res = await post("Bearer s3cret-value");
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("gotm", "max");
  });

  it.each([
    ["a wrong secret", "Bearer nope"],
    ["a longer secret", "Bearer s3cret-value-and-more"],
    ["a prefix of the secret", "Bearer s3cret"],
    ["no Bearer scheme", "s3cret-value"],
    ["an empty bearer", "Bearer "],
    ["no header", undefined],
  ])("answers 401 for %s", async (_label, authorization) => {
    const res = await post(authorization);
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("answers 503 while the secret is unset", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");
    const res = await post("Bearer ");
    expect(res.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
