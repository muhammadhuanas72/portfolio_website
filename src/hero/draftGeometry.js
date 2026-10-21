// Shared definition of "The Draft" — the hero object.
// A cube lattice built from three stacked modules (one per project) around a core.
// Both the SVG line drawing and the WebGL chrome render are built from this data,
// so the two renderings always line up.

const GAP = 0.06;
const SLAB = (2 - GAP * 2) / 3;

// Each module is an axis-aligned box in a -1..1 cube, stacked along Y.
export const MODULES = [0, 1, 2].map((i) => {
  const y0 = -1 + i * (SLAB + GAP);
  return {
    index: i,
    min: [-1, y0, -1],
    max: [1, y0 + SLAB, 1],
  };
});

export const CORE_RADIUS = 0.42;

// The 12 edges of a box as [start, end] point pairs.
export function boxEdges({ min, max }) {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;
  const c = [
    [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
    [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
  ];
  return [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ].map(([a, b]) => [c[a], c[b]]);
}

// Resting pose, shared by the SVG drawing and the WebGL scene (radians).
export const REST_POSE = { rotX: -0.42, rotY: 0.68 };

// Rotate a point by the pose and project it with a light perspective.
export function project([x, y, z], { rotX, rotY }, scale = 1, distance = 6) {
  const cy = Math.cos(rotY), sy = Math.sin(rotY);
  const cx = Math.cos(rotX), sx = Math.sin(rotX);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const y2 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  const p = distance / (distance - z2);
  return { x: x1 * p * scale, y: -y2 * p * scale, depth: z2 };
}
