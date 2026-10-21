import { useRef, useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, useGsap, DESKTOP } from "../lib/motion";
import { Corners, Eyebrow } from "./ui";

const { certifications } = portfolioData;

export default function Certifications() {
  const root = useRef(null);
  const [open, setOpen] = useState(0);

  useGsap(root, (add) => {
    add(DESKTOP, () => {
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo("[data-disc]", { yPercent: 30 }, { yPercent: -40, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-slab]", { yPercent: -10 }, { yPercent: 20, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-figure]", { yPercent: 6 }, { yPercent: -4, ease: "none", scrollTrigger: st });
    });
  });

  return (
    <section id="certifications" ref={root} className="border-b border-line">
      <div className="grid md:grid-cols-2">
        {/* Composition */}
        <div className="relative min-h-[380px] overflow-hidden border-b border-line bg-paper-2 md:min-h-[640px] md:border-b-0 md:border-r">
          <Corners />
          <div data-disc aria-hidden="true" className="absolute left-[8%] top-[18%] aspect-square w-[42%] rounded-full bg-signal" />
          <div data-slab aria-hidden="true" className="absolute right-[16%] top-0 h-[70%] w-[16%] bg-signal/85" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-[14%] h-px bg-ink" />
          <img
            data-figure
            src="/media/portrait-ink.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute bottom-[14%] left-1/2 h-[78%] w-auto -translate-x-1/2"
          />
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
                        <p className="mt-2 max-w-[56ch] text-[14px] leading-snug text-ink-2">{c.description}</p>
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
