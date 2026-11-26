import { describe, expect, it } from "vitest";
import { coverCrop } from "./crop";

const BOX = { width: 820, height: 630 };

describe("coverCrop", () => {
  it("scales a wide image to the box height and cuts at the position", () => {
    // 1920x1080 -> scale 630/1080 -> 1120x630; 300px spare across.
    expect(coverCrop({ width: 1920, height: 1080 }, BOX, { x: 0.62, y: 0.3 })).toEqual({
      width: 1120,
      height: 630,
      left: 186,
      top: 0,
    });
  });

  it("scales a tall image to the box width and cuts down the spare height", () => {
    // 1000x2000 -> scale 0.82 -> 820x1640; 1010px spare down.
    expect(coverCrop({ width: 1000, height: 2000 }, BOX, { x: 0.62, y: 0.3 })).toEqual({
      width: 820,
      height: 1640,
      left: 0,
      top: 303,
    });
  });

  it("upscales a small image to cover the box", () => {
    const crop = coverCrop({ width: 410, height: 315 }, BOX, { x: 0.5, y: 0.5 });
    expect(crop).toEqual({ width: 820, height: 630, left: 0, top: 0 });
  });
});
