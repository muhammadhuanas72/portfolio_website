import { useState, useEffect } from "react";
import Lenis from "lenis";
import { ArrowUp } from "lucide-react";


import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import AIWorkflow from "./components/AIWorkflow";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import { portfolioData } from "./data/portfolioData";

export default function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { name } = portfolioData.personalInfo;

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    // Track scroll for showing back-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="grain min-h-screen bg-ink text-paper">
      {/* Navigation bar */}
      <Navbar />

      {/* Core Sections */}
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <AIWorkflow />
        <Certifications />
        <Contact />
      </main>

      {/* Footer Section */}
      <footer className="border-t border-line px-[var(--gutter)] py-10">
        <div className="t-label flex flex-col justify-between gap-2 text-mute md:flex-row">
          <span>&copy; {new Date().getFullYear()} {name}</span>
          <span>Drafted in code — Tamil Nadu, IN</span>
        </div>
      </footer>

      {/* Back to top floating indicator button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 rounded-full border border-line bg-ink p-3.5 text-mute transition-colors hover:border-paper hover:text-paper"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
