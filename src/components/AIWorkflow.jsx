import { motion } from "framer-motion";
import { Zap, Code, ShieldCheck, FileText } from "lucide-react";
import { portfolioData } from "../data/portfolioData";

export default function AIWorkflow() {
  const { description, cards } = portfolioData.aiWorkflow;

  const cardIcons = [
    <Zap key="zap" className="w-6 h-6 text-amber-400" />,
    <Code key="code" className="w-6 h-6 text-amber-500" />,
    <ShieldCheck key="shield" className="w-6 h-6 text-yellow-500" />,
    <FileText key="file" className="w-6 h-6 text-amber-300" />
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: custom * 0.1, ease: [0.16, 1, 0.3, 1] }
    })
  };

  return (
    <section
      id="ai-workflow"
      className="relative py-28 px-6 md:px-12 bg-[#050505] overflow-hidden"
    >
      {/* Glow overlays */}
      <div className="absolute top-[30%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-600/[0.015] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/[0.015] blur-[110px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-widest font-mono text-amber-400 mb-2"
          >
            05 / Methodology
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold text-white mb-6"
          >
            How AI Enhances My Development
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-neutral-400 leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="glass-card p-8 rounded-2xl border border-white/5 relative group overflow-hidden"
            >
              {/* Decorative side line hover highlight */}
              <span className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-amber-400 to-amber-500 scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-500" />
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 group-hover:border-amber-500/20 group-hover:bg-amber-500/5 transition-all">
                  {cardIcons[index % cardIcons.length]}
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-white mb-2.5 transition-colors group-hover:text-amber-400">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Acceleration quote tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center max-w-2xl mx-auto p-6 rounded-xl border border-white/5 bg-white/[0.01]"
        >
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-2">
            Development philosophy
          </span>
          <p className="text-xs md:text-sm font-medium text-neutral-300 italic">
            "By integrating AI as an advanced companion, I accelerate tedious development loops, freeing up energy to focus on superior visual execution, custom styling details, and system logic."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
