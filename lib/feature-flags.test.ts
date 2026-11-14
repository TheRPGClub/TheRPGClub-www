import { describe, expect, it } from "vitest";

import { draftAfterPanel, reasonForChange } from "@/lib/feature-flags";

// A Feature Flag row's reason draft: typed in the reason note it rides with
// the next state picked; typed in the Off confirm it was written for the Off.
describe("draftAfterPanel", () => {
  it("drops the Off confirm's reason when the confirm closes any way but Off", () => {
    expect(draftAfterPanel("confirm", null, "Sync broken")).toBe("");
    expect(draftAfterPanel("confirm", "reason", "Sync broken")).toBe("");
  });

  it("keeps the draft while the confirm stays open", () => {
    expect(draftAfterPanel("confirm", "confirm", "Sync broken")).toBe("Sync broken");
  });

  it("keeps a reason note's draft when the note opens, closes or turns into the confirm", () => {
    expect(draftAfterPanel("reason", null, "Ready")).toBe("Ready");
    expect(draftAfterPanel("reason", "confirm", "Ready")).toBe("Ready");
    expect(draftAfterPanel(null, "reason", "Ready")).toBe("Ready");
  });
});

describe("reasonForChange", () => {
  it("sends the draft with Off from the confirm", () => {
    expect(reasonForChange("confirm", "off", "Sync broken")).toBe("Sync broken");
  });

  it("sends no reason with Preview or Live picked while the Off confirm is open", () => {
    expect(reasonForChange("confirm", "live", "Sync broken")).toBe("");
    expect(reasonForChange("confirm", "preview", "Sync broken")).toBe("");
  });

  it("sends the reason note's draft with whatever state is picked next", () => {
    expect(reasonForChange("reason", "live", "Ready")).toBe("Ready");
    expect(reasonForChange(null, "preview", "Ready")).toBe("Ready");
  });
});
