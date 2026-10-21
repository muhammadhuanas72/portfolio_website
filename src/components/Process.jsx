import { useRef } from "react";
import { portfolioData } from "../data/portfolioData";
import { useContent } from "../lib/contentContext";
import { gsap, useGsap, scrollToId, DESKTOP, MOBILE } from "../lib/motion";
import { Corners } from "./ui";

const { passions } = portfolioData.about;

const captionsFor = (count) => [
  { title: passions[0].title, text: passions[0].description, hint: "Scroll to continue" },
  { title: passions[1].title, text: passions[1].description, hint: "Scroll to continue" },
  { title: passions[2].title, text: passions[2].description, hint: "Scroll to continue" },
  { title: "Selected work", text: `${count} builds, each shipped and live.`, hint: "Tap or click a marker" },
];

// Wireframe of a web page, drawn in a 800×560 sheet. Every fragment starts scattered and
// slides into place; "wall" strokes then thicken like a floor plan being inked.
const VB = { x: -70, y: -70, w: 940, h: 700 };
const CARDS = [30, 285, 540].map((x) => ({ x, y: 360, w: 230, h: 150 }));

const fragments = [
  <rect key="frame" data-wall strokeWidth="8" x="0" y="0" width="800" height="560" />,
  <g key="chrome">
    <line data-wall strokeWidth="8" x1="0" y1="36" x2="800" y2="36" />
    {[18, 34, 50].map((cx) => <circle key={cx} cx={cx} cy="18" r="4" />)}
    <rect x="220" y="11" width="360" height="15" rx="7" />
  </g>,
  <g key="nav">
    <line x1="0" y1="80" x2="800" y2="80" />
    <rect data-solid fill="var(--color-ink)" x="30" y="52" width="70" height="12" />
    {[520, 580, 640, 700].map((x) => <rect key={x} x={x} y="54" width="44" height="8" />)}
  </g>,
  <g key="headline">
    <rect data-solid fill="var(--color-ink)" x="30" y="118" width="380" height="26" />
    <rect data-solid fill="var(--color-ink)" x="30" y="152" width="300" height="26" />
  </g>,
  <g key="copy">
    <rect x="30" y="200" width="260" height="6" />
    <rect x="30" y="214" width="220" height="6" />
    <rect data-solid fill="var(--color-ink)" x="30" y="244" width="110" height="30" />
  </g>,
  <g key="media">
    <rect data-wall strokeWidth="8" x="460" y="110" width="310" height="190" />
    <line x1="460" y1="110" x2="770" y2="300" />
    <line x1="770" y1="110" x2="460" y2="300" />
  </g>,
  <line key="divider" data-wall strokeWidth="8" x1="0" y1="330" x2="800" y2="330" />,
  ...CARDS.map((c) => (
    <g key={c.x}>
      <rect data-wall strokeWidth="8" x={c.x} y={c.y} width={c.w} height={c.h} />
      <line x1={c.x} y1={c.y + 96} x2={c.x + c.w} y2={c.y + 96} />
      <rect x={c.x + 14} y={c.y + 110} width={c.w * 0.6} height="10" />
      <rect x={c.x + 14} y={c.y + 128} width={c.w * 0.35} height="6" />
    </g>
  )),
  <line key="footer" data-wall strokeWidth="8" x1="0" y1="530" x2="800" y2="530" />,
];

function Dimensions() {
  const tick = (x, y, v) => (v ? <line x1={x} y1={y - 6} x2={x} y2={y + 6} /> : <line x1={x - 6} y1={y} x2={x + 6} y2={y} />);
  return (
    <g data-dim stroke="var(--color-mute)" fill="var(--color-mute)" fontFamily="var(--font-mono)" fontSize="13">
      <line x1="0" y1="-30" x2="800" y2="-30" />
      {tick(0, -30, true)}
      {tick(800, -30, true)}
      <text x="400" y="-38" textAnchor="middle" stroke="none">1440</text>
      <line x1="-30" y1="0" x2="-30" y2="560" />
      {tick(-30, 0, false)}
      {tick(-30, 560, false)}
      <text x="-38" y="280" textAnchor="middle" stroke="none" transform="rotate(-90 -38 280)">900</text>
      {CARDS.map((c) => (
        <g key={c.x}>
          <line x1={c.x} y1="590" x2={c.x + c.w} y2="590" />
          {tick(c.x, 590, true)}
          {tick(c.x + c.w, 590, true)}
          <text x={c.x + c.w / 2} y="610" textAnchor="middle" stroke="none">4 COL</text>
        </g>
      ))}
      <g strokeDasharray="3 5">
        {[30, 770].map((x) => (
          <line key={x} x1={x} y1="-60" x2={x} y2="620" />
        ))}
      </g>
    </g>
  );
}

// Deterministic scatter so the assembly looks the same on every visit.
const scatter = (i) => {
  const r = (n) => Math.sin(i * 12.9898 + n * 78.233) * 0.5;
  return { x: r(1) * 520, y: r(2) * 360, rotation: r(3) * 40 };
};

