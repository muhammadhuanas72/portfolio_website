import { MODULES, CORE_RADIUS, REST_POSE, boxEdges, project } from "./draftGeometry";

// Technical line drawing of the hero object. Rear edges are drawn as hidden lines,
// like an architectural sketch. Used as the opening layer and the no-WebGL fallback.
export default function DraftSketch({ pose = REST_POSE, className = "" }) {
  const edges = MODULES.flatMap((m) =>
    boxEdges(m).map(([a, b]) => {
      const p = project(a, pose);
      const q = project(b, pose);
      return { p, q, hidden: (p.depth + q.depth) / 2 < -0.35 };
    })
  );

  // Leader lines from each module's front-right corner to an index label.
  const leaders = MODULES.map((m) => {
    const anchor = project([m.max[0], (m.min[1] + m.max[1]) / 2, m.max[2]], pose);
    return { anchor, label: `[0${m.index + 1}]` };
  });

  const coreCenter = project([0, 0, 0], pose);

  return (
    <svg
      viewBox="-2.6 -2.6 5.2 5.2"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Construction lines */}
      <g stroke="var(--color-line)" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <line x1="-2.6" y1="0" x2="2.6" y2="0" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="-2.6" x2="0" y2="2.6" vectorEffect="non-scaling-stroke" />
        <circle cx="0" cy="0" r="2.1" vectorEffect="non-scaling-stroke" strokeDasharray="2 6" />
      </g>

      {/* Core */}
      <circle
        cx={coreCenter.x}
        cy={coreCenter.y}
        r={CORE_RADIUS * 1.05}
        stroke="var(--color-mute)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />

      {/* Module frames */}
      {edges.map(({ p, q, hidden }, i) => (
        <line
          key={i}
          x1={p.x}
          y1={p.y}
          x2={q.x}
          y2={q.y}
          stroke={hidden ? "var(--color-dim)" : "var(--color-paper)"}
          strokeWidth={hidden ? 1 : 1.4}
          strokeDasharray={hidden ? "3 4" : undefined}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Index callouts */}
      <g fill="var(--color-mute)" fontFamily="var(--font-mono)" fontSize="0.13">
        {leaders.map(({ anchor, label }) => (
          <g key={label}>
            <circle cx={anchor.x} cy={anchor.y} r="0.03" fill="var(--color-paper)" />
            <polyline
              points={`${anchor.x},${anchor.y} ${anchor.x + 0.35},${anchor.y - 0.2} 2.25,${anchor.y - 0.2}`}
              fill="none"
              stroke="var(--color-mute)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <text x="2.25" y={anchor.y - 0.26} textAnchor="end" stroke="none">
              {label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
