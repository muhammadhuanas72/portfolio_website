import { useContent } from "../lib/contentContext";
import { layoutWord, toPath } from "../lib/glyphs";
import { portfolioData } from "../data/portfolioData";

const WORD = "ANAS M.";
const { titles } = portfolioData.personalInfo;

const { glyphs, width } = layoutWord(WORD);
const PAD_X = 6;
const VB = { x: -PAD_X, y: -16, w: width + PAD_X * 2, h: 132 };

// Construction details derived from the letter geometry.
const nodes = glyphs.flatMap((g) => g.polys.flat());
const ticks = glyphs.flatMap((g) =>
  g.polys[0]
    .filter(([, y]) => y === 0 || y === 100)
    .map(([x, y]) => ({ x, y1: y, y2: y === 0 ? -7 : 107 }))
);
const centres = glyphs.filter((g) => g.ch !== ".").map((g) => ({ x: g.x + g.w / 2, y: 50 }));

/** Footer wordmark drawn as construction letterforms, in the drafting-sheet style. */
export default function Wordmark() {
  const { projects } = useContent();
  const web = projects.filter((p) => p.category !== "data").length;
  const data = projects.length - web;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="border-b border-line">
      {/* Editorial strip */}
      <div className="label grid grid-cols-2 border-b border-line text-mute md:grid-cols-4">
        <p className="border-b border-r border-line px-4 py-2.5 md:border-b-0 md:px-6">[06] Sign-off</p>
        <p className="border-b border-line px-4 py-2.5 md:border-b-0 md:border-r">{titles.slice(0, 2).join(" / ")}</p>
        <p className="border-r border-line px-4 py-2.5">
          {pad(web)} Web builds · {pad(data)} Data &amp; analytics
        </p>
        <p className="px-4 py-2.5 text-ink md:text-right md:pr-6">
          <span className="pointer-coarse:hidden">[ Move over the letters ]</span>
          <span className="hidden pointer-coarse:inline">[ Tap a letter ]</span>
        </p>
      </div>

      {/* Letters run slightly past both edges, clipped by the frame */}
      <div className="relative overflow-hidden pb-6 pt-8 md:pb-10 md:pt-12">
        <h2 className="sr-only">{portfolioData.personalInfo.name}</h2>
        <svg
          viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
          className="relative -mx-[1%] block w-[102%] max-w-none"
          aria-hidden="true"
        >
          {/* Guide lines: cap height, middle, baseline */}
          <g stroke="var(--color-line)" strokeDasharray="3 5" vectorEffect="non-scaling-stroke">
            {[0, 50, 100].map((y) => (
              <line key={y} x1={VB.x} y1={y} x2={VB.x + VB.w} y2={y} vectorEffect="non-scaling-stroke" />
            ))}
          </g>

          {/* Letter bounds */}
          <g stroke="var(--color-line)" vectorEffect="non-scaling-stroke">
            {glyphs.map((g) => (
              <g key={`b${g.x}`}>
                <line x1={g.x} y1="-12" x2={g.x} y2="112" vectorEffect="non-scaling-stroke" />
                <line x1={g.x + g.w} y1="-12" x2={g.x + g.w} y2="112" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </g>

          {/* Outlines */}
          <g fill="none" stroke="var(--color-ink)" strokeWidth="1" strokeLinejoin="miter">
            {glyphs.map((g) => (
              <path key={g.x} d={toPath(g.polys)} fillRule="evenodd" vectorEffect="non-scaling-stroke" />
            ))}
          </g>

          {/* Corner ticks, vertex nodes and centre marks */}
          <g stroke="var(--color-ink)" strokeWidth="0.8" vectorEffect="non-scaling-stroke">
            {ticks.map((t, i) => (
              <line key={i} x1={t.x} y1={t.y1} x2={t.x} y2={t.y2} vectorEffect="non-scaling-stroke" />
            ))}
            {centres.map((c) => (
              <g key={c.x}>
                <line x1={c.x - 2.2} y1={c.y} x2={c.x + 2.2} y2={c.y} vectorEffect="non-scaling-stroke" />
                <line x1={c.x} y1={c.y - 2.2} x2={c.x} y2={c.y + 2.2} vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </g>
          <g fill="var(--color-ink)">
            {nodes.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.75" />
            ))}
          </g>
        </svg>

        <div className="label pointer-events-none absolute bottom-2 left-4 right-4 flex justify-between text-mute md:left-6 md:right-6">
          <span>[0,0]</span>
          <span>Cap 100 · Base 0</span>
        </div>
      </div>
    </div>
  );
}
