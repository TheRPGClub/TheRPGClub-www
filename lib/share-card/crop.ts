// object-fit: cover with an object-position, done ahead of time: the card's
// renderer (Satori) can't be trusted with object-position, so the key art is
// scaled and cropped with sharp to exactly the box it fills.

export type CoverCrop = {
  // The size to scale the source to.
  width: number;
  height: number;
  // The box to cut out of the scaled image.
  left: number;
  top: number;
};

export function coverCrop(
  source: { width: number; height: number },
  box: { width: number; height: number },
  // 0..1 across and down, as object-position percentages.
  position: { x: number; y: number },
): CoverCrop {
  const scale = Math.max(box.width / source.width, box.height / source.height);
  const width = Math.max(box.width, Math.round(source.width * scale));
  const height = Math.max(box.height, Math.round(source.height * scale));
  return {
    width,
    height,
    left: Math.round((width - box.width) * position.x),
    top: Math.round((height - box.height) * position.y),
  };
}

// Where "The Cover" draws the GOTM's key art: the right 820px of the card,
// under the dark fade, framed a little right of centre and high, as the
// front page frames it.
export const SHARE_CARD_ART = {
  left: 380,
  width: 820,
  height: 630,
  position: { x: 0.62, y: 0.3 },
} as const;
