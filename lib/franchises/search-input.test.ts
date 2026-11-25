import { describe, expect, it } from "vitest";
import { searchInput, searchPushed, searchTyped, searchUrlChanged } from "./search-input";

describe("Find a Franchise's input against the URL", () => {
  it("keeps what was typed when its own pushes land late", () => {
    let s = searchInput("/franchises", "");
    s = searchTyped(s, "fi");
    s = searchPushed(s, "/franchises?q=fi", "fi");
    s = searchTyped(s, "fina");
    s = searchPushed(s, "/franchises?q=fina", "fina");
    s = searchTyped(s, "final f");

    const landed = searchUrlChanged(s, "/franchises?q=fi", "fi");
    expect(landed.cancel).toBe(false);
    expect(landed.next.query).toBe("final f");
    const last = searchUrlChanged(landed.next, "/franchises?q=fina", "fina");
    expect(last.next.query).toBe("final f");
  });

  it("follows the URL's search when something else changed it, and drops a pending push", () => {
    let s = searchInput("/franchises?q=mana", "mana");
    s = searchTyped(s, "mana k");

    const letter = searchUrlChanged(s, "/franchises?letter=A", "");
    expect(letter).toMatchObject({ cancel: true, next: { query: "" } });

    const back = searchUrlChanged(letter.next, "/franchises?q=mana", "mana");
    expect(back).toMatchObject({ cancel: true, next: { query: "mana" } });
  });

  it("keeps the typed text when another change leaves the search as this input last pushed", () => {
    let s = searchInput("/franchises", "");
    s = searchPushed(searchTyped(s, "ys"), "/franchises?q=ys", "ys");
    s = searchUrlChanged(s, "/franchises?q=ys", "ys").next;
    s = searchTyped(s, "ys o");

    const sort = searchUrlChanged(s, "/franchises?q=ys&sort=games", "ys");
    expect(sort).toMatchObject({ cancel: true, next: { query: "ys o" } });
  });

  it("does nothing while the URL stays put", () => {
    const s = searchTyped(searchInput("/franchises", ""), "a");
    expect(searchUrlChanged(s, "/franchises", "")).toEqual({ next: s, cancel: false });
  });
});
