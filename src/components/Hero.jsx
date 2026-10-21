import { useEffect, useRef, useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, useGsap, scrollToId, MOTION_OK, DESKTOP } from "../lib/motion";
import { Btn, Corners, ResumeMenu, Ruler, Words } from "./ui";
import { BOOT_DELAY } from "../lib/boot";

const { name, titles, socials, avatar } = portfolioData.personalInfo;
const { summary, analystSummary } = portfolioData.about;
const education = portfolioData.about.timeline[0];
const internships = portfolioData.experience;
const latest = internships[internships.length - 1];
const skill = (id) => portfolioData.skills.categories.find((c) => c.id === id).items;

const facts = [
  { k: "Based in", v: socials.location },
  { k: "Studying", v: `${education.title} · CGPA ${education.cgpa} · ${education.year}` },
  { k: "Experience", v: `${internships.length} internships · ${latest.company}` },
  { k: "Works with", v: ["HTML5", "JavaScript", ...skill("data").filter((x) => ["SQL (MySQL)", "Power BI"].includes(x)), "Python"].join(" · ") },
];

// Callouts pinned to the photo (positions are % of the photo box). `open` places the
// callout so it never covers the face.
const markers = [
  { x: 56, y: 18, open: "left-3 top-3", code: "01", title: titles[0], note: titles.slice(1).join(" · ") },
  { x: 50, y: 34, open: "right-3 top-3", code: "02", title: education.title, note: `${education.year} · Crescent Institute` },
  { x: 59, y: 51, open: "left-3 top-3", code: "03", title: `${internships.length}× internships`, note: internships[0].company },
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
        .from("[data-ground]", { scaleX: 0, duration: 1.2 }, 0.2)
        .from("[data-marker]", { scale: 0, duration: 0.6, stagger: 0.12 }, 1.2)
        .from("[data-rise] [data-word]", { yPercent: 110, duration: 1.1, stagger: 0.04 }, 0.5)
        .from("[data-meta]", { opacity: 0, y: 12, duration: 0.8, stagger: 0.08 }, 0.9);
    });

    // Scroll: the drawing drifts up a little slower than the page, like a sheet sliding under glass.
    add(DESKTOP, () => {
      gsap.to("[data-figure-wrap]", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: stage.current, start: "top top", end: "bottom top", scrub: true },
      });
    });
  });

  return (
    <section id="hero" ref={root} className="pt-[var(--nav-h)]">
      {/* Drawing sheet: who I am on the left, the photo on the right */}
      <div
        ref={stage}
        className="relative grid overflow-hidden border-b border-line md:h-[calc(100svh-var(--nav-h)-112px)] md:min-h-[600px] md:grid-cols-12"
      >
        <Corners />
        <Ruler className="absolute inset-x-0 top-2" />
        <Ruler className="absolute inset-x-0 bottom-2 rotate-180" />
        <div aria-hidden="true" className="ruler-v absolute inset-y-6 left-2" />
        <div aria-hidden="true" className="ruler-v absolute inset-y-6 right-2 rotate-180" />
        <div aria-hidden="true" className="dash-x absolute inset-x-6 top-1/2 hidden h-px opacity-70 md:block" />
        <div ref={lineH} aria-hidden="true" className="crosshair pointer-events-none absolute left-0 top-0 z-20 h-px w-full bg-ink/20" />
        <div ref={lineV} aria-hidden="true" className="crosshair pointer-events-none absolute left-0 top-0 z-20 h-full w-px bg-ink/20" />
        {/* Ruler indicators that track the pointer along the top and left scales */}
        <div ref={rulerX} aria-hidden="true" className="crosshair pointer-events-none absolute left-0 top-1 z-20 h-4 w-px bg-ink">
          <span className="label absolute left-1.5 top-0.5 bg-paper px-0.5 text-[9px] text-ink">0000</span>
        </div>
        <div ref={rulerY} aria-hidden="true" className="crosshair pointer-events-none absolute left-1 top-0 z-20 h-px w-4 bg-ink">
          <span className="label absolute left-0 top-1.5 bg-paper px-0.5 text-[9px] text-ink">0000</span>
        </div>

        {/* Who am I */}
        <div className="relative z-10 order-2 flex flex-col justify-center px-5 pb-12 pt-8 md:order-1 md:col-span-6 md:py-12 md:pl-12 md:pr-10 lg:pl-16">
          <p data-meta className="label flex items-center gap-2">
            <span aria-hidden="true" className="h-2 w-2 bg-signal" />
            [00] Who am I
          </p>
          <h1 data-rise className="display mt-4 text-[clamp(40px,5.4vw,84px)] leading-[0.92]">
            <Words text={name} mask />
          </h1>
          <p data-meta className="label mt-4 text-mute">{titles.join(" / ")}</p>
          <div data-meta className="mt-6 max-w-[54ch] space-y-3 text-[15px] leading-snug text-ink-2 md:text-[16px]">
            <p>{summary.split(". ")[0]}.</p>
            <p>{analystSummary.split(". ").slice(0, 2).join(". ")}.</p>
          </div>

          <dl data-meta className="mt-7 max-w-[560px] border-t border-line">
            {facts.map((f) => (
              <div key={f.k} className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-2.5">
                <dt className="label pt-0.5 text-mute">{f.k}</dt>
                <dd className="text-[14px] leading-snug">{f.v}</dd>
              </div>
            ))}
          </dl>

          <div data-meta className="mt-8 flex flex-wrap gap-2">
            <Btn signal onClick={() => scrollToId("work")}>
              View my work
            </Btn>
            <ResumeMenu label="Resumes" up />
          </div>
        </div>

        {/* Photo */}
        <div className="relative order-1 h-[min(78svh,640px)] select-none border-b border-line md:order-2 md:col-span-6 md:h-auto md:border-b-0 md:border-l">
          <div aria-hidden="true" className="dash-y absolute inset-y-6 left-1/2 w-px opacity-70" />
          <div
            aria-hidden="true"
            data-ground
            className="absolute bottom-[8%] left-[8%] right-[8%] h-[1.5px] origin-center bg-ink"
          />

          <div data-figure-wrap className="absolute inset-x-0 bottom-[8%] top-[9%] flex justify-center md:top-[8%]">
            <figure
              ref={figure}
              data-cursor="Click and drag to measure"
              className="relative h-full max-w-[86%] aspect-[869/1086] touch-pan-y"
            >
              <figcaption className="label absolute -top-5 left-0 text-mute">Fig. 01 — {name}</figcaption>

              <div data-print className="absolute inset-0 overflow-hidden border border-ink bg-paper-2 shadow-[10px_10px_0_0_var(--color-line)]">
                <img
                  src={avatar}
                  alt={`Drawing of ${name} on the steps of a building`}
                  width="869"
                  height="1086"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                  draggable="false"
                />
                <div
                  ref={sel}
                  aria-hidden="true"
                  className="pointer-events-none absolute border border-ink bg-ink/[0.07] opacity-0 transition-opacity duration-300"
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

          <p className="label absolute bottom-3 left-6 text-mute md:bottom-5">
            <span className="pointer-coarse:hidden">[ Click and drag to measure · hover a marker ]</span>
            <span className="hidden pointer-coarse:inline">[ Tap a marker ]</span>
          </p>
          <p ref={coords} aria-hidden="true" className="label absolute bottom-5 right-6 hidden text-mute md:block">
            X:0000PX  Y:0000PX
          </p>
        </div>
      </div>

      {/* Title block */}
      <div className="grid border-b border-line md:grid-cols-12">
        <p data-rise className="display px-4 pb-6 pt-5 text-[clamp(30px,4.1vw,60px)] md:col-span-7 md:px-6">
          <Words text={portfolioData.personalInfo.introduction.split(" while ")[0]} mask />
        </p>
        <div data-meta className="border-t border-line px-4 py-5 md:col-span-3 md:border-l md:border-t-0">
          <p className="label text-mute">Latest role</p>
          <p className="mt-2 text-[17px] font-semibold uppercase leading-tight">{latest.role}</p>
          <p className="label mt-1 text-mute">
            {latest.company} · {latest.period}
          </p>
        </div>
        <button
          type="button"
          data-meta
          onClick={() => scrollToId("intro")}
          className="group flex items-end justify-between border-t border-line px-4 py-5 text-left md:col-span-2 md:flex-col md:items-start md:border-l md:border-t-0"
        >
          <span className="label text-mute">{socials.location}</span>
          <span className="label flex items-center gap-2 text-signal">
            Scroll <span className="transition-transform duration-500 ease-out-expo group-hover:translate-y-1">↓</span>
          </span>
        </button>
      </div>

      <Marquee />
    </section>
  );
}

function Marquee() {
  const items = portfolioData.skills.categories.find((c) => c.id === "ai-dev").items;
  const row = (
    <ul className="flex shrink-0 items-center">
      {items.map((t) => (
        <li key={t} className="label flex items-center gap-3 px-4 text-mute">
          <span aria-hidden="true" className="h-2 w-2 rounded-full border border-mute" />
          {t}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="overflow-hidden border-b border-line py-2.5" aria-label="AI-assisted development skills">
      <div className="marquee-track flex w-max">
        {row}
        <div aria-hidden="true" className="flex">
          {row}
        </div>
      </div>
    </div>
  );
}
