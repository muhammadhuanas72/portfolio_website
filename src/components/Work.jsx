import { useRef } from "react";
import { useContent } from "../lib/contentContext";
import { gsap, ScrollTrigger, useGsap, MOTION_OK, DESKTOP, MOBILE } from "../lib/motion";
import IsoGlyph from "./IsoGlyph";
import RenderReveal from "./RenderReveal";
import { Btn, Corners, Eyebrow, Plus } from "./ui";

const host = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export default function Work() {
  const root = useRef(null);
  const { projects } = useContent();
  const web = projects.filter((p) => p.category !== "data");
  const data = projects.filter((p) => p.category === "data");

  useGsap(
    root,
    (add) => {
      // Screenshots are unveiled top-down as they scroll in, like a print sliding out of a plotter.
      add(MOTION_OK, () => {
        gsap.utils.toArray("[data-reveal]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 88%", end: "top 38%", scrub: 0.6 },
            }
          );
        });
        gsap.from("[data-dcell]", {
          opacity: 0,
          y: 24,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-dgrid]", start: "top 80%", toggleActions: "play none none reverse" },
        });
      });
      add(DESKTOP, () => {
        gsap.utils.toArray("[data-shot] img").forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -6, scale: 1.12 },
            {
              yPercent: 6,
              scale: 1.12,
              ease: "none",
              scrollTrigger: { trigger: img.closest("[data-shot]"), start: "top bottom", end: "bottom top", scrub: true },
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
    },
    [projects]
  );

  return (
    <section id="work" ref={root} className="border-b border-line">
      <div className="grid gap-6 px-4 pb-10 pt-12 md:grid-cols-12 md:px-6 md:pt-16">
        <div className="md:col-span-8">
          <Eyebrow signal>Selected work</Eyebrow>
          <h2 className="display mt-3 text-[clamp(30px,3.5vw,52px)]">
            Built, shipped
            <br />
            and measured
          </h2>
        </div>
        <p className="label self-end text-mute md:col-span-4 md:text-right">
          [{String(web.length).padStart(2, "0")}] Web builds · [{String(data.length).padStart(2, "0")}] Data &amp; analytics
        </p>
      </div>

      {web.map((p, i) => (
        <WebProject key={p.id} p={p} i={i} />
      ))}

      {data.length > 0 && (
        <div id="analytics" className="scroll-mt-[var(--nav-h)] border-t border-line">
          <div className="grid gap-4 px-4 pb-8 pt-12 md:grid-cols-12 md:px-6">
            <div className="md:col-span-8">
              <Eyebrow>Data &amp; analytics</Eyebrow>
              <h3 className="display mt-3 text-[clamp(26px,2.8vw,42px)]">
                Dashboards, models
                <br />
                and queries
              </h3>
            </div>
          </div>
          <div data-dgrid className="grid border-t border-line md:grid-cols-2 lg:grid-cols-3">
            {data.map((p, i) => (
              <DataProject key={p.id} p={p} i={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function WebProject({ p, i }) {
  const flip = i % 2 === 1;
  const Frame = p.demoUrl ? "a" : "div";
  const frameProps = p.demoUrl
    ? {
        href: p.demoUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `Open the live demo of ${p.title}`,
        "data-cursor": "Open live demo ↗",
      }
    : {};

  return (
    <article id={`project-${i + 1}`} className="grid scroll-mt-[var(--nav-h)] border-t border-line md:grid-cols-12">
      {/* Copy */}
      <div className={`flex flex-col border-line md:col-span-5 ${flip ? "md:order-2 md:border-l" : "md:border-r"}`}>
        <div className="label flex justify-between border-b border-line px-4 py-3 md:px-6">
          <span className="text-mute">
            [{String(i + 1).padStart(2, "0")}]{p.year ? ` · ${p.year}` : ""}
          </span>
          <span>{p.subtitle}</span>
        </div>
        <div className="px-4 pb-6 pt-6 md:px-6">
          <h3 className="display text-[clamp(28px,2.8vw,42px)]">{p.title}</h3>
          {p.details && <p className="mt-4 max-w-[52ch] text-[14px] leading-snug text-ink-2">{p.details}</p>}
        </div>

        {p.features?.length > 0 && (
          <ul className="border-t border-line">
            {p.features.map((f, k) => (
              <li key={f} className="flex gap-4 border-b border-line px-4 py-3 text-[13px] leading-snug md:px-6">
                <span className="label pt-0.5 text-mute">{String(k + 1).padStart(2, "0")}</span>
                {f}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto px-4 pb-6 pt-5 md:px-6">
          <Tags items={p.tech} />
          {(p.demoUrl || p.githubUrl) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {p.demoUrl && (
                <Btn href={p.demoUrl} external signal>
                  Live demo
                </Btn>
              )}
              {p.githubUrl && (
                <Btn href={p.githubUrl} external>
                  GitHub
                </Btn>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Screenshot on a drafting sheet */}
      <Frame
        {...frameProps}
        data-shot
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
            <span className="ml-3 truncate">{p.demoUrl ? host(p.demoUrl) : p.title}</span>
          </div>
          {p.image && p.lines ? (
            <RenderReveal
              lines={p.lines}
              src={p.image}
              alt={`Screenshot of ${p.title}`}
              className="aspect-[16/9] w-full md:aspect-auto md:h-[calc(100%-33px)]"
              imgClassName="object-cover object-top"
              renderClassName="contrast-[1.05] grayscale transition-[filter] duration-700 ease-out-expo group-hover:grayscale-0 group-[.in-view]:grayscale-0"
            />
          ) : p.image ? (
            <img
              data-reveal
              src={p.image}
              alt={`Screenshot of ${p.title}`}
              loading="lazy"
              decoding="async"
              className="aspect-[16/9] w-full object-cover object-top contrast-[1.05] grayscale transition-[filter] duration-700 ease-out-expo group-hover:grayscale-0 group-[.in-view]:grayscale-0 md:aspect-auto md:h-[calc(100%-33px)]"
            />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center text-ink-2 md:aspect-auto md:h-[calc(100%-33px)]">
              <IsoGlyph name="layers" className="h-1/2 w-1/2" />
            </div>
          )}
        </div>
        {p.demoUrl && (
          <span className="label absolute bottom-3 right-4 flex items-center gap-1.5 text-signal md:bottom-5 md:right-6">
            <span className="h-2 w-2 bg-signal" /> Open live
          </span>
        )}
      </Frame>
    </article>
  );
}

const dataGlyphs = ["bars", "orb", "shaft"];

function DataProject({ p, i }) {
  return (
    <article data-dcell className="flex flex-col border-b border-line md:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0">
      <header className="label flex justify-between border-b border-line px-4 py-3">
        <span>{p.subtitle}</span>
        <span className="text-mute">
          [D{String(i + 1).padStart(2, "0")}]{p.year ? ` · ${p.year}` : ""}
        </span>
      </header>
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-dashed border-line text-ink-2">
        <Plus at="tl" />
        <Plus at="tr" />
        <Plus at="bl" />
        <Plus at="br" />
        {p.image ? (
          <img data-reveal src={p.image} alt={`Preview of ${p.title}`} loading="lazy" className="h-full w-full object-cover grayscale" />
        ) : (
          <IsoGlyph name={dataGlyphs[i % dataGlyphs.length]} className="h-[62%] w-[62%]" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-5">
        <h4 className="display text-[clamp(20px,1.7vw,26px)] leading-[1]">{p.title}</h4>
        {p.details && <p className="text-[13px] leading-snug text-ink-2">{p.details}</p>}
        {p.features?.length > 0 && (
          <ul className="space-y-2">
            {p.features.map((f, k) => (
              <li key={f} className="flex gap-3 text-[13px] leading-snug">
                <span className="label pt-0.5 text-mute">{String(k + 1).padStart(2, "0")}</span>
                {f}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-2">
          <Tags items={p.tech} />
          {(p.demoUrl || p.githubUrl) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.demoUrl && (
                <Btn href={p.demoUrl} external signal>
                  View
                </Btn>
              )}
              {p.githubUrl && (
                <Btn href={p.githubUrl} external>
                  GitHub
                </Btn>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Tags({ items = [] }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t} className="label border border-line px-2 py-1 text-ink-2">
          {t}
        </li>
      ))}
    </ul>
  );
}
