import { useLayoutEffect, useRef, useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, prefersReducedMotion } from "../lib/motion";
import { seen } from "../lib/boot";

const { personalInfo, projects, skills, experience } = portfolioData;

const lines = [
  "Initialize drafting sheet",
  `Load profile — ${personalInfo.name}`,
  `Index projects [${projects.length}]`,
  `Map capabilities [${skills.categories.length}]`,
  `Attach experience [${experience.length}]`,
  "Start",
];

// Short system-log intro shown once per session. The page is already rendered beneath it.
export default function Boot() {
  const root = useRef(null);
  const [done, setDone] = useState(() => seen() || prefersReducedMotion());

  useLayoutEffect(() => {
    if (done) return;
    try {
      sessionStorage.setItem("boot", "1");
    } catch {
      /* storage unavailable: show it every time */
    }
    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      gsap
        .timeline({ onComplete: () => setDone(true) })
        .from("[data-line]", { opacity: 0, x: -8, duration: 0.25, stagger: 0.12, ease: "power2.out" })
        .to(counter, {
          v: 100,
          duration: 0.9,
          ease: "power2.inOut",
          onUpdate: () => {
            const el = root.current?.querySelector("[data-count]");
            if (el) el.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        }, 0)
        .to(root.current, { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, "+=0.15");
    }, root);
    return () => ctx.revert();
  }, [done]);

  if (done) return null;

  return (
    <div ref={root} aria-hidden="true" className="fixed inset-0 z-[90] flex flex-col justify-between bg-paper p-6 md:p-10">
      <ol className="label space-y-1 text-ink-2">
        {lines.map((l, i) => (
          <li key={l} data-line>
            <span className="text-mute">{String(i + 1).padStart(3, "0")}</span> {l}
          </li>
        ))}
      </ol>
      <div className="flex items-end justify-between">
        <span className="label text-mute">Portfolio — {new Date().getFullYear()}</span>
        <span data-count className="display text-[clamp(64px,12vw,180px)] leading-none">000</span>
      </div>
    </div>
  );
}
