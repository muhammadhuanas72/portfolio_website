import { useRef } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, useGsap, DESKTOP } from "../lib/motion";
import IsoGlyph from "./IsoGlyph";
import { Eyebrow, Plus } from "./ui";

const { experience, about } = portfolioData;

const entries = [
  ...experience.map((e, i) => ({
    id: e.id,
    kind: "Internship",
    title: e.role,
    org: e.company,
    period: e.period,
    summary: e.description,
    points: e.highlights,
    glyph: i === 0 ? "layers" : "shaft",
  })),
  ...about.timeline.map((t, i) => ({
    id: t.id,
    kind: "Education",
    title: t.title,
    org: t.institution,
    period: t.year,
    summary: t.description,
    points: [],
    glyph: i === 0 ? "orb" : "kit",
  })),
];

export default function Experience() {
  const root = useRef(null);
  const pin = useRef(null);
  const track = useRef(null);

  useGsap(root, (add) => {
    add(DESKTOP, () => {
      const distance = () => track.current.scrollWidth - pin.current.clientWidth;
      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin.current,
          start: "top top+=62",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      gsap.fromTo(
        "[data-progress]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: pin.current, start: "top top+=62", end: () => `+=${distance()}`, scrub: true },
        }
      );
    });
  });

  return (
    <section id="experience" ref={root} className="border-b border-line">
      <div className="grid gap-6 px-4 pb-10 pt-12 md:grid-cols-12 md:px-6 md:pt-16">
        <div className="md:col-span-8">
          <Eyebrow>Experience &amp; education</Eyebrow>
          <h2 className="display mt-3 text-[clamp(30px,3.5vw,52px)]">
            Where I learned
            <br />
            to build
          </h2>
        </div>
        <p className="max-w-[44ch] self-end text-[14px] leading-snug text-ink-2 md:col-span-4">{about.careerObjective}</p>
      </div>

      <div ref={pin} className="relative overflow-hidden border-t border-line md:h-[calc(100svh-var(--nav-h))]">
        {/* Signal line running through every stage */}
        <div aria-hidden="true" className="absolute inset-x-0 top-[calc(46%+26px)] z-0 hidden h-px bg-signal/40 md:block" />
        <div aria-hidden="true" data-progress className="absolute inset-x-0 top-[calc(46%+26px)] z-0 hidden h-px origin-left bg-signal md:block" />

        <ol ref={track} className="relative flex flex-col md:h-full md:w-max md:flex-row">
          {entries.map((e, i) => (
            <li
              key={e.id}
              className="relative grid border-b border-line md:h-full md:w-[min(72vw,980px)] md:grid-rows-[46%_auto_1fr] md:border-b-0 md:border-r"
            >
              {/* Drawing */}
              <div className="relative flex min-h-[220px] items-center justify-center bg-[linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] bg-[size:48px_48px] bg-center">
                <Plus at="tl" />
                <Plus at="tr" />
                <IsoGlyph name={e.glyph} className="h-[70%] max-h-[220px] w-auto text-ink-2" />
                <div className="absolute left-[12%] top-[16%] w-[min(220px,50%)] bg-signal p-2.5 text-white">
                  <p className="label flex justify-between opacity-90">
                    <span>{e.kind}</span>
                    <span>[0{i + 1}]</span>
                  </p>
                  <p className="mt-1 text-[15px] font-semibold uppercase leading-[1.05]">{e.period}</p>
                </div>
              </div>

              {/* Title bar on the line */}
              <div className="relative z-10 flex flex-col gap-1 bg-ink px-4 py-3 text-paper md:mr-[18%] md:flex-row md:items-center md:justify-between md:gap-6 md:px-6">
                <h3 className="display text-[clamp(20px,1.9vw,28px)]">{e.title}</h3>
                <p className="text-[13px] text-paper/70">{e.org}</p>
              </div>

              {/* Detail */}
              <div className="grid gap-5 px-4 pb-8 pt-6 md:grid-cols-2 md:px-6">
                <p className="text-[14px] leading-snug text-ink-2">{e.summary}</p>
                {e.points.length > 0 && (
                  <ul className="space-y-2">
                    {e.points.map((pt, k) => (
                      <li key={pt} className="flex gap-3 text-[13px] leading-snug">
                        <span className="label pt-0.5 text-mute">{String(k + 1).padStart(2, "0")}</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
