# Frutiger Aero scene: provenance

Every file here is original art made for the Aero rendition round (www#251, spec api#523) on 2026-11-27 and 2026-11-28, by the Python scripts in `source/`. No third-party art, clip-art, photos or traced references, and no brand marks. The owner's mood references (`specs/themes/design/refs/`) were looked at, never copied or shipped.

The scene is rendition O, the owner's pick: rendition H's lagoon with M's rolling hills, a 25% larger skyline and a light touch of N's greenery (two corner leaf clusters, one waterline spray, lily pads). The left-edge fern spray was taken out at the owner's request (2026-11-28) and is not shipped.

## Where each file comes from

`source/build-scene.py` (rendition H; run `python3 -I build-scene.py`, it writes beside itself):

- `sky.webp`: cumulus banks, high wisps, Y2K light swooshes and glints, rasterised at 2000px from the script's `sky.svg` so the blur-heavy clouds don't hold up first paint.
- `shore.svg`: pale glass towers with sky reflections, a geodesic glass dome, hazy hills, a treeline.
- `globe.svg`, `globe-phone.svg`: the centrepiece, a glass globe knocked open at the top pouring a water ribbon into the lagoon (phone: a longer fall).
- `dolphin.svg`: a dolphin leaping from a splash crown.
- `sea.svg`: surface crests and sparkles, light shafts, fish and silver schools.
- `deep.svg`: a mid-water tile with jellyfish and schools.
- `seabed.svg`: sand, corals, rocks, sea grass, starfish, reef fish.
- `bubbles.svg`: a rising glass-bubble tile.
- `waves.webp`: the Wii-style fog ribbons, rasterised at 1600px from the script's `waves.svg` (the blurred SVG overloaded software raster).

`source/build-hills.py` (rendition M):

- `hills.svg`: far and mid grassy ranges with glossy tree clusters (whole-period waves, so it repeats on x).
- `meadow.svg`: the near grass bank with blades, small trees and wildflowers.
- `butterflies.svg`: sparse upright butterflies.

`source/build-greenery.py` (rendition N):

- `frame-tr.webp`, `frame-bl.webp`: corner clusters of glossy broad leaves and fern fronds, rasterised from the script's `frame-tr.svg` / `frame-bl.svg` at twice their largest drawn size (600px, 680px).
- `frame-edge-r.webp`: the right waterline spray, from `frame-edge-r.svg` at 480×508.
- `lilies.svg`: lily pads with cup blossoms, repeat-x.

`source/make-caustics.py` (rendition D; `python3 -I make-caustics.py <folder>`):

- `caustics-a.webp`, `caustics-b.webp`: tileable Worley-noise caustic lines on transparency, 512px, converted from the script's PNGs.

## How they were optimised for the website

- SVGs: `python3 -I source/svgmin.py in.svg out.svg` (drops comments and whitespace between tags, rounds numbers).
- WebP: ImageMagick (`magick -background none in.svg -resize WxH -quality 82 -define webp:alpha-quality=90 out.webp`; caustics at quality 55, alpha 60).

The scene weighs about 360 KB over the wire (SVGs gzipped), loaded only by a Member wearing Aero: a background image downloads only when its rule matches.
