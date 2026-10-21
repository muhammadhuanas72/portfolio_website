import { useState } from "react";
import { portfolioData } from "../data/portfolioData";
import { Corners, Eyebrow } from "./ui";

const { certifications } = portfolioData;
const { name } = portfolioData.personalInfo;

// Soft edge so the drawing dissolves into the paper instead of ending in a hard rectangle.
const fade = {
  maskImage:
    "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent), linear-gradient(to bottom, transparent, #000 6%, #000 92%, transparent)",
  maskComposite: "intersect",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, #000 10%, #000 90%, transparent), linear-gradient(to bottom, transparent, #000 6%, #000 92%, transparent)",
  WebkitMaskComposite: "source-in",
};

export default function Certifications() {
  const [open, setOpen] = useState(0);

  return (
    <section id="certifications" className="border-b border-line">
      <div className="grid md:grid-cols-2">
        {/* Drawing, straight on the sheet like the hero: no frame, no animation */}
        <div className="relative min-h-[420px] overflow-hidden border-b border-line md:min-h-[640px] md:border-b-0 md:border-r">
          <img
            src="/media/learning.webp"
            alt={`Drawing of ${name} standing in a technical construction layout`}
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={fade}
          />
          <Corners />
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
