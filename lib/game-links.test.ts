import { describe, expect, it } from "vitest";

import { gameLinkErrorMessage, versionPickProblem } from "./game-links";

describe("gameLinkErrorMessage for a version unlink", () => {
  it("names the Admin gate and a pair that isn't linked", () => {
    expect(gameLinkErrorMessage("version-unlink", 403)).toBe("Only Admins and Superadmins can unlink versions.");
    expect(gameLinkErrorMessage("version-unlink", 404)).toBe("Those games aren't linked as versions any more.");
    expect(gameLinkErrorMessage("version-unlink", 401)).toBe("Your session has ended. Sign in again.");
  });
});

describe("versionPickProblem", () => {
  it("refuses the game itself and a game already linked", () => {
    expect(versionPickProblem(1, 1, [])).toBe("That's this game. Pick another one.");
    expect(versionPickProblem(2, 1, [2])).toBe("Already linked as a version.");
    expect(versionPickProblem(3, 1, [2])).toBeNull();
  });
});
