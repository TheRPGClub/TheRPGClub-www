import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { SessionTheme } from "@/lib/auth-types";
import { themeCards, type ThemeCard } from "@/lib/theme-picker";
import { LayoutTab } from "./layout-tab";
import { ThemePicker } from "./theme-picker";

vi.mock("@/app/actions/member-theme", () => ({ chooseThemeAction: vi.fn() }));
vi.mock("@/app/actions/dashboard-panels", () => ({ resetDashboardPanelsAction: vi.fn() }));
vi.mock("@/app/actions/pinned-pages", () => ({ resetPinnedPagesAction: vi.fn() }));
// Each swatch carries its Theme's font classes; next/font only runs in Next.
vi.mock("@/themes/aero/fonts", () => ({ aeroFonts: "aero-fonts" }));
vi.mock("@/themes/monthly-issue/fonts", () => ({ monthlyIssueFonts: "monthly-issue-fonts" }));

// The cards as themeCards builds them from the session's Themes, for staff
// (Aero a Staff preview), against the real registry.
const monthly: SessionTheme = { key: "monthly-issue", name: "Monthly Issue", released: true, available: true };
const aeroTheme: SessionTheme = { key: "aero", name: "Frutiger Aero", released: false, available: true };
const [mi, aero] = themeCards({ chosen: null, list: [monthly, aeroTheme] })!;

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
    expect(html).not.toContain('aria-disabled="true"');
  });

  it("keeps an unavailable stored Theme chosen, greyed and disabled", () => {
    const html = render([{ ...mi, chosen: false }, { ...aero, chosen: true, available: false, staffPreview: false }]);
    expect(html).toContain("Yours");
    expect(html).toContain("Back when staff release it");
    expect(html).not.toContain("Wearing");
    expect(html).not.toContain("Staff preview");
    const buttons = html.match(/<button[^>]*data-slot="toggle-group-item"[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toContain('aria-disabled="false"');
    expect(buttons[1]).toContain('aria-disabled="true"');
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
