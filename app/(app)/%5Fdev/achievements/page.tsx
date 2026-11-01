import { notFound } from "next/navigation";
import type {
  Achievement,
  AchievementFeedGroup,
  AchievementFeedHighlight,
  AchievementProvider,
  AchievementSet,
  AchievementUnlock,
  SetAchievement,
  UserSummary,
} from "@/lib/api/types";
import { viewFromSetAchievement, viewFromUnlock } from "@/lib/achievements";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { AchievementHoverCard } from "@/components/achievements/achievement-hover-card";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { FeedCard } from "@/components/achievements/feed-card";
import { ProviderBadge } from "@/components/achievements/provider-badge";
import { RarityLabel } from "@/components/achievements/rarity-label";
import { SetProgressCard } from "@/components/achievements/set-progress-card";
import { SpoilerText } from "@/components/achievements/spoiler-text";

// TEMPORARY dev-only gallery of the Achievement Hub components (www-02),
// rendered from fixtures. Delete before merging. The folder is `%5Fdev`
// because a bare `_dev` is a private folder and never routes.

export const metadata = { title: "Achievement components (dev)" };

function icon(hue: number, glyph: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="hsl(${hue} 45% 32%)"/><circle cx="32" cy="32" r="20" fill="hsl(${hue} 55% 55%)"/><text x="32" y="40" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle" fill="#fff">${glyph}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const MEMBER: UserSummary = {
  user_id: "191919191919191919",
  username: "xergg",
  global_name: "Xerg",
  is_bot: false,
  role_admin: false,
  role_moderator: false,
  role_regular: true,
};
const OTHER: UserSummary = { ...MEMBER, user_id: "282828282828282828", global_name: null, username: "mira_plays" };

function makeSet(id: number, provider: AchievementProvider, title: string | null, extra: Partial<AchievementSet> = {}): AchievementSet {
  return {
    id,
    provider,
    external_id: String(id),
    title,
    platform_label: provider === "psn" ? "PS5" : provider === "steam" ? "PC" : "SNES",
    icon_url: icon(id * 37, title?.[0] ?? "?"),
    game_id: null,
    achievements_count: 24,
    points_total: provider === "retroachievements" ? 400 : 0,
    ...extra,
  };
}

const RA_SET = makeSet(1, "retroachievements", "Chrono Trigger");
const STEAM_SET = makeSet(2, "steam", "Metaphor: ReFantazio", { achievements_count: 50 });
const PSN_SET = makeSet(3, "psn", "Final Fantasy VII Rebirth", { achievements_count: 57 });

const TIERS = ["bronze", "silver", "gold", "platinum"] as const;

function makeAchievement(i: number, provider: AchievementProvider, over: Partial<Achievement> = {}): Achievement {
  return {
    id: 1000 + i,
    name: ["Lavos Slayer", "Time Traveller", "Frog's Honour", "Magus Defeated", "Robo's Garden", "The Epoch"][i % 6],
    description: "Defeat the final threat without ever using a continue on any difficulty.",
    icon_url: icon((i * 47) % 360, String(i + 1)),
    icon_locked_url: provider === "steam" && i % 2 === 0 ? icon(0, "?") : null,
    hidden: i % 5 === 3,
    points: provider === "retroachievements" ? [5, 10, 25, 50][i % 4] : null,
    tier: provider === "psn" ? TIERS[Math.min(3, i % 4)] : null,
    display_order: i,
    rarity: [42.3, 12, 3.4, 0.06, 18.9, 7.1][i % 6],
    rarity_hardcore: provider === "retroachievements" ? [20.1, 6.2, 1.1, 0.02, 9, 3][i % 6] : null,
    ...over,
  };
}

function setAchievements(provider: AchievementProvider, n: number, earned: number): SetAchievement[] {
  return Array.from({ length: n }, (_, i) => {
    const unlocked = i % 3 !== 1 && i < earned + 4;
    return {
      ...makeAchievement(i, provider),
      unlocked_at: unlocked ? (i === 2 ? "1970-01-01T00:00:00Z" : `2026-10-${String(10 + (i % 18)).padStart(2, "0")}T18:00:00Z`) : null,
      hardcore: provider === "retroachievements" && unlocked && i % 2 === 0,
      viewer_unlocked: i % 10 === 8,
    };
  });
}

function unlock(i: number, set: AchievementSet, over: Partial<AchievementUnlock> = {}): AchievementUnlock {
  return {
    id: 5000 + i,
    user_id: MEMBER.user_id,
    unlocked_at: "2026-10-31T21:10:00Z",
    hardcore: set.provider === "retroachievements" && i % 2 === 0,
    highlight: null,
    viewer_unlocked: false,
    achievement: makeAchievement(i, set.provider),
    achievement_set: set,
    ...over,
  };
}

