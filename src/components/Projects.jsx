import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, CheckCircle, AlertTriangle } from "lucide-react";
import { portfolioData } from "../data/portfolioData";

// Inline brand icon SVGs to avoid Lucide V1 deprecation errors
const GithubIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Projects() {
  const projects = portfolioData.projects;
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section
      id="projects"
      className="relative py-28 px-6 md:px-12 bg-[#050505] overflow-hidden"
    >
      {/* Dynamic light glows */}
      <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-600/[0.015] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/[0.015] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-widest font-mono text-amber-400 mb-2"
          >
            04 / Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold text-white"
          >
            Featured Projects
          </motion.h2>
        </div>

        {/* Project Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              onClick={() => setSelectedProject(project)}
              className="glass-card rounded-2xl overflow-hidden border border-white/5 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Image Wrap */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Glass Hover overlay */}
                  <div className="absolute inset-0 bg-[#050505]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white font-mono text-xs uppercase tracking-wider">
                      View Showcase
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <span className="text-[10px] font-semibold tracking-wider font-mono text-amber-400 bg-amber-950/20 border border-amber-800/30 px-2 py-0.5 rounded">
                    {project.subtitle}
                  </span>
                  
                  <h3 className="text-xl font-heading font-bold text-white mt-3 group-hover:text-amber-400 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-xs text-neutral-400 leading-relaxed mt-3.5 line-clamp-3">
                    {project.details}
                  </p>
                </div>
              </div>

              {/* Tech Tags Footer */}
              <div className="px-6 pb-6 md:px-8 md:pb-8 flex flex-wrap gap-1.5">
                {project.tech.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-mono text-neutral-500 bg-neutral-900/40 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
                {project.tech.length > 3 && (
                  <span className="text-[9px] font-mono text-neutral-500 bg-neutral-900/40 px-2 py-0.5 rounded">
                    +{project.tech.length - 3} more
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Project details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div 
            className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto py-8 md:py-16"
            data-lenis-prevent
          >
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-4xl my-auto glass-card rounded-2xl border border-white/10 bg-[#0d0d12] shadow-2xl z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 border border-white/5 hover:border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Large Image Showcase */}
              <div className="relative w-full aspect-video bg-neutral-950 overflow-hidden">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-transparent" />
              </div>

              {/* Details Content */}
              <div className="p-6 md:p-10 -mt-8 relative z-10">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-wider font-mono text-amber-400 bg-amber-950/25 border border-amber-800/30">
                  {selectedProject.subtitle}
                </span>

                <h3 className="text-2xl md:text-4xl font-heading font-extrabold text-white mt-4">
                  {selectedProject.title}
                </h3>

                <p className="text-neutral-300 text-sm md:text-base leading-relaxed mt-6">
                  {selectedProject.details}
                </p>

                {/* Grid features / challenges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-heading font-bold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-400" /> Key Features
                    </h4>
                    <ul className="space-y-3">
                      {selectedProject.features.map((feature, idx) => (
                        <li key={idx} className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges */}
                  <div>
                    <h4 className="text-sm font-heading font-bold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Engineering Challenges
                    </h4>
                    <ul className="space-y-3">
                      {selectedProject.challenges.map((challenge, idx) => (
                        <li key={idx} className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tech tags used */}
                <div className="mt-10 border-t border-white/5 pt-8">
                  <h4 className="text-xs font-mono uppercase text-neutral-500 tracking-wider mb-3">
                    Technologies Implemented
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-white/5 px-3 py-1 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons inside popup */}
                <div className="flex flex-wrap gap-4 mt-10">
                  {selectedProject.demoUrl !== "#" && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-450 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all border border-amber-500/20"
                    >
                      Live Demo <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full border border-white/10 hover:border-amber-500/30 bg-white/5 hover:bg-amber-500/5 text-white hover:text-amber-200 font-medium text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                  >
                    GitHub Repo <GithubIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
