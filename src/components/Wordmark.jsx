import { useEffect, useId, useRef } from "react";
import { useContent } from "../lib/contentContext";
import { layoutWord, toPath } from "../lib/glyphs";
import { gsap, prefersReducedMotion } from "../lib/motion";
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

// Diagonal hatch lines covering each letter's box (one extra spacing, so the drift loops seamlessly).
const HATCH = 7;
const hatchFor = (g) => {
  const lines = [];
  for (let x = g.x - 130; x <= g.x + g.w + HATCH; x += HATCH) lines.push(x);
  return lines;
};
// Radius that floods the whole letter from any point inside its box.
const floodRadius = (g) => Math.hypot(g.w, 112) + 8;

// Ink fill on hover: hatching slides in, then a wet ink blot spreads from where the cursor
// entered, its ragged edge settling as it grows; a soft highlight follows the cursor. Leaving
// drains the ink back toward the exit point. Taps toggle a letter on touch screens.
function useInk(svgRef, uid) {
  useEffect(() => {
    const svg = svgRef.current;
    const reduced = prefersReducedMotion();
    const t = (d) => (reduced ? 0 : d);
    const q = (sel) => svg.querySelector(sel);
    const toSvg = (e) => {
      const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      return { x: pt.x, y: pt.y };
    };
    const state = glyphs.map(() => ({ on: false, drift: null }));

    const fill = (i, at) => {
      const s = state[i];
      if (s.on) return;
      s.on = true;
      const blot = q(`[data-blot="${i}"]`);
      const disp = q(`#${uid}-disp${i}`);
      gsap.killTweensOf([blot, disp]);
      if (Number(blot.getAttribute("r")) < 1) gsap.set(blot, { attr: { cx: at.x, cy: at.y } });
      gsap.to(q(`[data-outline="${i}"]`), { stroke: "#6b1d2e", duration: t(0.25), overwrite: "auto" });
      gsap.to(q(`[data-hatch="${i}"]`), { opacity: 1, duration: t(0.25), overwrite: "auto" });
      gsap.fromTo(disp, { attr: { scale: 26 } }, { attr: { scale: 7 }, duration: t(1.1), ease: "power2.out" });
      gsap.to(blot, { attr: { r: floodRadius(glyphs[i]) }, duration: t(0.95), delay: t(0.08), ease: "power3.out" });
      if (!reduced) {
        s.drift ??= gsap.fromTo(
          q(`[data-hatch-lines="${i}"]`),
          { x: 0 },
          { x: HATCH, duration: 0.9, ease: "none", repeat: -1, paused: true }
        );
        s.drift.play();
      }
    };
    const drain = (i, at) => {
      const s = state[i];
      if (!s.on) return;
      s.on = false;
      const blot = q(`[data-blot="${i}"]`);
      const disp = q(`#${uid}-disp${i}`);
      gsap.killTweensOf([blot, disp]);
      gsap.to(disp, { attr: { scale: 20 }, duration: t(0.5), ease: "power1.in" });
      gsap.to(blot, { attr: { r: 0, cx: at.x, cy: at.y }, duration: t(0.6), ease: "power2.in" });
      gsap.to(q(`[data-hatch="${i}"]`), {
        opacity: 0,
        duration: t(0.45),
        delay: t(0.15),
        overwrite: "auto",
        onComplete: () => !s.on && s.drift?.pause(),
      });
      gsap.to(q(`[data-outline="${i}"]`), { stroke: "#282828", duration: t(0.4), delay: t(0.2), overwrite: "auto" });
      gsap.to(q(`[data-shine="${i}"]`), { opacity: 0, duration: t(0.3), overwrite: "auto" });
    };
    const shine = (i, at) =>
      gsap.to(q(`[data-shine="${i}"]`), { attr: { cx: at.x, cy: at.y }, opacity: 1, duration: t(0.35), ease: "power2.out", overwrite: "auto" });

    const index = (e) => {
      const i = e.target?.getAttribute?.("data-outline");
      return i == null ? -1 : Number(i);
    };
    const over = (e) => {
      if (e.pointerType === "touch") return;
      const i = index(e);
      if (i >= 0) fill(i, toSvg(e));
    };
    const out = (e) => {
      if (e.pointerType === "touch") return;
      const i = index(e);
      if (i >= 0) drain(i, toSvg(e));
    };
    const move = (e) => {
      if (e.pointerType === "touch") return;
      const i = index(e);
      if (i >= 0 && state[i].on) shine(i, toSvg(e));
    };
    const tap = (e) => {
      if (e.pointerType !== "touch") return;
      const i = index(e);
      if (i < 0) return;
      const at = toSvg(e);
      if (state[i].on) drain(i, at);
      else fill(i, at);
    };

    svg.addEventListener("pointerover", over);
    svg.addEventListener("pointerout", out);
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerdown", tap);
    return () => {
      svg.removeEventListener("pointerover", over);
      svg.removeEventListener("pointerout", out);
      svg.removeEventListener("pointermove", move);
      svg.removeEventListener("pointerdown", tap);
      state.forEach((s) => s.drift?.kill());
      gsap.killTweensOf(svg.querySelectorAll("*"));
    };
  }, [svgRef, uid]);
}

