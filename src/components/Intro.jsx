import { useRef } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, useGsap, MOTION_OK, DESKTOP } from "../lib/motion";
import { iso, pts } from "../lib/iso";
import { Corners, ResumeMenu, Words } from "./ui";

const { summary } = portfolioData.about;
const frontend = portfolioData.skills.categories.find((c) => c.id === "frontend").items;
const tools = portfolioData.skills.categories.find((c) => c.id === "tools").items;

// The four layers of a web page, labelled with real frontend skills.
const LAYERS = [
  { label: frontend[0], detail: "Structure" },
  { label: frontend[1], detail: "Style" },
  { label: frontend[2], detail: "Behaviour" },
  { label: frontend[5], detail: "Every screen" },
];

const W = 150;
const D = 110;
const plate = (y) => [[-W / 2, y, -D / 2], [W / 2, y, -D / 2], [W / 2, y, D / 2], [-W / 2, y, D / 2]];
const rect = (y, x0, z0, x1, z1) => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];

function Layer({ index }) {
  // Contents are drawn on the plate's own plane, so each layer can move as a group.
  return (
    <g data-layer={index}>
      <polygon points={pts(plate(0))} fill="var(--color-paper)" />
      {index === 0 && (
        <g strokeDasharray="2 3" opacity="0.7">
          {[-45, -15, 15, 45].map((x) => (
            <line key={x} x1={iso([x, 0, -D / 2])[0]} y1={iso([x, 0, -D / 2])[1]} x2={iso([x, 0, D / 2])[0]} y2={iso([x, 0, D / 2])[1]} />
          ))}
        </g>
      )}
      {index === 1 && (
        <>
          <polygon points={pts(rect(0, -60, -40, 60, -10))} fill="var(--color-paper-2)" />
          <polygon points={pts(rect(0, -60, 0, -5, 40))} />
          <polygon points={pts(rect(0, 5, 0, 60, 40))} />
        </>
      )}
      {index === 2 && (
        <>
          <polygon points={pts(rect(0, -60, -40, 10, -30))} fill="var(--color-ink)" />
          <polygon points={pts(rect(0, -60, -22, -10, -16))} fill="var(--color-ink)" />
          <polygon points={pts(rect(0, 30, 20, 60, 34))} fill="var(--color-signal)" stroke="none" />
        </>
      )}
      {index === 3 && (
        <>
          <polyline points={pts([[-W / 2, 0, -D / 2 + 12], [W / 2, 0, -D / 2 + 12]])} />
          {[0, 1, 2].map((i) => {
            const [cx, cy] = iso([-W / 2 + 8 + i * 7, 0, -D / 2 + 6]);
            return <ellipse key={i} cx={cx} cy={cy} rx="2.4" ry="1.4" />;
          })}
        </>
      )}
    </g>
  );
}

function Exploded() {
  const corners = plate(0).map((p) => iso(p));
  return (
    <svg viewBox="-140 -170 310 330" className="h-full w-full" fill="none" stroke="var(--color-ink)" strokeWidth="1" aria-hidden="true">
      {/* Guides joining the plate corners; they stretch as the layers separate */}
      <g data-guides strokeDasharray="2 3" stroke="var(--color-mute)">
        {corners.map(([x, y], i) => (
          <line key={i} x1={x} y1={y + 54} x2={x} y2={y - 54} />
        ))}
      </g>
      {LAYERS.map((_, i) => (
        <g key={i} data-plate={i} transform={`translate(0 ${54 - i * 36})`}>
          <Layer index={i} />
          <g data-tag-label fontFamily="var(--font-mono)" fontSize="7.5" stroke="none">
            <line x1={iso([W / 2, 0, -D / 2])[0]} y1={iso([W / 2, 0, -D / 2])[1]} x2="110" y2={iso([W / 2, 0, -D / 2])[1]} stroke="var(--color-mute)" />
            <text x="112" y={iso([W / 2, 0, -D / 2])[1] - 2} fill="var(--color-ink)">
              <tspan fill="var(--color-mute)">[{String.fromCharCode(65 + i)}]</tspan> {LAYERS[i].label.toUpperCase()}
            </text>
            <text x="112" y={iso([W / 2, 0, -D / 2])[1] + 8} fill="var(--color-mute)">
              {LAYERS[i].detail.toUpperCase()}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}

export default function Intro() {
  const root = useRef(null);

  useGsap(root, (add) => {
    add(MOTION_OK, () => {
      // Words fill from pencil grey to ink as the paragraph crosses the viewport.
      gsap.fromTo(
        "[data-fill] [data-word]",
        { color: "var(--color-faint)" },
        {
          color: "var(--color-ink)",
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: "[data-fill]", start: "top 80%", end: "bottom 45%", scrub: true },
        }
      );
    });

    add(DESKTOP, () => {
      // Layers pull apart as the section scrolls through: an exploded view of a page.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom 30%", scrub: 0.6 },
      });
      LAYERS.forEach((_, i) => {
        tl.to(`[data-plate="${i}"]`, { y: (i - 1.5) * -26, ease: "none" }, 0);
      });
      tl.fromTo("[data-guides]", { opacity: 0 }, { opacity: 1, ease: "none" }, 0)
        .to("[data-sun]", { yPercent: -35, xPercent: 8, ease: "none" }, 0)
        .from("[data-tag-label]", { opacity: 0, x: -10, stagger: 0.1, ease: "none" }, 0.2);
    });
  });

  return (
    <section id="intro" ref={root} className="border-b border-line">
      <div className="grid md:grid-cols-2">
        {/* Drawing */}
        <div className="relative aspect-square overflow-hidden border-b border-line md:aspect-auto md:min-h-[640px] md:border-b-0 md:border-r">
          <Corners />
          <div
            data-sun
            aria-hidden="true"
            className="absolute right-[14%] top-[10%] h-[34%] w-auto aspect-square rounded-full bg-signal"
          />
          <div className="absolute inset-[8%]">
            <Exploded />
          </div>
        </div>

        {/* Statement */}
        <div className="flex flex-col justify-between gap-10 px-4 py-10 md:px-[8%] md:py-16">
          <p data-fill className="display text-[clamp(26px,2.9vw,44px)]">
            <Words text={summary.split(". ")[0] + "."} />
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <ResumeMenu label="Download resume" />
            <p className="max-w-[38ch] text-[14px] leading-snug text-ink-2">
              {summary.split(". ").slice(1).join(". ")}
            </p>
          </div>
        </div>
      </div>

      {/* Tool strip, like a client-logo bar */}
      <div className="grid border-t border-line md:grid-cols-[180px_1fr]">
        <p className="label flex items-center border-b border-line px-4 py-3 md:border-b-0 md:border-r md:px-6">Daily tools</p>
        <ul className="flex flex-wrap">
          {tools.map((t) => (
            <li
              key={t}
              className="flex h-16 grow basis-1/2 items-center justify-center border-b border-r border-line px-2 sm:basis-1/3 lg:basis-0 text-center text-[14px] font-semibold uppercase leading-tight tracking-[-0.03em] text-ink-2 md:h-20 lg:border-b-0 lg:last:border-r-0"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