export default function Process() {
  const root = useRef(null);
  const pin = useRef(null);
  // The wireframe's cards flag the first three web builds still on the site; the gallery
  // lists web builds in the same order, so marker i opens gallery panel i.
  const { projects } = useContent();
  const web = projects.filter((p) => p.category !== "data");
  const flagged = web.slice(0, 3);
  const captions = captionsFor(web.length);

  useGsap(root, (add) => {
    const build = (length) => () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: pin.current, start: "top top", end: `+=${length}%`, pin: true, scrub: 0.8 },
      });

      const frags = gsap.utils.toArray("[data-frag]");
      tl.addLabel("titles")
        .fromTo("[data-title='0']", { opacity: 1 }, { opacity: 0, duration: 0.6 }, 0.5)
        .fromTo("[data-title='1']", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.8)
        .to("[data-title='1']", { opacity: 0, duration: 0.5 }, 1.6)
        // 1. Fragments drift in from the scatter and lock into the grid
        .fromTo(
          frags,
          { x: (i) => scatter(i).x, y: (i) => scatter(i).y, rotation: (i) => scatter(i).rotation, opacity: 0, transformOrigin: "50% 50%" },
          { x: 0, y: 0, rotation: 0, opacity: 1, duration: 2, stagger: 0.05 },
          0.9
        )
        .fromTo("[data-caption]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, 1.2)
        .fromTo("[data-cap='0']", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.2)
        // 2. Walls ink in and solid blocks fill
        .addLabel("ink", 3.4)
        .fromTo("[data-wall]", { attr: { "stroke-width": 1.2 } }, { attr: { "stroke-width": 8 }, duration: 1 }, "ink")
        .fromTo("[data-solid]", { fillOpacity: 0 }, { fillOpacity: 1, duration: 1, stagger: 0.08 }, "ink")
        .to("[data-cap='0']", { opacity: 0, duration: 0.3 }, "ink")
        .fromTo("[data-cap='1']", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "ink+=0.3")
        // 3. Dimensions are drafted around the sheet
        .addLabel("dims", 5)
        .fromTo("[data-dim]", { opacity: 0 }, { opacity: 1, duration: 0.8 }, "dims")
        .to("[data-cap='1']", { opacity: 0, duration: 0.3 }, "dims")
        .fromTo("[data-cap='2']", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "dims+=0.3")
        // 4. Markers flag the three projects
        .addLabel("marks", 6.4)
        .fromTo("[data-pin]", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.2, ease: "back.out(2)" }, "marks")
        .to("[data-cap='2']", { opacity: 0, duration: 0.3 }, "marks")
        .fromTo("[data-cap='3']", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "marks+=0.3")
        .to({}, { duration: 0.8 });
    };

    add(DESKTOP, build(380));
    add(MOBILE, build(180)); // a shorter scroll on phones
  });

  return (
    <section id="process" ref={root} className="border-b border-line">
      <div ref={pin} className="relative flex h-[calc(100svh-var(--nav-h))] min-h-[520px] items-center justify-center overflow-hidden bg-paper">
        <Corners />

        {/* Sheet titles */}
        <h2 className="sr-only">From a blank page to a working product</h2>
        <p data-title="0" aria-hidden="true" className="display pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-[clamp(30px,4vw,60px)] opacity-0">
          From a blank page
        </p>
        <p data-title="1" aria-hidden="true" className="display pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-[clamp(30px,4vw,60px)] opacity-0">
          To a working product
        </p>

        {/* Drawing */}
        <div className="relative w-[min(92vw,calc((100svh-var(--nav-h)-120px)*940/700))] aspect-[940/700] md:-translate-y-4">
          <svg
            viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
            className="absolute inset-0 h-full w-full"
            fill="var(--color-ink)"
            stroke="var(--color-ink)"
            strokeWidth="1.2"
            aria-hidden="true"
          >
            <Dimensions />
            <g fill="none" stroke="var(--color-ink)" strokeWidth="1.2" strokeLinejoin="miter">
              {fragments.map((f, i) => (
                <g key={i} data-frag>
                  {f}
                </g>
              ))}
            </g>
          </svg>

          {/* Project markers, positioned in sheet coordinates */}
          {CARDS.slice(0, flagged.length).map((c, i) => (
            <button
              key={c.x}
              type="button"
              data-pin
              onClick={() => {
                window.dispatchEvent(new CustomEvent("work:open", { detail: i }));
                scrollToId("work-gallery");
              }}
              className="group absolute flex -translate-y-1/2 items-center gap-2 before:absolute before:-inset-2 before:content-['']"
              style={{
                left: `${((c.x + 14 - VB.x) / VB.w) * 100}%`,
                top: `${((c.y + 40 - VB.y) / VB.h) * 100}%`,
              }}
              aria-label={`View project ${i + 1}: ${flagged[i].title}`}
            >
              <span className="label flex h-6 w-6 items-center justify-center bg-signal text-white">0{i + 1}</span>
              <span className="label hidden whitespace-nowrap bg-paper px-1.5 py-0.5 text-ink shadow-[0_0_0_1px_var(--color-line)] transition-colors group-hover:bg-signal group-hover:text-white md:inline">
                {flagged[i].title}
              </span>
            </button>
          ))}
        </div>

        {/* Caption box */}
        <div data-caption className="caption absolute bottom-6 left-4 w-[min(300px,calc(100%-32px))] md:left-6">
          <p className="label bg-ink px-2.5 py-1.5 text-paper">Process</p>
          <div className="relative min-h-[118px]">
            {captions.map((c, i) => (
              <div key={c.title} data-cap={i} className={`absolute inset-0 p-2.5 ${i === 3 ? "" : "opacity-0"}`}>
                <p className="text-[13px] font-semibold leading-snug">{c.title}</p>
                <p className="mt-1 text-[13px] leading-snug text-ink-2">{c.text}</p>
                <p className="label mt-3 text-mute">[{c.hint}]</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