/** Footer wordmark drawn as construction letterforms, in the drafting-sheet style. */
export default function Wordmark() {
  const { projects } = useContent();
  const web = projects.filter((p) => p.category !== "data").length;
  const data = projects.length - web;
  const pad = (n) => String(n).padStart(2, "0");
  const svgRef = useRef(null);
  const uid = `wm${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  useInk(svgRef, uid);

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
          ref={svgRef}
          viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
          className="relative -mx-[1%] block w-[102%] max-w-none"
          aria-hidden="true"
        >
          <defs>
            {glyphs.map((g, i) => (
              <clipPath key={g.x} id={`${uid}-clip${i}`}>
                <path d={toPath(g.polys)} clipRule="evenodd" />
              </clipPath>
            ))}
            {/* Ragged, wet edge for the ink: noise displaces the blot's outline */}
            {glyphs.map((g, i) => (
              <filter key={g.x} id={`${uid}-ink${i}`} x="-40%" y="-40%" width="180%" height="180%">
                <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed={i + 3} result="noise" />
                <feDisplacementMap
                  id={`${uid}-disp${i}`}
                  in="SourceGraphic"
                  in2="noise"
                  scale="7"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            ))}
            <radialGradient id={`${uid}-shine`}>
              <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
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

          {/* Ink fills, hidden until a letter is hovered */}
          {glyphs.map((g, i) => (
            <g key={g.x} clipPath={`url(#${uid}-clip${i})`} pointerEvents="none">
              <g data-hatch={i} opacity="0" stroke="var(--color-signal)" strokeWidth="1.1">
                <g data-hatch-lines={i}>
                  {hatchFor(g).map((x) => (
                    <line key={x} x1={x} y1="116" x2={x + 128} y2="-12" vectorEffect="non-scaling-stroke" />
                  ))}
                </g>
              </g>
              <circle data-blot={i} cx={g.x + g.w / 2} cy="50" r="0" fill="var(--color-signal)" filter={`url(#${uid}-ink${i})`} />
              <circle data-shine={i} cx={g.x + g.w / 2} cy="50" r="34" fill={`url(#${uid}-shine)`} opacity="0" />
            </g>
          ))}

          {/* Outlines; their transparent fill is what the cursor hovers */}
          <g fill="transparent" stroke="var(--color-ink)" strokeWidth="1" strokeLinejoin="miter">
            {glyphs.map((g, i) => (
              <path
                key={g.x}
                data-outline={i}
                d={toPath(g.polys)}
                fillRule="evenodd"
                pointerEvents="fill"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          {/* Corner ticks, vertex nodes and centre marks */}
          <g stroke="var(--color-ink)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" pointerEvents="none">
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
          <g fill="var(--color-ink)" pointerEvents="none">
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
