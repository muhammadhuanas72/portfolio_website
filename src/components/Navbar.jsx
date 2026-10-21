import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

// Section ids are remapped to the redesigned sections in Phase 5.
const navLinks = [
  { name: "Work", id: "projects" },
  { name: "Capabilities", id: "skills" },
  { name: "About", id: "experience" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 text-paper mix-blend-difference">
      <div className="grid grid-cols-2 items-center px-[var(--gutter)] py-5 md:grid-cols-12 md:py-6">
        <a
          href="#hero"
          onClick={(e) => go(e, "hero")}
          className="text-[15px] font-medium tracking-tight md:col-span-3"
        >
          Anas M.
        </a>

        <nav className="t-label hidden items-center gap-8 md:col-span-6 md:flex md:justify-center" aria-label="Primary">
          {navLinks.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => go(e, link.id)}
              className="text-mute transition-colors hover:text-paper"
            >
              <span className="text-dim">[0{i + 1}]</span> {link.name}
            </a>
          ))}
        </nav>

        <div className="flex justify-end md:col-span-3">
          <a
            href="#contact"
            onClick={(e) => go(e, "contact")}
            className="t-label hidden items-center gap-1 rounded-full border border-paper/40 px-4 py-2 transition-colors hover:border-paper md:inline-flex"
          >
            Contact <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="t-label px-1 py-2 md:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-[var(--gutter)] pb-10 pt-24 md:hidden"
        >
          <ul className="flex flex-col gap-2">
            {[...navLinks, { name: "Contact", id: "contact" }].map((link, i) => (
              <li key={link.id} className="flex items-baseline gap-4 border-b border-line py-3">
                <span className="t-label text-dim">[0{i + 1}]</span>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => go(e, link.id)}
                  className="text-5xl font-semibold uppercase tracking-[-0.04em]"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <p className="t-label text-mute">Tamil Nadu, IN</p>
        </nav>
      )}
    </>
  );
}
