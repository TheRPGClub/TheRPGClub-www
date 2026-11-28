import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { ThemeCard } from "@/lib/theme-picker";
import { LayoutTab } from "./layout-tab";
import { ThemePicker } from "./theme-picker";

vi.mock("@/app/actions/member-theme", () => ({ chooseThemeAction: vi.fn() }));
vi.mock("@/app/actions/dashboard-panels", () => ({ resetDashboardPanelsAction: vi.fn() }));
vi.mock("@/app/actions/pinned-pages", () => ({ resetPinnedPagesAction: vi.fn() }));
// Each swatch carries its Theme's font classes; next/font only runs in Next.
vi.mock("@/themes/aero/fonts", () => ({ aeroFonts: "aero-fonts" }));
vi.mock("@/themes/monthly-issue/fonts", () => ({ monthlyIssueFonts: "monthly-issue-fonts" }));

// Aero's stylesheet isn't shipped yet (www#252), so themeCards drops it: the
// cards are built by hand here, as the API would send them for staff.
const card = (over: Partial<ThemeCard>): ThemeCard => ({
  key: "monthly-issue",
  name: "Monthly Issue",
  clubDefault: true,
  chosen: true,
  available: true,
  staffPreview: false,
  ...over,
});
const mi = card({});
const aero = card({ key: "aero", name: "Frutiger Aero", clubDefault: false, chosen: false, staffPreview: true });

const render = (cards: ThemeCard[]) => renderToStaticMarkup(<ThemePicker cards={cards} />);

describe("ThemePicker", () => {
  it("draws one toggle card per Theme, each swatch under its own data-theme", () => {
    const html = render([mi, aero]);
    // A toggle group, not a radio group: arrows only move focus there.
    expect(html).toContain('role="group"');
    expect(html).not.toContain('role="radio');
    expect(html).toContain('aria-label="Theme"');
    expect(html.match(/<button[^>]*data-slot="toggle-group-item"[^>]*data-variant="theme-card"/g)).toHaveLength(2);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
    expect(html).toContain('data-theme="monthly-issue"');
    expect(html).toContain('data-theme="aero"');
    expect(html).toContain("2 Themes");
  });

  it("marks the club default, the Member's Theme and a staff preview", () => {
    const html = render([mi, aero]);
    expect(html).toContain("Club default");
    expect(html).toContain("Wearing");
    expect(html).toContain("Staff preview");
    expect(html).not.toContain("Back when staff release it");
  });

  it("keeps an unavailable stored Theme chosen, greyed and disabled", () => {
    const html = render([{ ...mi, chosen: false }, { ...aero, chosen: true, available: false, staffPreview: false }]);
    expect(html).toContain("Yours");
    expect(html).toContain("Back when staff release it");
    expect(html).not.toContain("Wearing");
    expect(html).not.toContain("Staff preview");
  });
});

describe("LayoutTab", () => {
  const tab = (themes: ThemeCard[] | null) =>
    renderToStaticMarkup(<LayoutTab pinsCustomised={false} pinsDefault="Voting" panelsCustomised={false} themes={themes} />);

  it("puts the Theme picker above the layout rows when there are cards", () => {
    const html = tab([mi, aero]);
    expect(html.indexOf("Your Theme")).toBeGreaterThan(-1);
    expect(html.indexOf("Your Theme")).toBeLessThan(html.indexOf("Your layout"));
  });

  it("leaves the picker out without cards", () => {
    expect(tab(null)).not.toContain("Your Theme");
  });
});