const GROUP: AchievementFeedGroup = {
  kind: "group",
  user: MEMBER,
  achievement_set: RA_SET,
  day: "2026-10-31",
  count: 13,
  latest_unlocked_at: "2026-10-31T21:10:00Z",
  unlocks: Array.from({ length: 8 }, (_, i) => unlock(i, RA_SET)),
};
const SMALL_GROUP: AchievementFeedGroup = {
  ...GROUP,
  user: OTHER,
  achievement_set: makeSet(4, "steam", null),
  count: 2,
  unlocks: [unlock(10, makeSet(4, "steam", null)), unlock(11, makeSet(4, "steam", null))],
};
const PLATINUM: AchievementFeedHighlight = {
  ...unlock(20, PSN_SET, { highlight: "platinum", achievement: makeAchievement(3, "psn", { name: "Gilded Legend", tier: "platinum", hidden: false, rarity: 4.1 }) }),
  kind: "highlight",
  user: MEMBER,
};
const RARE_HIDDEN: AchievementFeedHighlight = {
  ...unlock(21, RA_SET, { highlight: "rare", hardcore: true, achievement: makeAchievement(3, "retroachievements", { hidden: true }) }),
  kind: "highlight",
  user: OTHER,
};
const MASTERY: AchievementFeedHighlight = {
  ...unlock(22, RA_SET, { highlight: "mastery", hardcore: true, unlocked_at: "1970-01-01T00:00:00Z" }),
  kind: "highlight",
  user: MEMBER,
};

const PROGRESS = {
  earned_count: 17,
  hardcore_earned_count: 12,
  total_count: 24,
  points_earned: 260,
  completed_at: null,
  mastered_at: null,
  platinum_at: null,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-headline border-b-2 border-paper pb-2 text-[1.875rem]">{title}</h2>
      {children}
    </section>
  );
}

export default function AchievementsDevPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const raGrid = setAchievements("retroachievements", 24, 14).map((a) => viewFromSetAchievement(a, "retroachievements"));
  const psnGrid = setAchievements("psn", 16, 9).map((a) => viewFromSetAchievement(a, "psn"));
  const steamGrid = setAchievements("steam", 12, 5).map((a) => viewFromSetAchievement(a, "steam"));
  const hiddenView = viewFromUnlock(unlock(3, RA_SET, { achievement: makeAchievement(3, "retroachievements", { hidden: true }) }));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 pb-16">
      <h1 className="font-headline border-b-2 border-paper pb-2 text-5xl sm:text-6xl">Achievement components</h1>

      <Section title="Badges and labels">
        <div className="flex flex-wrap items-center gap-3">
          <ProviderBadge provider="retroachievements" />
          <ProviderBadge provider="steam" />
          <ProviderBadge provider="psn" />
          <ProviderBadge provider="retroachievements" short />
          <RarityLabel rarity={42.3} />
          <RarityLabel rarity={3.4} />
          <RarityLabel rarity={0.02} hardcore />
        </div>
        <p className="max-w-prose text-paper-dim">
          Spoiler: <SpoilerText spoiler>Defeat Lavos before the Day of Lavos.</SpoilerText>{" "}
          Not a spoiler: <SpoilerText spoiler={false}>Visit the End of Time.</SpoilerText>
        </p>
      </Section>

      <Section title="Icons">
        <div className="flex flex-wrap items-end gap-3">
          {TIERS.map((tier, i) => {
            const view = viewFromUnlock(unlock(i, PSN_SET, { achievement: makeAchievement(i, "psn", { tier }) }));
            return (
              <AchievementHoverCard key={tier} view={view}>
                <AchievementIcon view={view} size="lg" />
              </AchievementHoverCard>
            );
          })}
          <AchievementHoverCard view={viewFromUnlock(unlock(0, RA_SET, { hardcore: true }))}>
            <AchievementIcon view={viewFromUnlock(unlock(0, RA_SET, { hardcore: true }))} size="lg" />
          </AchievementHoverCard>
          <AchievementIcon view={{ ...hiddenView, unlocked: false }} size="lg" />
          <AchievementIcon view={{ ...hiddenView, iconUrl: null }} size="lg" />
          <AchievementIcon view={hiddenView} size="md" />
          <AchievementIcon view={hiddenView} size="sm" />
        </div>
      </Section>

      <Section title="Grids">
        <AchievementGrid items={raGrid} />
        <AchievementGrid items={psnGrid} order="display" />
        <AchievementGrid items={steamGrid} />
        <AchievementGrid items={[]} />
      </Section>

      <Section title="Set progress">
        <div className="grid gap-5 md:grid-cols-2">
          <SetProgressCard set={RA_SET} progress={PROGRESS} href="#" />
          <SetProgressCard set={RA_SET} progress={{ ...PROGRESS, earned_count: 24, hardcore_earned_count: 24, points_earned: 400, completed_at: "2026-10-30T00:00:00Z", mastered_at: "2026-10-30T00:00:00Z" }} href="#" />
          <SetProgressCard set={PSN_SET} progress={{ ...PROGRESS, earned_count: 57, total_count: 57, hardcore_earned_count: 0, points_earned: 0, completed_at: "2026-10-30T00:00:00Z", platinum_at: "2026-10-30T00:00:00Z" }} href="#" />
          <SetProgressCard set={STEAM_SET} progress={{ ...PROGRESS, earned_count: 1, total_count: 50, hardcore_earned_count: 0, points_earned: 0 }} />
          <SetProgressCard set={makeSet(5, "steam", null, { icon_url: null })} progress={null} />
        </div>
      </Section>

      <Section title="Feed">
        <div className="grid gap-5 md:grid-cols-2">
          <FeedCard card={GROUP} />
          <FeedCard card={SMALL_GROUP} />
          <FeedCard card={PLATINUM} />
          <FeedCard card={RARE_HIDDEN} />
          <FeedCard card={MASTERY} />
        </div>
      </Section>
    </div>
  );
}
