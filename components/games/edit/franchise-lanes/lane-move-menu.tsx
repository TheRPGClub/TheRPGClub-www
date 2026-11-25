"use client";

import { ArrowLeftRight } from "lucide-react";
import { FRANCHISE_ROLES, type FranchiseRole } from "@/lib/games/game-edit/franchises";
import { LANE_COPY } from "@/lib/games/game-edit/franchise-lanes-copy";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// A context card's Move (www#207): a ghost button with two arrows opening
// "Move to <lane>" for the other two lanes.
export function LaneMoveMenu({ name, role, onMove }: { name: string; role: FranchiseRole; onMove: (to: FranchiseRole) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={`Move ${name} to another lane`} title="Move" />}>
        <ArrowLeftRight />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {FRANCHISE_ROLES.filter((r) => r !== role).map((r) => (
          <DropdownMenuItem key={r} onClick={() => onMove(r)}>
            {LANE_COPY[r].move}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
