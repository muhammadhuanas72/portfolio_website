import { useEffect, useState } from "react";
import { scrollToId } from "../lib/motion";
import IsoGlyph from "./IsoGlyph";

const links = [
  { name: "Work", id: "work" },
  { name: "Capabilities", id: "capabilities" },
  { name: "Experience", id: "experience" },
  { name: "Certifications", id: "certifications" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <header className="fixed inset-x-[var(--frame)] top-0 z-50 h-[var(--nav-h)] border-x border-b border-line bg-paper/95 backdrop-blur-[2px]">
        <div className="flex h-full items-stretch">
          <a
            href="#hero"
            onClick={(e) => go(e, "hero")}
            className="flex items-center gap-2.5 pl-4 pr-6 text-[19px] font-semibold uppercase tracking-[-0.04em] md:pl-6"
            aria-label="Muhammadhu Anas M — back to top"
          >
            <IsoGlyph name="mark" size={64} className="h-8 w-8" />
            Anas M.
          </a>

          <nav aria-label="Primary" className="ml-auto hidden h-full md:flex">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => go(e, l.id)}
                className="label group relative flex w-[clamp(110px,10.5vw,150px)] items-start border-l border-line px-2.5 pt-4 text-mute transition-colors hover:text-ink"
              >
                {l.name}
                <span className="absolute bottom-1 right-1 h-1.5 w-1.5 border-b border-r border-mute opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
            <a
              href="#contact"
              onClick={(e) => go(e, "contact")}
              className="label relative flex w-[clamp(120px,11vw,160px)] items-start border-l border-line px-2.5 pt-4 text-signal"
            >
              Contact me
              <span className="absolute bottom-2 right-3 text-[13px]">→</span>
            </a>
          </nav>

          <button
            type="button"
            className="label ml-auto border-l border-line px-5 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="fixed inset-x-[var(--frame)] bottom-0 top-[var(--nav-h)] z-40 flex flex-col border-x border-line bg-paper md:hidden"
        >
          {[...links, { name: "Contact me", id: "contact" }].map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => go(e, l.id)}
              className="display flex items-baseline justify-between border-b border-line px-4 py-5 text-[34px]"
            >
              <span className={l.id === "contact" ? "text-signal" : ""}>{l.name}</span>
              <span className="label text-mute">[0{i + 1}]</span>
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
