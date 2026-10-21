import { useEffect, useRef, useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, useGsap, scrollToId, MOTION_OK, DESKTOP } from "../lib/motion";
import { Corners, ResumeMenu, Ruler, Words } from "./ui";
import { BOOT_DELAY } from "../lib/boot";

const { name, titles, socials, avatar } = portfolioData.personalInfo;
const education = portfolioData.about.timeline[0];
const internships = portfolioData.experience;
const latest = internships[0]; // listed newest first
const skill = (id) => portfolioData.skills.categories.find((c) => c.id === id).items;

const facts = [
  { k: "Based in", v: socials.location },
  { k: "Studying", v: `${education.title} · CGPA ${education.cgpa} · ${education.year}` },
  { k: "Experience", v: `${internships.length} internships · ${latest.company}` },
  { k: "Works with", v: ["HTML5", "JavaScript", "React.js", ...skill("data").filter((x) => ["SQL (MySQL)", "Power BI"].includes(x)), "Python"].join(" · ") },
];

// Callouts pinned to the photo (positions are % of the photo box). `open` places the
// callout so it never covers the face.
const markers = [
  { x: 50, y: 18, open: "left-3 top-3", code: "01", title: titles[0], note: titles.slice(1).join(" · ") },
  { x: 50.5, y: 33, open: "right-3 top-3", code: "02", title: education.title, note: `${education.year} · Crescent Institute` },
  { x: 55, y: 50, open: "left-3 top-3", code: "03", title: `${internships.length}× internships`, note: internships[0].company },
];

