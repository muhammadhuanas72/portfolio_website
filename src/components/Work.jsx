import { useRef } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, ScrollTrigger, useGsap, DESKTOP, MOBILE } from "../lib/motion";
import { Btn, Corners, Eyebrow } from "./ui";

const { projects } = portfolioData;

export default function Work() {
  const root = useRef(null);

  useGsap(root, (add) => {
    add(DESKTOP, () => {
      gsap.utils.toArray("[data-shot]").forEach((shot) => {
        gsap.fromTo(
          shot.querySelector("img"),
          { yPercent: -6, scale: 1.12 },
          {
            yPercent: 6,
            scale: 1.12,
            ease: "none",
            scrollTrigger: { trigger: shot, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    });
    // No hover on touch screens: colour comes in while the screenshot is centred.
    add(MOBILE, () => {
      gsap.utils.toArray("[data-shot]").forEach((shot) => {
        ScrollTrigger.create({ trigger: shot, start: "top 65%", end: "bottom 35%", toggleClass: "in-view" });
      });
    });
  });

  return (
    <section id="work" ref={root} className="border-b border-line">
      <div className="grid gap-6 px-4 pb-10 pt-12 md:grid-cols-12 md:px-6 md:pt-16">
        <div className="md:col-span-8">
          <Eyebrow signal>Selected work</Eyebrow>
          <h2 className="display mt-3 text-[clamp(30px,3.5vw,52px)]">
            Built, shipped
            <br />
            and live
          </h2>
        </div>
        <p className="label self-end text-mute md:col-span-4 md:text-right">
          [01—0{projects.length}] Live demos and source on GitHub
        </p>
      </div>

      {projects.map((p, i) => {
        const flip = i % 2 === 1;
        return (
          <article
            key={p.id}
            id={`project-${i + 1}`}
            className="grid scroll-mt-[var(--nav-h)] border-t border-line md:grid-cols-12"
          >
            {/* Copy */}
            <div className={`flex flex-col md:col-span-5 ${flip ? "md:order-2 md:border-l" : "md:border-r"} border-line`}>
              <div className="label flex justify-between border-b border-line px-4 py-3 md:px-6">
                <span className="text-mute">[0{i + 1}]</span>
                <span>{p.subtitle}</span>
              </div>
              <div className="px-4 pb-6 pt-6 md:px-6">
                <h3 className="display text-[clamp(28px,2.8vw,42px)]">{p.title}</h3>
                <p className="mt-4 max-w-[52ch] text-[14px] leading-snug text-ink-2">{p.details}</p>
              </div>

              <ul className="border-t border-line">
                {p.features.map((f, k) => (
                  <li key={f} className="flex gap-4 border-b border-line px-4 py-3 text-[13px] leading-snug md:px-6">
                    <span className="label pt-0.5 text-mute">{String(k + 1).padStart(2, "0")}</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto px-4 pb-6 pt-5 md:px-6">
                <ul className="flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <li key={t} className="label border border-line px-2 py-1 text-ink-2">
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Btn href={p.demoUrl} external signal>
                    Live demo
                  </Btn>
                  <Btn href={p.githubUrl} external>
                    GitHub
                  </Btn>
                </div>
              </div>
            </div>

            {/* Screenshot on a drafting sheet */}
            <a
              href={p.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-shot
              aria-label={`Open the live demo of ${p.title}`}
              className={`group relative block min-h-[300px] overflow-hidden border-t border-line p-6 md:col-span-7 md:min-h-[560px] md:border-t-0 md:p-12 ${flip ? "md:order-1" : ""}`}
            >
              <Corners />
              <div aria-hidden="true" className="dash-x absolute inset-x-0 top-1/2 h-px" />
              <div aria-hidden="true" className="dash-y absolute inset-y-0 left-1/2 w-px" />
              <div className="relative h-full overflow-hidden border border-ink bg-paper-2 shadow-[8px_8px_0_0_var(--color-line)]">
                <div className="label flex items-center gap-1.5 border-b border-ink bg-paper px-3 py-2 text-mute">
                  <span className="h-2 w-2 rounded-full border border-mute" />
                  <span className="h-2 w-2 rounded-full border border-mute" />
                  <span className="h-2 w-2 rounded-full border border-mute" />
                  <span className="ml-3 truncate">{p.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                </div>
                <img
                  src={p.image}
                  alt={`Screenshot of ${p.title}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover object-top contrast-[1.05] grayscale transition-[filter] duration-700 ease-out-expo group-hover:grayscale-0 group-[.in-view]:grayscale-0 md:aspect-auto md:h-[calc(100%-33px)]"
                />
              </div>
              <span className="label absolute bottom-3 right-4 flex items-center gap-1.5 text-signal md:bottom-5 md:right-6">
                <span className="h-2 w-2 bg-signal" /> Open live
              </span>
            </a>
          </article>
        );
      })}
    </section>
  );
}
