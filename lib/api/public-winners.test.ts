import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicWinner } from "./types";

// The Share Card read stays cheap while the API sleeps: a failed read falls
// back to the last good winners and isn't retried for a while, so every
// page's metadata doesn't wait out the timeout again.

const WINNER: PublicWinner = {
  round_number: 42,
  month_year: "2026-11",
  kind: "gotm",
  game_id: 1,
  title: "Chrono Trigger",
  cover_url: null,
  art_url: null,
};

const fetchMock = vi.fn<typeof fetch>();
const ok = () => new Response(JSON.stringify({ data: [WINNER] }), { status: 200 });

async function load() {
  vi.resetModules();
  return import("./public-winners");
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.useFakeTimers({ toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("fetchShareCardWinners", () => {
  it("reads the winners", async () => {
    const { fetchShareCardWinners } = await load();
    fetchMock.mockResolvedValueOnce(ok());
    expect(await fetchShareCardWinners()).toEqual([WINNER]);
  });

  it("falls back to the last good read when the API is down", async () => {
    const { fetchShareCardWinners } = await load();
    fetchMock.mockResolvedValueOnce(ok());
    await fetchShareCardWinners();
    fetchMock.mockRejectedValueOnce(new Error("timeout"));
    expect(await fetchShareCardWinners()).toEqual([WINNER]);
  });

  it("is empty when no read has worked yet", async () => {
    const { fetchShareCardWinners } = await load();
    fetchMock.mockResolvedValueOnce(new Response("", { status: 502 }));
    expect(await fetchShareCardWinners()).toEqual([]);
  });

  it("doesn't ask the API again for a while after a failure", async () => {
    const { fetchShareCardWinners, SHARE_CARD_RETRY_AFTER_MS } = await load();
    fetchMock.mockRejectedValueOnce(new Error("timeout"));
    await fetchShareCardWinners();
    await fetchShareCardWinners();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(Date.now() + SHARE_CARD_RETRY_AFTER_MS);
    fetchMock.mockResolvedValueOnce(ok());
    expect(await fetchShareCardWinners()).toEqual([WINNER]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("takes a 4xx as an answer: no winners", async () => {
    const { fetchShareCardWinners } = await load();
    fetchMock.mockResolvedValueOnce(ok());
    await fetchShareCardWinners();
    fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));
    expect(await fetchShareCardWinners()).toEqual([]);
  });
});
