import { motion } from "framer-motion";
import { Award, Calendar, ArrowUpRight } from "lucide-react";
import { portfolioData } from "../data/portfolioData";

export default function Certifications() {
  const certifications = portfolioData.certifications;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: custom * 0.1, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <section
      id="certifications"
      className="relative py-28 px-6 md:px-12 bg-[#050505] overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-600/[0.015] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/[0.015] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-widest font-mono text-amber-400 mb-2"
          >
            06 / Verification
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold text-white"
          >
            Certifications
          </motion.h2>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-amber-500/20 group relative overflow-hidden"
            >
              {/* Corner Node */}
              <span className="absolute top-0 right-0 w-[40px] h-[40px] bg-gradient-to-bl from-amber-500/10 to-transparent flex items-center justify-center rounded-bl-xl group-hover:from-amber-500/20 transition-all duration-300">
                <Award className="w-4 h-4 text-amber-400" />
              </span>

              <div>
                {/* Meta details */}
                <div className="flex items-center gap-1.5 text-neutral-500 font-mono text-[10px] uppercase tracking-wider mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{cert.date}</span>
                </div>

                {/* Title and Issuer */}
                <h3 className="text-base font-bold text-white mb-1.5 font-heading group-hover:text-amber-400 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-xs font-semibold text-neutral-400 mb-3.5 font-heading">
                  {cert.issuer}
                </p>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  {cert.description}
                </p>
              </div>

              {/* Action link */}
              {cert.link !== "#" && (
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                  <a
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono text-neutral-400 hover:text-amber-400 transition-colors"
                  >
                    View Credential <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
