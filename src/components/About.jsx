import { motion } from "framer-motion";
import { BookOpen, Target, Award, Compass } from "lucide-react";
import { portfolioData } from "../data/portfolioData";

export default function About() {
  const { summary, careerObjective, timeline, passions } = portfolioData.about;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const getTimelineIcon = (index) => {
    switch (index) {
      case 0:
        return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 1:
        return <Award className="w-5 h-5 text-amber-500" />;
      default:
        return <Compass className="w-5 h-5 text-amber-300" />;
    }
  };

  return (
    <section
      id="about"
      className="relative py-28 px-6 md:px-12 bg-[#050505] overflow-hidden"
    >
      {/* Visual background lights */}
      <div className="absolute top-[30%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-600/[0.015] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/[0.015] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-widest font-mono text-amber-400 mb-2"
          >
            01 / Introduction
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold text-white"
          >
            About Me
          </motion.h2>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Summary and Career Objective */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="glass-card p-8 md:p-10 rounded-2xl border border-white/5 relative overflow-hidden flex-1 flex flex-col justify-center"
            >
              <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-4">
                Professional Summary
              </h3>
              <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
                {summary}
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="glass-card p-8 md:p-10 rounded-2xl border border-white/5 relative overflow-hidden flex-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-white">
                  Career Objective
                </h3>
              </div>
              <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
                {careerObjective}
              </p>
            </motion.div>
          </div>

          {/* Education Timeline */}
          <div className="lg:col-span-5">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="glass-card p-8 md:p-10 rounded-2xl border border-white/5 h-full"
            >
              <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-8">
                Education
              </h3>

              <div className="relative border-l border-neutral-800 ml-4 pl-10 space-y-10">
                {timeline.map((edu, idx) => (
                  <div key={edu.id} className="relative">
                    {/* Circle Node */}
                    <span className="absolute left-[-40px] -translate-x-1/2 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#0d0d12] border border-white/10 shadow-lg">
                      {getTimelineIcon(idx)}
                    </span>

                    {/* Content */}
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-wider font-mono text-amber-400 bg-amber-950/25 border border-amber-800/30 mb-2">
                        {edu.year}
                      </span>
                      <h4 className="text-base font-bold text-white mb-1">
                        {edu.title}
                      </h4>
                      <p className="text-xs text-neutral-400 font-medium mb-2">
                        {edu.institution}
                      </p>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {edu.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Passion highlights */}
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg font-heading font-bold text-neutral-400 mb-8 uppercase tracking-widest text-center"
          >
            Core Passion Highlights
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {passions.map((passion, index) => (
              <motion.div
                key={passion.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 rounded-xl border border-white/5 hover:border-amber-500/20 flex flex-col justify-between"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 mb-4" />
                <div>
                  <h4 className="text-white font-bold text-base mb-2 font-heading">
                    {passion.title}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {passion.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
