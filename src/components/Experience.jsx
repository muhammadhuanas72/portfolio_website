import { motion } from "framer-motion";
import { Briefcase, Calendar, ChevronRight } from "lucide-react";
import { portfolioData } from "../data/portfolioData";

export default function Experience() {
  const experiences = portfolioData.experience;

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section
      id="experience"
      className="relative py-28 px-6 md:px-12 bg-[#050505] overflow-hidden"
    >
      {/* Lights */}
      <div className="absolute top-[40%] right-[0%] w-[35vw] h-[35vw] rounded-full bg-amber-600/[0.015] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[0%] w-[30vw] h-[30vw] rounded-full bg-amber-500/[0.015] blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-widest font-mono text-amber-400 mb-2"
          >
            03 / History
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold text-white"
          >
            Work Experience
          </motion.h2>
        </div>

        {/* Timeline container */}
        <div className="relative border-l border-neutral-800 ml-4 md:ml-32 pl-10 md:pl-12 space-y-16">
          {experiences.map((exp) => (
            <motion.div
              key={exp.id}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              {/* Timeline dot */}
              <span className="absolute left-[-40px] md:left-[-48px] -translate-x-1/2 top-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-[#050505] border-2 border-amber-500 shadow-md">
                <Briefcase className="w-4 h-4 text-amber-400" />
              </span>

              {/* Date Box (Absolute position in desktop left) */}
              <div className="hidden md:block absolute -left-[220px] top-2 text-right w-32">
                <div className="flex items-center justify-end gap-1.5 text-neutral-500 font-mono text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{exp.period}</span>
                </div>
              </div>

              {/* Mobile Date indicator */}
              <div className="md:hidden flex items-center gap-1.5 text-neutral-500 font-mono text-[10px] uppercase tracking-wider mb-2">
                <Calendar className="w-3 h-3" />
                <span>{exp.period}</span>
              </div>

              {/* Experience Card */}
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 relative hover:border-amber-500/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-heading font-bold text-white">
                      {exp.role}
                    </h3>
                    <p className="text-sm font-semibold text-amber-400 font-heading">
                      {exp.company}
                    </p>
                  </div>
                  <span className="self-start md:self-auto px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider font-mono text-amber-400 bg-amber-950/20 border border-amber-800/30">
                    Internship
                  </span>
                </div>

                <p className="text-neutral-400 text-xs md:text-sm leading-relaxed mb-6">
                  {exp.description}
                </p>

                {/* Achievements list */}
                <ul className="space-y-3.5">
                  {exp.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-neutral-400">
                      <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
