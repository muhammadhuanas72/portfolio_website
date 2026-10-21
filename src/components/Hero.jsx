import { useEffect, useRef, useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, useGsap, scrollToId, MOTION_OK, DESKTOP } from "../lib/motion";
import { Corners, Ruler, Words } from "./ui";
import { BOOT_DELAY } from "../lib/boot";

const { name, titles, socials, avatar } = portfolioData.personalInfo;
const education = portfolioData.about.timeline[0];
const internships = portfolioData.experience;

// Callouts pinned to the portrait (positions are % of the portrait box).
const markers = [
  { x: 62, y: 4, code: "01", title: titles[0], note: titles.slice(1).join(" · ") },
  { x: 41, y: 25, code: "02", title: education.title, note: `${education.year} · Crescent Institute` },
  { x: 80, y: 47, code: "03", title: `${internships.length}× internships`, note: internships[0].company },
];

const LENS = 96;

export default function Hero() {
  const root = useRef(null);
  const stage = useRef(null);
  const figure = useRef(null);
  const photo = useRef(null);
  const coords = useRef(null);
  const [active, setActive] = useState(null);
  const [touch, setTouch] = useState(false);

  // Cursor lens: pointer sets a target, a rAF loop eases toward it and writes CSS vars.
  useEffect(() => {
    const el = stage.current;
    const fig = figure.current;
    const img = photo.current;
    if (!el || !fig || !img) return;

    setTouch(window.matchMedia("(pointer: coarse)").matches);
    const target = { x: 0, y: 0, r: 0 };
    const cur = { x: 0, y: 0, r: 0 };
    let raf = 0;
    let running = false;
    let hideTimer;

    const loop = () => {
      cur.x += (target.x - cur.x) * 0.18;
      cur.y += (target.y - cur.y) * 0.18;
      cur.r += (target.r - cur.r) * 0.14;
      img.style.setProperty("--lx", `${cur.x.toFixed(1)}px`);
      img.style.setProperty("--ly", `${cur.y.toFixed(1)}px`);
      img.style.setProperty("--lr", `${Math.max(cur.r, 0).toFixed(1)}px`);
      const settled =
        Math.abs(target.x - cur.x) < 0.2 && Math.abs(target.y - cur.y) < 0.2 && Math.abs(target.r - cur.r) < 0.2;
      if (settled) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    const move = (e) => {
      const f = fig.getBoundingClientRect();
      const s = el.getBoundingClientRect();
      target.x = e.clientX - f.left;
      target.y = e.clientY - f.top;
      if (cur.r < 1) {
        cur.x = target.x;
        cur.y = target.y;
      }
      target.r = LENS;
      if (coords.current) {
        const px = (v) => String(Math.round(v)).padStart(4, "0");
        coords.current.textContent = `X:${px(e.clientX - s.left)}PX  Y:${px(e.clientY - s.top)}PX`;
      }
      clearTimeout(hideTimer);
      kick();
    };
    const leave = () => {
      target.r = 0;
      kick();
    };
    const up = (e) => {
      if (e.pointerType === "touch") hideTimer = setTimeout(leave, 900);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", leave);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", leave);
    };
  }, []);

  useGsap(root, (add) => {
    add(MOTION_OK, () => {
      const tl = gsap.timeline({ delay: 0.15 + BOOT_DELAY, defaults: { ease: "expo.out" } });
      tl.from("[data-print]", { clipPath: "inset(100% 0 0 0)", duration: 1.8, ease: "power3.inOut" })
        .from("[data-ground]", { scaleX: 0, duration: 1.2 }, 0.2)
        .from("[data-marker]", { scale: 0, duration: 0.6, stagger: 0.12 }, 1.2)
        .from("h1 [data-word]", { yPercent: 110, duration: 1.1, stagger: 0.04 }, 0.5)
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
      {/* Drawing sheet */}
      <div
        ref={stage}
        className="relative h-[calc(100svh-var(--nav-h)-112px)] min-h-[460px] touch-pan-y overflow-hidden border-b border-line select-none md:min-h-[560px]"
      >
        <Corners />
        <Ruler className="absolute inset-x-0 top-2" />
        <Ruler className="absolute inset-x-0 bottom-2 rotate-180" />
        <div aria-hidden="true" className="ruler-v absolute inset-y-6 left-2" />
        <div aria-hidden="true" className="ruler-v absolute inset-y-6 right-2 rotate-180" />

        {/* Construction lines */}
        <div aria-hidden="true" className="dash-x absolute inset-x-6 top-1/2 h-px opacity-70" />
        <div aria-hidden="true" className="dash-y absolute inset-y-6 left-1/2 w-px opacity-70" />
        <div
          aria-hidden="true"
          data-ground
          className="absolute bottom-[9%] left-[12%] right-[12%] h-[1.5px] origin-center bg-ink"
        />

        <div data-figure-wrap className="absolute inset-x-0 bottom-[9%] top-[7%] flex justify-center">
          <div ref={figure} className="relative h-full aspect-[510/1400]">
            {/* Scale bar beside the figure */}
            <div aria-hidden="true" className="absolute -left-14 bottom-0 top-0 hidden w-6 md:block">
              <div className="absolute inset-y-0 left-1/2 w-px bg-mute" />
              <div className="absolute left-0 right-0 top-0 h-px bg-mute" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-mute" />
              <span className="label absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap bg-paper px-1 text-mute">
                [ 1 : 1 ]
              </span>
            </div>

            <img
              data-print
              src="/media/portrait-ink.png"
              alt={`Ink drawing of ${name}`}
              className="absolute inset-0 h-full w-full object-contain"
              draggable="false"
            />
            <img
              ref={photo}
              src={avatar}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-contain"
              draggable="false"
              style={{
                "--lx": "0px",
                "--ly": "0px",
                "--lr": "0px",
                maskImage: "radial-gradient(circle var(--lr) at var(--lx) var(--ly), #000 96%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(circle var(--lr) at var(--lx) var(--ly), #000 96%, transparent 100%)",
              }}
            />

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
                  onClick={() => setActive((v) => (v === i ? null : i))}
                  className="relative z-10 -ml-[7px] -mt-[7px] block h-[14px] w-[14px] bg-signal before:absolute before:-inset-3 before:content-['']"
                />
                <div
                  role="status"
                  className={`absolute top-3 z-20 w-[200px] bg-signal p-2.5 text-white transition-[opacity,transform] duration-300 ease-out-expo ${
                    m.x > 60 ? "right-3" : "left-3"
                  } ${active === i ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"}`}
                >
                  <p className="label opacity-80">[{m.code}]</p>
                  <p className="mt-1 text-[15px] font-semibold uppercase leading-[1.05]">{m.title}</p>
                  <p className="label mt-1.5 opacity-90">{m.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="label absolute bottom-5 left-6 text-mute md:left-8">
          [ {touch ? "Touch and drag" : "Move your cursor"} to see the real photo ]
        </p>
        <p ref={coords} aria-hidden="true" className="label absolute bottom-5 right-6 hidden text-mute md:right-8 md:block">
          X:0000PX  Y:0000PX
        </p>
      </div>

      {/* Title block */}
      <div className="grid border-b border-line md:grid-cols-12">
        <h1 className="display px-4 pb-6 pt-5 text-[clamp(30px,4.1vw,60px)] md:col-span-7 md:px-6">
          <span className="sr-only">{name}. </span>
          <Words text={portfolioData.personalInfo.introduction.split(" while ")[0]} mask />
        </h1>
        <div data-meta className="border-t border-line px-4 py-5 md:col-span-3 md:border-l md:border-t-0">
          <p className="text-[17px] font-semibold uppercase leading-tight">{name}</p>
          <ul className="label mt-2 space-y-0.5 text-mute">
            {titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
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
