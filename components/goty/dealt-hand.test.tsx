import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { GotyNominationsState } from "@/hooks/use-goty-nominations";
import { nomination } from "@/lib/goty/test-fixtures";
import { BallotCard } from "./ballot-card";
import { DealtHand } from "./dealt-hand";

const state = (over: Partial<GotyNominationsState> = {}) =>
  ({ pending: false, withdrawing: null, replacing: null, withdraw: vi.fn(), cancel: vi.fn(), startReplacing: vi.fn(), ...over }) as GotyNominationsState;

const spinners = (html: string) => html.match(/animate-spin/g)?.length ?? 0;

describe("DealtHand", () => {
  it("shows a nomination the API sent without its game, so it can be withdrawn", () => {
    const html = renderToStaticMarkup(
      <DealtHand mine={[{ ...nomination(4, 12, "me"), game: null }]} year={2026} state={state()} open />,
    );
    expect(html).toContain("Game #12");
    expect(html).toContain("Withdraw");
    expect(html.match(/Open slot/g)).toHaveLength(2);
  });

  it("spins only the card being withdrawn", () => {
    const mine = [nomination(1, 10, "me"), nomination(2, 11, "me")];
    const html = renderToStaticMarkup(<DealtHand mine={mine} year={2026} state={state({ pending: true, withdrawing: 2 })} open />);
    expect(spinners(html)).toBe(1);
    expect(html.indexOf("animate-spin")).toBeGreaterThan(html.indexOf("Game 11"));
  });
});

describe("BallotCard", () => {
  it("waits while another card's vote is being cast, without its spinner", () => {
    const html = renderToStaticMarkup(
      <BallotCard award="gotm" game={{ game_id: 1, title: "A" }} note="" count={null} voted={false} canVote pending={false} busy onVote={vi.fn()} />,
    );
    expect(html).toMatch(/<button[^>]*disabled=""/);
    expect(spinners(html)).toBe(0);
  });
});
