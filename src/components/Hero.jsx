import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { portfolioData } from "../data/portfolioData";
import avatarImg from "../assets/profile_nobg.png";

export default function Hero() {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [displayedTitle, setDisplayedTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { name, titles, introduction, avatar, resumeUrl } = portfolioData.personalInfo;

  // Typewriter effect for titles
  useEffect(() => {
    let timer;
    const fullText = titles[currentTitleIndex];
    const typingSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && displayedTitle === fullText) {
      // Pause before deleting
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayedTitle === "") {
      setIsDeleting(false);
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
    } else {
      timer = setTimeout(() => {
        setDisplayedTitle((prev) =>
          isDeleting
            ? fullText.substring(0, prev.length - 1)
            : fullText.substring(0, prev.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayedTitle, isDeleting, currentTitleIndex, titles]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrint = (e) => {
    e.preventDefault();
    window.print();
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg py-20 px-6 md:px-12"
    >
      {/* Decorative minimalistic radial glow spots */}
      <div className="absolute top-[25%] left-[15%] w-[40vw] h-[40vw] rounded-full bg-amber-500/[0.02] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[25%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-yellow-600/[0.015] blur-[150px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl text-center select-none">
        {/* Intro Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/5 text-amber-400 font-mono text-[10px] uppercase tracking-widest mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Leveraging AI for Accelerated Engineering
        </motion.div>

        {/* Profile Avatar Image */}
        {avatar && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative w-56 h-56 md:w-64 md:h-64 mx-auto mb-2 flex items-center justify-center"
          >
            {/* Gold backplate glow */}
            <div className="absolute inset-4 bg-gradient-to-tr from-amber-500/5 to-yellow-500/8 rounded-full blur-2xl animate-pulse" />
            
            {/* Floating cutout frame */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full h-full"
            >
              <img
                src={avatarImg}
                alt={name}
                className="w-full h-full object-contain filter drop-shadow-[0_8px_24px_rgba(212,175,55,0.15)] select-none pointer-events-none"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Large Name Display */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-heading font-extrabold tracking-tight text-white mb-6"
        >
          {name}
        </motion.h1>

        {/* Dynamic Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-10 md:h-14 flex items-center justify-center text-xl md:text-3xl font-heading text-neutral-400 mb-8"
        >
          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-semibold">
            {displayedTitle}
          </span>
          <span className="typewriter-cursor h-6 md:h-9 ml-1" />
        </motion.div>

        {/* Brief Intro */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto text-base md:text-lg text-neutral-400 leading-relaxed mb-12 px-2"
        >
          {introduction}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
        >
          <button
            onClick={() => scrollToSection("projects")}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-amber-400/20"
          >
            Explore My Work
          </button>
          
          <a
            href={resumeUrl}
            download="Muhammadhu_Anas_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 hover:border-amber-500/30 bg-white/5 hover:bg-amber-500/5 text-white hover:text-amber-200 font-medium text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            Download Resume <ArrowUpRight className="w-4 h-4" />
          </a>
          
          <button
            onClick={() => scrollToSection("contact")}
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 text-amber-200/80 hover:text-amber-200 font-medium text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            Contact Me
          </button>
        </motion.div>
      </div>

      {/* Down Scroll Indicator */}
      <div 
        onClick={() => scrollToSection("about")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500 hover:text-amber-400 cursor-pointer transition-colors duration-300"
      >
        <span className="text-[9px] tracking-widest uppercase font-mono">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4" />
        </motion.div>
      </div>
    </section>
  );
}
