import { useRef, useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, useGsap, DESKTOP } from "../lib/motion";
import RenderReveal from "./RenderReveal";
import { Corners, Eyebrow } from "./ui";

const { certifications } = portfolioData;
const { name } = portfolioData.personalInfo;

// Perspective floor grid converging on a vanishing point, as in an architectural elevation.
function FloorGrid() {
  const vx = 50;
  const rays = [-60, -30, -10, 5, 18, 30, 42, 58, 70, 82, 95, 110, 130, 160];
  const rows = [0, 6, 14, 25, 40];
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[20%] w-full" aria-hidden="true">
      <g stroke="var(--color-ink)" strokeWidth="0.15" fill="none" vectorEffect="non-scaling-stroke">
        {rays.map((x) => (
          <line key={x} x1={vx + (x - vx) * 0.12} y1="0" x2={x} y2="40" vectorEffect="non-scaling-stroke" />
        ))}
        {rows.map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}

export default function Certifications() {
  const root = useRef(null);
  const [open, setOpen] = useState(0);

  useGsap(root, (add) => {
    add(DESKTOP, () => {
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo("[data-disc]", { yPercent: 40 }, { yPercent: -40, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-figure]", { y: 30 }, { y: -20, ease: "none", scrollTrigger: st });
    });
  });

  return (
    <section id="certifications" ref={root} className="border-b border-line">
      <div className="grid md:grid-cols-2">
        {/* Composition */}
        <div className="relative min-h-[380px] overflow-hidden border-b border-line bg-paper-2 md:min-h-[640px] md:border-b-0 md:border-r">
          <Corners />
          {/* Construction lines */}
          <div aria-hidden="true" className="dash-x absolute inset-x-0 top-[12%] h-px" />
          <div aria-hidden="true" className="absolute bottom-[20%] left-[10%] top-[6%] w-px bg-line" />
          <div aria-hidden="true" className="absolute bottom-[20%] right-[10%] top-[6%] w-px bg-line" />
          <div data-disc aria-hidden="true" className="hatch absolute right-[12%] top-[8%] aspect-square w-[26%] rounded-full" />
          <FloorGrid />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-[20%] h-px bg-ink" />
          <span aria-hidden="true" className="absolute bottom-[7%] left-[14%] h-2.5 w-2.5 bg-signal" />

          <div data-figure className="absolute bottom-[20%] left-1/2 h-[70%] -translate-x-1/2 aspect-[1024/1280]">
            <div aria-hidden="true" className="absolute -left-[14%] -right-[14%] top-[18%] h-px bg-ink/50" />
            <div aria-hidden="true" className="absolute -bottom-[6%] -top-[6%] left-[24%] w-px bg-ink/40" />
            <RenderReveal
              lines="/media/hero-photo-lines.webp"
              src="/media/hero-photo.webp"
              alt={`Photo of ${name}`}
              className="h-full w-full border border-ink shadow-[8px_8px_0_0_var(--color-line)]"
              imgClassName="object-cover"
              start="top 80%"
              end="center 50%"
            />
          </div>
          <p className="label absolute bottom-4 left-4 text-mute">[ {certifications.length} certifications ]</p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col">
          <div className="px-4 pb-6 pt-10 md:px-[10%] md:pt-14">
            <Eyebrow>Certifications</Eyebrow>
            <h2 className="display mt-3 text-[clamp(30px,3.5vw,52px)]">
              Always
              <br />
              learning
            </h2>
          </div>
          <ul className="border-t border-line md:mx-[10%] md:border-t-0">
            {certifications.map((c, i) => {
              const isOpen = open === i;
              return (
                <li key={c.id} className="border-b border-line">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${c.id}-panel`}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left md:px-0"
                    >
                      <span className="display text-[clamp(17px,1.5vw,22px)]">{c.title}</span>
                      <span aria-hidden="true" className={`text-[18px] text-mute transition-transform duration-500 ease-out-expo ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${c.id}-panel`}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-5 md:px-0">
                        <p className="label text-mute">
                          {[c.issuer, c.date].filter(Boolean).join(" · ")}
                        </p>
                        {c.description && (
                          <p className="mt-2 max-w-[56ch] text-[14px] leading-snug text-ink-2">{c.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
