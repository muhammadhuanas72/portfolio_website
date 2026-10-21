import { useRef } from "react";
import { portfolioData } from "../data/portfolioData";
import { gsap, useGsap, scrollToId, MOTION_OK } from "../lib/motion";
import IsoGlyph from "./IsoGlyph";
import { Btn } from "./ui";

const { name, introduction, socials, resumeUrl } = portfolioData.personalInfo;
const { projects } = portfolioData;

const sections = [
  { name: "Work", id: "work" },
  { name: "Capabilities", id: "capabilities" },
  { name: "Experience", id: "experience" },
  { name: "Certifications", id: "certifications" },
];

function Col({ title, children, className = "" }) {
  return (
    <div className={`border-b border-line px-4 py-5 md:border-l md:px-5 ${className}`}>
      <p className="label text-mute">{title}</p>
      <ul className="mt-3 space-y-1.5 text-[14px]">{children}</ul>
    </div>
  );
}

const ext = { target: "_blank", rel: "noopener noreferrer" };

export default function Contact() {
  const root = useRef(null);

  useGsap(root, (add) => {
    add(MOTION_OK, () => {
      gsap.fromTo(
        "[data-wordmark]",
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          ease: "none",
          scrollTrigger: { trigger: "[data-wordmark]", start: "top 95%", end: "bottom 85%", scrub: true },
        }
      );
    });
  });

  return (
    <footer id="contact" ref={root}>
      {/* Call to action */}
      <section className="relative grid border-b border-line md:grid-cols-[1fr_2fr_1fr]" aria-labelledby="cta-title">
        <div className="label hidden border-r border-line p-3 text-mute md:block">[0,240]</div>
        <div className="flex flex-col items-center px-4 py-20 text-center md:py-28">
          <h2 id="cta-title" className="display text-[clamp(32px,4.2vw,60px)]">
            Let&rsquo;s build
            <br />
            something together
          </h2>
          <p className="mt-4 max-w-[46ch] text-[14px] leading-snug text-ink-2">
            Open to frontend and Java developer roles. Write to me at{" "}
            <a href={`mailto:${socials.email}`} className="underline decoration-line underline-offset-4 hover:text-signal">
              {socials.email}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Btn href={`mailto:${socials.email}`} signal>
              Email me
            </Btn>
            <Btn href={resumeUrl} download="Muhammadhu_Anas_Resume.pdf">
              Resume
            </Btn>
          </div>
        </div>
        <div className="label hidden border-l border-line p-3 text-right text-mute md:block">[1440,900]</div>
      </section>

      {/* Directory */}
      <div className="grid md:grid-cols-12">
        <div className="flex flex-col justify-between gap-8 border-b border-line px-4 py-6 md:col-span-4 md:px-6">
          <p className="display text-[clamp(22px,2vw,30px)]">{introduction.split(" while ")[0]}</p>
          <IsoGlyph name="mark" size={64} className="h-24 w-24 text-ink md:h-32 md:w-32" />
        </div>
        <div className="grid grid-cols-2 md:col-span-8 md:grid-cols-4">
          <Col title="Sections">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(s.id);
                  }}
                  className="hover:text-signal"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </Col>
          <Col title="Live projects">
            {projects.map((p) => (
              <li key={p.id}>
                <a href={p.demoUrl} {...ext} className="hover:text-signal">
                  {p.title}
                </a>
              </li>
            ))}
          </Col>
          <Col title="Contact">
            <li>
              <a href={`mailto:${socials.email}`} className="break-all text-signal hover:underline">
                {socials.email}
              </a>
            </li>
            <li>
              <a href={`tel:${socials.phone.replace(/\s/g, "")}`} className="hover:text-signal">
                {socials.phone}
              </a>
            </li>
            <li className="text-ink-2">{socials.location}</li>
          </Col>
          <Col title="Social">
            <li>
              <a href={socials.github} {...ext} className="hover:text-signal">
                GitHub
              </a>
            </li>
            <li>
              <a href={socials.linkedin} {...ext} className="hover:text-signal">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={resumeUrl} download="Muhammadhu_Anas_Resume.pdf" className="hover:text-signal">
                Resume (PDF)
              </a>
            </li>
          </Col>
        </div>
      </div>

      {/* Construction-drawn wordmark */}
      <div className="relative overflow-hidden border-b border-line px-4 pb-4 pt-8 md:px-6">
        <svg data-wordmark viewBox="0 0 1000 190" className="w-full" aria-hidden="true">
          <g stroke="var(--color-line)" strokeDasharray="4 6">
            <line x1="0" y1="22" x2="1000" y2="22" />
            <line x1="0" y1="168" x2="1000" y2="168" />
            <line x1="0" y1="95" x2="1000" y2="95" />
          </g>
          <text
            x="500"
            y="168"
            textAnchor="middle"
            textLength="990"
            lengthAdjust="spacingAndGlyphs"
            fontFamily="Inter Tight, sans-serif"
            fontWeight="700"
            fontSize="200"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="1.2"
          >
            ANAS M.
          </text>
          <g fill="var(--color-ink)">
            {[8, 500, 992].map((x) => (
              <circle key={x} cx={x} cy="95" r="2.5" />
            ))}
          </g>
        </svg>
      </div>

      <div className="label flex flex-col justify-between gap-1 px-4 py-4 text-mute md:flex-row md:px-6">
        <span>
          &copy;{new Date().getFullYear()} {name}. All rights reserved.
        </span>
        <span>Tamil Nadu, India</span>
      </div>
    </footer>
  );
}
