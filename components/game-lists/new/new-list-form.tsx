"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createGameListAction } from "@/app/actions/game-lists";
import type { GameListGame } from "@/lib/game-lists/types";
import { PageHeader, SectionHeading } from "@/components/templates/page-header";
import { GamePickGrid } from "@/components/game-lists/new/game-pick-grid";
import { ListSettings, type ListSettingsDraft } from "@/components/game-lists/new/list-settings";
import { PickTray } from "@/components/game-lists/new/pick-tray";

// /lists/new (pick 3C, settings first): the list's name, description,
// order and who sees it, then a search to pick its first games into the
// tray, which creates the list with them in the order picked. A game page's
// New list arrives with that game already picked.
export function NewListForm({ initialPicks, badge }: { initialPicks: GameListGame[]; badge?: ReactNode }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ListSettingsDraft>({ name: "", description: "", sort: "ranked", visibility: "members" });
  const [picked, setPicked] = useState<GameListGame[]>(initialPicks);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (game: GameListGame) =>
    setPicked((now) => (now.some((g) => g.game_id === game.game_id) ? now.filter((g) => g.game_id !== game.game_id) : [...now, game]));
  const create = () =>
    startTransition(async () => {
      setError(null);
      const result = await createGameListAction(
        { name: draft.name.trim(), description: draft.description.trim() || null, sort: draft.sort, visibility: draft.visibility },
        picked.map((g) => g.game_id),
      );
      if (!result.data) {
        setError(result.error ?? "The list wasn't made.");
        return;
      }
      router.push(`/lists/${result.data.id}`);
    });

  return (
    <div className="space-y-8 pb-4">
      <PageHeader back={{ href: "/lists", label: "Lists" }} title="New list" badge={badge} />
      <ListSettings draft={draft} onChange={(next) => setDraft((d) => ({ ...d, ...next }))} />
      <section aria-labelledby="first-games" className="space-y-4">
        <SectionHeading title={<span id="first-games">First games</span>} count="Optional · add more any time" />
        <GamePickGrid picked={picked} onToggle={toggle} />
      </section>
      <PickTray
        picked={picked}
        pending={pending}
        error={error}
        blocked={draft.name.trim() ? null : "Name the list above to create it."}
        onUnpick={toggle}
        onCreate={create}
      />
    </div>
  );
}