export default function Hero() {
  const root = useRef(null);
  const stage = useRef(null);
  const coords = useRef(null);
  const figure = useRef(null);
  const sel = useRef(null);
  const lineH = useRef(null);
  const lineV = useRef(null);
  const rulerX = useRef(null);
  const rulerY = useRef(null);
  const [active, setActive] = useState(null);

  // Drafting interaction: crosshair lines, ruler ticks and a coordinate readout follow the mouse
  // across the sheet; dragging over the drawing measures a selection, like a drafting tool.
  useEffect(() => {
    const st = stage.current;
    const fig = figure.current;
    const box = sel.current;
    if (!st || !fig || !box) return;

    const px = (v) => String(Math.max(0, Math.round(v))).padStart(4, "0");
    const clamp = (v, max) => Math.min(Math.max(v, 0), max);
    let start = null;
    let shown = false;

    const hide = () => {
      box.style.opacity = "0";
      shown = false;
    };
    const select = (e) => {
      const f = fig.getBoundingClientRect();
      const x = clamp(e.clientX - f.left, f.width);
      const y = clamp(e.clientY - f.top, f.height);
      const l = Math.min(start.x, x);
      const r = Math.max(start.x, x);
      const t = Math.min(start.y, y);
      const b = Math.max(start.y, y);
      Object.assign(box.style, { left: `${l}px`, top: `${t}px`, width: `${r - l}px`, height: `${b - t}px`, opacity: "1" });
      box.firstChild.textContent = `${Math.round(r - l)} × ${Math.round(b - t)} PX`;
    };

    const move = (e) => {
      const s = st.getBoundingClientRect();
      const x = e.clientX - s.left;
      const y = e.clientY - s.top;
      if (coords.current) coords.current.textContent = `X:${px(x)}PX  Y:${px(y)}PX`;
      if (e.pointerType === "mouse") {
        lineH.current.style.transform = `translate3d(0, ${y}px, 0)`;
        lineV.current.style.transform = `translate3d(${x}px, 0, 0)`;
        rulerX.current.style.transform = `translate3d(${x}px, 0, 0)`;
        rulerY.current.style.transform = `translate3d(0, ${y}px, 0)`;
        rulerX.current.firstChild.textContent = px(x);
        rulerY.current.firstChild.textContent = px(y);
        st.classList.add("crosshair-on");
      }
      if (start) select(e);
    };
    const leave = () => {
      st.classList.remove("crosshair-on");
      if (!start && shown) hide();
    };
    const down = (e) => {
      if (e.button !== 0 || e.pointerType !== "mouse" || e.target.closest("[data-marker]")) return;
      const f = fig.getBoundingClientRect();
      start = { x: e.clientX - f.left, y: e.clientY - f.top };
      fig.setPointerCapture(e.pointerId);
      shown = true;
      select(e);
    };
    const up = () => {
      start = null;
    };

    st.addEventListener("pointermove", move);
    st.addEventListener("pointerleave", leave);
    fig.addEventListener("pointerdown", down);
    fig.addEventListener("pointerup", up);
    fig.addEventListener("pointercancel", up);
    return () => {
      st.removeEventListener("pointermove", move);
      st.removeEventListener("pointerleave", leave);
      fig.removeEventListener("pointerdown", down);
      fig.removeEventListener("pointerup", up);
      fig.removeEventListener("pointercancel", up);
    };
  }, []);

  useGsap(root, (add) => {
    add(MOTION_OK, () => {
      const tl = gsap.timeline({ delay: 0.15 + BOOT_DELAY, defaults: { ease: "expo.out" } });
      tl.from("[data-print]", { clipPath: "inset(100% 0 0 0)", duration: 1.8, ease: "power3.inOut" })
        .from("[data-marker]", { scale: 0, duration: 0.6, stagger: 0.12 }, 1.2)
        .from("[data-rise] [data-word]", { yPercent: 110, duration: 1.1, stagger: 0.04 }, 0.5)
        .from("[data-meta]", { opacity: 0, y: 12, duration: 0.8, stagger: 0.08 }, 0.9);
    });

    // Scroll: the drawing drifts up a little slower than the page, like a sheet sliding under glass.
    add(DESKTOP, () => {
      gsap.to("[data-figure-wrap]", {
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: stage.current, start: "top top", end: "bottom top", scrub: true },
      });
    });
  });

  return (
    <section id="hero" ref={root} className="pt-[var(--nav-h)]">
      {/* Drawing sheet: the drawing centred at the top, who I am centred beneath it */}
      <div ref={stage} className="relative flex flex-col overflow-hidden border-b border-line">
        <Corners />
        <Ruler className="absolute inset-x-0 top-2" />
        <Ruler className="absolute inset-x-0 bottom-2 rotate-180" />
        <div aria-hidden="true" className="ruler-v absolute inset-y-6 left-2" />
        <div aria-hidden="true" className="ruler-v absolute inset-y-6 right-2 rotate-180" />
        <div aria-hidden="true" className="dash-x absolute inset-x-6 top-1/2 hidden h-px opacity-70 md:block" />
        <div ref={lineH} aria-hidden="true" className="crosshair pointer-events-none absolute left-0 top-0 z-20 h-px w-full bg-ink/20" />
        <div ref={lineV} aria-hidden="true" className="crosshair pointer-events-none absolute left-0 top-0 z-20 h-full w-px bg-ink/20" />
        {/* Ruler indicators that track the pointer along the top and left scales */}
        <div ref={rulerX} aria-hidden="true" className="crosshair pointer-events-none absolute left-0 top-1 z-20 h-4 w-px bg-signal">
          <span className="label absolute left-1.5 top-0.5 bg-paper px-0.5 text-[9px] text-ink">0000</span>
        </div>
        <div ref={rulerY} aria-hidden="true" className="crosshair pointer-events-none absolute left-1 top-0 z-20 h-px w-4 bg-signal">
          <span className="label absolute left-0 top-1.5 bg-paper px-0.5 text-[9px] text-ink">0000</span>
        </div>

        {/* Drawing */}
        <div className="relative h-[min(78svh,640px)] select-none overflow-hidden md:h-[calc(100svh-var(--nav-h)-176px)] md:min-h-[460px]">
          <div data-figure-wrap className="absolute inset-0">
            <figure
              ref={figure}
              data-cursor="Click and drag to measure"
              className="absolute left-1/2 top-0 h-full -translate-x-1/2 aspect-[1448/1086] touch-pan-y"
            >
              <div data-print className="absolute inset-0 overflow-hidden">
                <img
                  src={avatar}
                  alt={`Drawing of ${name} on the steps of a building`}
                  width="1448"
                  height="1086"
                  fetchPriority="high"
                  className="hero-fade absolute inset-0 h-full w-full"
                  draggable="false"
                />
                <div
                  ref={sel}
                  aria-hidden="true"
                  className="pointer-events-none absolute border border-signal bg-signal/10 opacity-0 transition-opacity duration-300"
                >
                  <span className="label absolute left-1 top-1 whitespace-nowrap bg-ink px-1.5 py-0.5 text-[9px] text-paper" />
                </div>
              </div>

              {markers.map((m, i) => (
                <div key={m.code} className="absolute" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
                  <button
                    type="button"
                    data-marker
                    aria-expanded={active === i}
                    aria-label={`${m.title} — ${m.note}`}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive(i)}
                    className="relative z-10 -ml-[7px] -mt-[7px] block h-[14px] w-[14px] bg-signal before:absolute before:-inset-3 before:content-['']"
                  />
                  <div
                    role="status"
                    className={`absolute z-20 w-[min(200px,42vw)] bg-signal p-2.5 text-white transition-[opacity,transform] duration-300 ease-out-expo ${m.open} ${active === i ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"}`}
                  >
                    <p className="label opacity-80">[{m.code}]</p>
                    <p className="mt-1 text-[15px] font-semibold uppercase leading-[1.05]">{m.title}</p>
                    <p className="label mt-1.5 opacity-90">{m.note}</p>
                  </div>
                </div>
              ))}
            </figure>
          </div>

          <p className="label absolute left-6 top-5 z-10 text-mute md:left-8 md:top-6">Fig. 01 — {name}</p>
          <p className="label absolute bottom-3 left-6 z-10 text-mute md:bottom-5 md:left-8">
            <span className="pointer-coarse:hidden">[ Click and drag to measure · hover a marker ]</span>
            <span className="hidden pointer-coarse:inline">[ Tap a marker ]</span>
          </p>
          <p ref={coords} aria-hidden="true" className="label absolute bottom-5 right-8 z-10 hidden text-mute md:block">
            X:0000PX  Y:0000PX
          </p>
        </div>

      </div>

      {/* Title bar, as on the reference: name | intro | link, with a ticker under the right half */}
      <div className="grid grid-cols-[minmax(0,1fr)] border-b border-line md:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)_minmax(150px,190px)] md:grid-rows-[1fr_auto]">
        <h1
          data-rise
          className="display px-4 pb-6 pt-6 text-[clamp(38px,4.6vw,68px)] leading-[0.95] md:row-span-2 md:flex md:items-center md:px-8"
        >
          {/* Two deliberate lines: first name, then the rest */}
          <span>
            <span className="block">
              <Words text={name.split(" ")[0]} mask />
            </span>
            <span className="block">
              <Words text={name.split(" ").slice(1).join(" ")} mask />
            </span>
          </span>
        </h1>

        <div data-meta className="border-t border-line px-4 py-4 md:border-l md:border-t-0 md:px-4">
          <p className="label text-mute">{titles.join(" / ")}</p>
          <p className="mt-2 text-[15px] leading-snug text-ink-2 md:text-[16px]">{portfolioData.personalInfo.introduction}</p>
        </div>

        <div data-meta className="flex items-start justify-between gap-4 border-t border-line px-4 py-4 md:flex-col md:border-l md:border-t-0">
          <button
            type="button"
            onClick={() => scrollToId("work")}
            className="group label flex w-full items-center justify-between gap-2 text-signal md:block md:text-left"
          >
            <span>View my work</span>
            <span aria-hidden="true" className="text-[15px] transition-transform duration-500 ease-out-expo group-hover:translate-x-1 md:hidden">→</span>
          </button>
          <ResumeMenu label="Resumes" up align="right" className="md:mt-auto md:self-stretch" />
        </div>

        <div className="min-w-0 overflow-hidden border-t border-line md:col-span-2 md:col-start-2 md:border-l">
          <Marquee items={facts.flatMap((f) => f.v.split(" · "))} label="Profile" />
        </div>
      </div>
    </section>
  );
}

function Marquee({ items, label }) {
  const row = (
    <ul className="flex shrink-0 items-center">
      {items.map((t) => (
        <li key={t} className="label flex items-center gap-3 whitespace-nowrap px-4 text-mute">
          <span aria-hidden="true" className="h-2 w-2 rounded-full border border-mute" />
          {t}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="overflow-hidden py-2.5" aria-label={label}>
      <div className="marquee-track flex w-max">
        {row}
        <div aria-hidden="true" className="flex">
          {row}
        </div>
      </div>
    </div>
  );
}
