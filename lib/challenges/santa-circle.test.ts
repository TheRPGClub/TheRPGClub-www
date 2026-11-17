import { describe, expect, it } from "vitest";
import { santaCircle, yourSanta } from "@/lib/challenges/santa-circle";
import type { ChallengeMember, EditionAssignment } from "@/lib/challenges/types";

const m = (id: string): ChallengeMember => ({ user_id: id, username: `m${id}`, global_name: `Member ${id}` });

// A circle 1 -> 2 -> 3 -> 4 -> 1, served by recipient.
const give = (santa: string, recipient: string, extra: Partial<EditionAssignment> = {}): EditionAssignment => ({
  recipient: m(recipient),
  santa: m(santa),
  game: { game_id: Number(recipient), title: `Game ${recipient}` },
  picked_randomly: false,
  run: { id: Number(recipient), status: "finished", progress: {} },
  ...extra,
});
const CIRCLE = [
  give("4", "1"),
  give("1", "2", { picked_randomly: true }),
  give("2", "3", { run: { id: 3, status: "expired", progress: {} } }),
  give("3", "4"),
];

describe("santaCircle", () => {
  it("seats the members in draw order, starting from the viewer at the top", () => {
    const { seats } = santaCircle(CIRCLE, "3");
    expect(seats.map((s) => s.member.user_id)).toEqual(["3", "4", "1", "2"]);
    expect(seats[0]).toMatchObject({ x: 130, y: 26, mine: true });
    expect(seats[1]).toMatchObject({ x: 234, y: 130, mine: false });
  });

  it("draws one arrow per Santa, toned by how the Run ended, dashed for a random pick", () => {
    const { arrows } = santaCircle(CIRCLE, "9");
    expect(arrows.map((a) => [a.from, a.to, a.tone, a.dashed])).toEqual([
      ["4", "1", "finished", false],
      ["1", "2", "finished", true],
      ["2", "3", "expired", false],
      ["3", "4", "finished", false],
    ]);
    expect(arrows[0].d).toMatch(/^M[\d.]+,[\d.]+ A78,78 0 0 1 [\d.]+,[\d.]+$/);
  });

  it("shrinks the seats when a big Edition crowds the ring", () => {
    expect(santaCircle(CIRCLE, "1").seatSize).toBe(26);
    const many = Array.from({ length: 40 }, (_, i) => give(String(i), String((i + 1) % 40)));
    expect(santaCircle(many, "1").seatSize).toBeLessThan(26);
  });

  it("still seats everyone when the Santas aren't known", () => {
    const { seats, arrows } = santaCircle(
      CIRCLE.map((a) => ({ ...a, santa: null })),
      "1",
    );
    expect(seats).toHaveLength(4);
    expect(arrows).toHaveLength(0);
  });
});

describe("yourSanta", () => {
  it("names the viewer's Santa", () => {
    expect(yourSanta(CIRCLE, "3")?.user_id).toBe("2");
    expect(yourSanta(CIRCLE, "9")).toBeNull();
  });
});
