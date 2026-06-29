import { useState, useEffect } from "react";
import Lenis from "lenis";
import { ArrowUp, Mail } from "lucide-react";

// Inline brand icon SVGs to avoid Lucide V1 deprecation errors
const GithubIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

import CustomCursor from "./components/CustomCursor";
import LoadingScreen from "./components/LoadingScreen";
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
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { socials } = portfolioData.personalInfo;

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    // Track scroll for showing back-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Loading preloader screen */}
      <LoadingScreen onFinished={() => setIsLoading(false)} />

      {!isLoading && (
        <div className="bg-[#050505] text-neutral-300 min-h-screen selection:bg-purple-500/30 selection:text-white">
          {/* Custom Mouse Cursor */}
          <CustomCursor />

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
          <footer className="border-t border-white/5 py-12 px-6 md:px-12 bg-[#09090d]/30 relative z-10 text-center">
            <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 text-center">
              {/* Initials & copyright */}
              <div>
                <span className="text-lg font-heading font-extrabold tracking-widest bg-gradient-to-r from-white to-amber-400 bg-clip-text text-transparent">
                  MAM
                </span>
                <p className="text-[11px] text-neutral-500 font-mono mt-1.5">
                  &copy; {new Date().getFullYear()} Muhammadhu Anas M. All rights reserved.
                </p>
              </div>
            </div>
          </footer>

          {/* Back to top floating indicator button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-neutral-900 border border-white/10 hover:border-amber-500 text-neutral-400 hover:text-amber-200 transition-all shadow-xl cursor-pointer"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
