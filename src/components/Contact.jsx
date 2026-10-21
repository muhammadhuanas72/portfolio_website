import { portfolioData } from "../data/portfolioData";
import { scrollToId } from "../lib/motion";
import IsoGlyph from "./IsoGlyph";
import { useContent } from "../lib/contentContext";
import { Btn, ResumeMenu } from "./ui";
import Wordmark from "./Wordmark";

const { name, introduction, socials } = portfolioData.personalInfo;

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
  const { projects, resumes } = useContent();

  return (
    <footer id="contact">
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
            Open to frontend, Java developer and data analyst roles. Write to me at{" "}
            <a href={`mailto:${socials.email}`} className="underline decoration-line underline-offset-4 hover:underline underline-offset-4">
              {socials.email}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Btn href={`mailto:${socials.email}`} signal>
              Email me
            </Btn>
            <ResumeMenu label="Resumes" up align="right" />
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
                  className="hover:underline underline-offset-4"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </Col>
          <Col title="Live projects">
            {projects.filter((p) => p.demoUrl).map((p) => (
              <li key={p.id}>
                <a href={p.demoUrl} {...ext} className="hover:underline underline-offset-4">
                  {p.title}
                </a>
              </li>
            ))}
          </Col>
          <Col title="Contact">
            <li>
              <a href={`mailto:${socials.email}`} className="break-all text-ink underline-offset-4 hover:underline">
                {socials.email}
              </a>
            </li>
            <li>
              <a href={`tel:${socials.phone.replace(/\s/g, "")}`} className="hover:underline underline-offset-4">
                {socials.phone}
              </a>
            </li>
            <li className="text-ink-2">{socials.location}</li>
          </Col>
          <Col title="Social">
            <li>
              <a href={socials.github} {...ext} className="hover:underline underline-offset-4">
                GitHub
              </a>
            </li>
            <li>
              <a href={socials.linkedin} {...ext} className="hover:underline underline-offset-4">
                LinkedIn
              </a>
            </li>
            {resumes.map((r) => (
              <li key={r.slug}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" download className="hover:underline underline-offset-4">
                  Resume — {r.label}
                </a>
              </li>
            ))}
          </Col>
        </div>
      </div>

      <Wordmark />

      <div className="label flex flex-col justify-between gap-1 px-4 py-4 text-mute md:flex-row md:px-6">
        <span>
          &copy;{new Date().getFullYear()} {name}. All rights reserved.
        </span>
        <span>Tamil Nadu, India</span>
      </div>
    </footer>
  );
}
