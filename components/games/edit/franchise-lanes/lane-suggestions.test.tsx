import { isValidElement, type ComponentProps, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { FranchiseSuggestion } from "@/lib/games/game-edit/franchise-suggestions";
import { LaneSuggestions, laneSuggestionSlot } from "./lane-suggestions";

function suggestion(id: number, name: string, over: Partial<FranchiseSuggestion> = {}): FranchiseSuggestion {
  return {
    franchise: { franchise_id: id, name, igdb_franchise_id: null, created_by: null, name_locked: false, merged_into_id: null },
    reason: "series_name",
    reasons: ["series_name"],
    role: "other",
    series_games_linked: 0,
    ...over,
  };
}

const list = [
  suggestion(1, "Compilation of FF VII", { role: "other" }),
  suggestion(2, "Final Fantasy VII", { role: "add_on", parent_game_id: 50, parent_title: "Final Fantasy VII Remake", reason: "title_match", reasons: ["title_match"] }),
];

const slot = (lane: "mainline" | "spinoff" | "addon", hidden: (id: number) => boolean = () => false) =>
  laneSuggestionSlot({ suggestions: list, lane, laneTitle: "Lane", roleLabel: "Role", hidden, onDismiss: vi.fn() });

function listProps(lane: "mainline" | "spinoff" | "addon", add = vi.fn()) {
  const el = slot(lane).extra?.({ query: "", add });
  if (!isValidElement(el)) throw new Error("no suggestions");
  return (el as ReactElement<ComponentProps<typeof LaneSuggestions>>).props;
}

describe("laneSuggestionSlot", () => {
  it("counts only the lane's likely role on the closed Add", () => {
    expect(slot("spinoff").hint).toBe("1 suggested");
    expect(slot("mainline").hint).toBeUndefined();
    expect(slot("mainline").extra).toBeDefined();
  });

  it("is empty once every suggestion is linked, staged or dismissed", () => {
    expect(slot("spinoff", () => true)).toEqual({});
  });

  it("keeps the listed Franchises out of the search results", () => {
    expect(slot("addon").omit?.(2)).toBe(true);
    expect(slot("addon").omit?.(3)).toBe(false);
  });

  it("brings an Add-on suggestion's parent in Add-on of only", () => {
    const add = vi.fn();
    const props = listProps("addon", add);
    props.onPick(list[1]);
    expect(add).toHaveBeenCalledWith({ franchise_id: 2, name: "Final Fantasy VII" }, { game_id: 50, name: "Final Fantasy VII Remake" });
    props.onPick(list[0]);
    expect(add).toHaveBeenLastCalledWith({ franchise_id: 1, name: "Compilation of FF VII" }, undefined);

    const other = vi.fn();
    listProps("mainline", other).onPick(list[1]);
    expect(other).toHaveBeenCalledWith({ franchise_id: 2, name: "Final Fantasy VII" }, undefined);
  });
});

describe("LaneSuggestions", () => {
  it("heads the list for the lane and lists its own first, with their reasons", () => {
    const html = renderToStaticMarkup(
      <LaneSuggestions suggestions={listProps("addon").suggestions} lane="addon" laneTitle="Add-on of" roleLabel="Add-on" onPick={vi.fn()} onDismiss={vi.fn()} />,
    );
    expect(html).toContain("Suggested for Add-on of");
    expect(html.indexOf("Final Fantasy VII<")).toBeLessThan(html.indexOf("Compilation of FF VII"));
    expect(html).toContain("Title matches");
    expect(html).toContain("Add-on of Final Fantasy VII Remake");
    expect(html).toContain("stop suggesting it for this game");
  });

  it("renders nothing with no suggestions", () => {
    expect(renderToStaticMarkup(<LaneSuggestions suggestions={[]} lane="mainline" laneTitle="Mainline in" roleLabel="Mainline" onPick={vi.fn()} onDismiss={vi.fn()} />)).toBe("");
  });
});
