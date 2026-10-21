import { useRef } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, useGsap, MOTION_OK } from "../lib/motion";
import IsoGlyph from "./IsoGlyph";
import { Eyebrow, Plus } from "./ui";

const { categories } = portfolioData.skills;
const glyphFor = { frontend: "layers", data: "bars", programming: "shaft", "ai-dev": "orb", tools: "kit" };

export default function Capabilities() {
  const root = useRef(null);

  useGsap(root, (add) => {
    add(MOTION_OK, () => {
      gsap.from("[data-col]", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-cols]", start: "top 80%", toggleActions: "play none none reverse" },
      });
      // Glyph strokes draw in like a pen on paper, tied to scroll so they retrace on the way back up.
      // Only solid strokes draw in; dashed hidden lines keep their dash pattern.
      const strokes = gsap.utils
        .toArray("[data-glyph] svg :is(line, polyline, polygon, circle, ellipse)")
        .filter((el) => !el.closest("[stroke-dasharray]"));
      strokes.forEach((el) => el.setAttribute("pathLength", "1"));
      gsap.fromTo(
        strokes,
        { strokeDasharray: "1 1", strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: "[data-cols]", start: "top 75%", end: "top 25%", scrub: true },
        }
      );
    });
  });

  return (
    <section id="capabilities" ref={root} className="border-b border-line">
      <div className="grid gap-6 px-4 pb-10 pt-8 md:grid-cols-12 md:px-6 md:pb-14">
        <div className="md:col-span-8">
          <Eyebrow>Capabilities</Eyebrow>
          <h2 className="display mt-3 text-[clamp(30px,3.5vw,52px)]">
            What I bring to
            <br />
            every build
          </h2>
        </div>
        <p className="max-w-[44ch] self-end text-[14px] leading-snug text-ink-2 md:col-span-4">
          {portfolioData.aiWorkflow.description.split(". ")[0]}.
        </p>
      </div>

      <div data-cols className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((c, i) => (
          <article key={c.id} data-col className="flex flex-col border-b border-line sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
            <header className="label flex justify-between border-b border-line px-4 py-3">
              <span className="flex items-center gap-2">
                {c.id === "ai-dev" && <span aria-hidden="true" className="h-2 w-2 bg-signal" />}
                {c.title.split(" ")[0]}
              </span>
              <span className="text-mute">[0{i + 1}]</span>
            </header>

            {/* Large drawing from tablet up; phones get a small one beside the title */}
            <div data-glyph className="relative hidden aspect-[4/3] items-center justify-center border-b border-dashed border-line text-ink-2 sm:flex">
              <Plus at="tl" />
              <Plus at="tr" />
              <Plus at="bl" />
              <Plus at="br" />
              <IsoGlyph name={glyphFor[c.id]} className="h-[58%] w-[58%]" />
            </div>

            <div className="flex flex-1 flex-col gap-3 px-4 pb-5 pt-4 sm:gap-4 sm:pb-6 sm:pt-5">
              <div className="flex items-center gap-3">
                <IsoGlyph name={glyphFor[c.id]} className="h-11 w-11 shrink-0 text-ink-2 sm:hidden" />
                <h3 className="display text-[clamp(18px,1.5vw,22px)] leading-[1]">{c.title}</h3>
              </div>
              <p className="text-[13px] leading-snug text-ink-2">{c.description}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {c.items.map((it) => (
                  <li key={it} className="label border border-line px-2 py-1 text-ink-2">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
