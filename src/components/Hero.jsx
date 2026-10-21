import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { portfolioData } from "../data/portfolioData";
import DraftSketch from "../hero/DraftSketch";

// Cinematic hero. Layers are separate wrappers so cursor parallax (Phase 3) and the
// scroll timeline (Phase 4) can each own their own transforms without conflict.
export default function Hero() {
  const { name, titles, headline, statement, resumeUrl, socials } = portfolioData.personalInfo;
  const education = portfolioData.about.timeline[0];

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink text-paper"
    >
      {/* Layer: light */}
      <div data-layer="light" className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-[46%] h-[110vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(241,240,236,0.09),rgba(241,240,236,0.025)_55%,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      {/* Layer: object */}
      <div data-layer="object" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="hero-object aspect-square w-[min(92vw,54svh)] md:w-[min(64vw,82svh)] translate-y-[-4%] md:translate-y-[2%]">
          <DraftSketch className="h-full w-full" />
        </div>
      </div>

      {/* Layer: type */}
      <h1
        data-layer="type"
        className="t-display pointer-events-none absolute inset-x-0 top-[17svh] px-[var(--gutter)] mix-blend-difference md:top-[15svh]"
      >
        <span className="sr-only">{name}, {titles[0]}. </span>
        {headline.map((line, i) => (
          <span
            key={line}
            className={`block overflow-hidden pb-[0.06em] ${
              i === 1 ? "text-right" : i === 2 ? "pl-[6vw]" : ""
            }`}
          >
            <span data-line className="inline-block">{line}</span>
          </span>
        ))}
      </h1>

      {/* Layer: HUD */}
      <div data-layer="hud" className="t-label pointer-events-none absolute inset-0 text-mute" aria-hidden="true">
        <div className="absolute left-[var(--gutter)] top-[69%] hidden flex-col gap-1 md:flex">
          <span>[00] Index</span>
          <span className="text-dim">—</span>
          <span>{socials.location}</span>
          <span>{education.title} — {education.year.split(" - ")[1]}</span>
        </div>
        <div className="absolute right-[var(--gutter)] top-[69%] hidden flex-col items-end gap-1 md:flex">
          <span data-hud="coords">X 0000 · Y 0000</span>
          <span className="text-dim">—</span>
          <span>Fig. 01 — The Draft</span>
          <span>Modules 01—03</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        onClick={() => scrollTo("about")}
        className="t-label absolute right-[var(--gutter)] top-[calc(69%+5.5rem)] hidden flex-col items-end gap-3 text-mute transition-colors hover:text-paper md:flex"
      >
        <span>[ Scroll to continue ]</span>
        <span className="relative block h-10 w-px overflow-hidden bg-line">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_cubic-bezier(0.16,1,0.3,1)_infinite] bg-paper" />
        </span>
      </button>

      {/* Bottom composition */}
      <div className="absolute inset-x-0 bottom-0 grid grid-cols-1 gap-6 px-[var(--gutter)] pb-8 md:grid-cols-12 md:items-end md:gap-6 md:pb-10">
        <div className="md:col-span-3">
          <p className="text-[15px] font-medium leading-tight">{name}</p>
          <p className="t-label mt-1 text-mute">{titles[0]}</p>
        </div>

        <p className="max-w-[34ch] text-[15px] leading-snug text-mute md:col-span-4 md:col-start-5 md:text-base">
          {statement}
        </p>

        <div className="flex gap-2 md:col-span-4 md:col-start-9 md:justify-end">
          <button
            type="button"
            onClick={() => scrollTo("projects")}
            className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-white md:flex-none"
          >
            View work
            <ArrowDownRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:rotate-[-45deg]" />
          </button>
          <a
            href={resumeUrl}
            download="Muhammadhu_Anas_Resume.pdf"
            className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-medium text-paper transition-colors hover:border-paper md:flex-none"
          >
            Resume
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

    </section>
  );
}
