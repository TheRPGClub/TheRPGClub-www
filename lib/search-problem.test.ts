import { describe, expect, it } from "vitest";
import { searchProblem } from "./search-problem";

// What a search inside a page shows when its endpoint does not answer 2xx.
describe("searchProblem", () => {
  it("names a lapsed session as a sign-in problem", () => {
    expect(searchProblem(401)).toEqual({ message: "Your session has ended.", signIn: true });
  });

  it.each([500, 502, 404, 403])("asks for another try on %i", (status) => {
    expect(searchProblem(status)).toEqual({ message: "Search failed. Try again.", signIn: false });
  });

  it("says who may search when the role is missing", () => {
    expect(searchProblem(403, { forbidden: "Only staff can search." })).toEqual({
      message: "Only staff can search.",
      signIn: false,
    });
  });

  it("asks for another try when the request never answered", () => {
    expect(searchProblem(null)).toEqual({ message: "Search failed. Try again.", signIn: false });
  });
});
