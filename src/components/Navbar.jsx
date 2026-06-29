import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const navLinks = [
  { name: "About", id: "about" },
  { name: "Skills", id: "skills" },
  { name: "Experience", id: "experience" },
  { name: "Projects", id: "projects" },
  { name: "AI Workflow", id: "ai-workflow" },
  { name: "Certifications", id: "certifications" },
  { name: "Contact", id: "contact" }
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }

      // Check if user scrolled past a certain point for styling
      setScrolled(window.scrollY > 50);

      // Simple active section finder based on scroll position
      const sections = ["hero", ...navLinks.map((link) => link.id)];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If section is near top of viewport, mark it active
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#050505]/70 backdrop-blur-md border-b border-white/5 py-4"
          : "bg-transparent py-6"
      }`}
    >
      {/* Scroll Progress Indicator */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-neutral-900">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-200 to-amber-500 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand Name */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "hero")}
          className="text-2xl font-heading font-extrabold tracking-wider bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent cursor-pointer"
        >
          ANAS
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className={`text-sm font-medium tracking-wide uppercase transition-colors relative py-1 ${
                activeSection === link.id
                  ? "text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {link.name}
              {activeSection === link.id && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-400 to-amber-500" />
              )}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-amber-500 transition-all duration-300 px-4 py-2 rounded-full cursor-pointer ml-4 border border-amber-500/20"
          >
            Hire Me <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white hover:text-amber-400 transition-colors p-1"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[70px] bg-[#050505] border-b border-white/5 py-8 px-6 shadow-2xl flex flex-col space-y-6">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className={`text-lg font-medium tracking-wider transition-colors ${
                activeSection === link.id ? "text-amber-400" : "text-neutral-400"
              }`}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-black bg-white hover:bg-amber-500 transition-all font-semibold uppercase tracking-wider text-sm border border-amber-500/20"
          >
            Hire Me <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </header>
  );
}
