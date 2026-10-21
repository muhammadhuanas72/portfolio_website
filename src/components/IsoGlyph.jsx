// Isometric line drawings in the drafting style. Coordinates are in model units and
// projected with a standard 30° isometric so every glyph shares one perspective.

import { C, S, iso, pts } from "../lib/iso";

function Box({ o = [0, 0, 0], w, h, d, hidden = true }) {
  const [x, y, z] = o;
  const top = [[x, y + h, z], [x + w, y + h, z], [x + w, y + h, z + d], [x, y + h, z + d]];
  const front = [[x + w, y, z], [x + w, y, z + d], [x, y, z + d]];
  return (
    <g>
      <polygon points={pts(top)} />
      <polyline points={pts([[x + w, y + h, z], front[0], front[1], front[2], [x, y + h, z + d]])} />
      <line {...seg([x + w, y + h, z + d], front[1])} />
      {hidden && (
        <g strokeDasharray="2 3" opacity="0.6">
          <polyline points={pts([[x, y + h, z], [x, y, z], [x + w, y, z]])} />
          <line {...seg([x, y, z], [x, y, z + d])} />
        </g>
      )}
    </g>
  );
}

function seg(a, b) {
  const [x1, y1] = iso(a);
  const [x2, y2] = iso(b);
  return { x1, y1, x2, y2 };
}

function Ellipse({ c, r, y }) {
  // Horizontal circle (in the XZ plane) seen isometrically.
  const [cx, cy] = iso([c[0], y, c[2]]);
  return <ellipse cx={cx} cy={cy} rx={r * C * 1.414} ry={r * S * 1.414} />;
}

const glyphs = {
  // Stacked interface layers
  layers: (
    <>
      <Box o={[-30, -26, -30]} w={60} h={6} d={60} />
      <Box o={[-30, -6, -30]} w={60} h={6} d={60} />
      <Box o={[-30, 14, -30]} w={60} h={6} d={60} />
    </>
  ),
  // Block with a shaft through it: logic and data
  shaft: (
    <>
      <Box o={[-32, -10, -32]} w={64} h={14} d={64} />
      <Ellipse c={[0, 0, 0]} r={9} y={34} />
      <line {...seg([-9 * 0.7, 34, 9 * 0.7], [-9 * 0.7, 4, 9 * 0.7])} />
      <line {...seg([9 * 0.7, 34, -9 * 0.7], [9 * 0.7, 4, -9 * 0.7])} />
      <Ellipse c={[0, 0, 0]} r={9} y={4} />
      <g strokeDasharray="2 3" opacity="0.6">
        <line {...seg([-9 * 0.7, -10, 9 * 0.7], [-9 * 0.7, -30, 9 * 0.7])} />
        <line {...seg([9 * 0.7, -10, -9 * 0.7], [9 * 0.7, -30, -9 * 0.7])} />
        <Ellipse c={[0, 0, 0]} r={9} y={-30} />
      </g>
    </>
  ),
  // Sphere watched inside a frame: AI in the loop
  orb: (
    <>
      <circle cx="0" cy="0" r="40" />
      <g strokeDasharray="2 3" opacity="0.6">
        <Box o={[-22, -22, -22]} w={44} h={44} d={44} hidden={false} />
      </g>
    </>
  ),
  // Bar chart standing on a plate: data and BI
  bars: (
    <>
      <Box o={[-34, -30, -24]} w={68} h={4} d={48} />
      <Box o={[-26, -26, -8]} w={14} h={22} d={14} hidden={false} />
      <Box o={[-6, -26, -8]} w={14} h={40} d={14} hidden={false} />
      <Box o={[14, -26, -8]} w={14} h={30} d={14} hidden={false} />
    </>
  ),
  // Cube with a tool head on top
  kit: (
    <>
      <Box o={[-24, -30, -24]} w={48} h={42} d={48} />
      <circle cx={iso([0, 26, 0])[0]} cy={iso([0, 26, 0])[1]} r="10" />
    </>
  ),
  // Logo: a cube with an M folded into its right face
  mark: (
    <>
      <path d="M0 -24 21 -12v24L0 24 -21 12v-24z" />
      <path d="M-21 -12 0 0l21 -12M0 0v24" />
      <path d="M5 18V3l4 6 4-8v15" stroke="var(--color-signal)" strokeWidth="1.6" />
    </>
  ),
};

export default function IsoGlyph({ name, className = "", size = 120 }) {
  return (
    <svg
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
      aria-hidden="true"
    >
      {glyphs[name]}
    </svg>
  );
}
