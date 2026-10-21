// Geometric construction letterforms for the footer wordmark.
// Units: cap height 100, baseline at y=100. Each glyph is a list of closed polygons;
// the first is the outline, any others are counters (holes), drawn with even-odd fill.
// Chamfered corners echo an architect's drafting alphabet.

const GLYPHS = {
  A: {
    w: 88,
    polys: [
      [[0, 100], [0, 24], [24, 0], [64, 0], [88, 24], [88, 100], [66, 100], [66, 66], [22, 66], [22, 100]],
      [[22, 46], [22, 30], [30, 20], [58, 20], [66, 30], [66, 46]],
    ],
  },
  N: {
    w: 84,
    polys: [[[0, 100], [0, 0], [22, 0], [62, 62], [62, 0], [84, 0], [84, 100], [62, 100], [22, 38], [22, 100]]],
  },
  S: {
    w: 84,
    polys: [
      [
        [16, 0], [84, 0], [84, 20], [22, 20], [22, 40], [68, 40], [84, 56], [84, 84], [68, 100],
        [0, 100], [0, 80], [62, 80], [62, 60], [16, 60], [0, 44], [0, 16],
      ],
    ],
  },
  M: {
    w: 100,
    polys: [[[0, 100], [0, 0], [24, 0], [50, 40], [76, 0], [100, 0], [100, 100], [78, 100], [78, 38], [56, 72], [44, 72], [22, 38], [22, 100]]],
  },
  ".": {
    w: 20,
    polys: [[[0, 80], [20, 80], [20, 100], [0, 100]]],
  },
};

const TRACKING = 10;
const SPACE = 36;

/** Lays out a word; returns glyph placements and the total advance width. */
export function layoutWord(text) {
  let x = 0;
  const glyphs = [];
  for (const ch of text.toUpperCase()) {
    if (ch === " ") {
      x += SPACE - TRACKING;
      continue;
    }
    const g = GLYPHS[ch];
    if (!g) continue;
    glyphs.push({
      ch,
      x,
      w: g.w,
      polys: g.polys.map((poly) => poly.map(([px, py]) => [px + x, py])),
    });
    x += g.w + TRACKING;
  }
  return { glyphs, width: x - TRACKING };
}

export const toPath = (polys) => polys.map((p) => `M${p.map(([x, y]) => `${x} ${y}`).join("L")}Z`).join("");
