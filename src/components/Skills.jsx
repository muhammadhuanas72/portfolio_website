import { motion } from "framer-motion";
import { Terminal, Layout, Cpu, Settings } from "lucide-react";
import { portfolioData } from "../data/portfolioData";

export default function Skills() {
  const { categories } = portfolioData.skills;

  const getCategoryIcon = (id) => {
    switch (id) {
      case "frontend":
        return <Layout className="w-6 h-6 text-amber-400" />;
      case "programming":
        return <Terminal className="w-6 h-6 text-amber-500" />;
      case "ai-dev":
        return <Cpu className="w-6 h-6 text-yellow-500" />;
      case "tools":
        return <Settings className="w-6 h-6 text-amber-300" />;
      default:
        return <Terminal className="w-6 h-6 text-neutral-400" />;
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section
      id="skills"
      className="relative py-28 px-6 md:px-12 bg-[#050505] overflow-hidden"
    >
      {/* Glow decorations */}
      <div className="absolute top-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-600/[0.015] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/[0.015] blur-[110px] pointer-events-none" />

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
            02 / Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold text-white"
          >
            Core Skill Matrix
          </motion.h2>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              className="glass-card p-8 rounded-2xl border border-white/5 flex flex-col justify-between"
            >
              {/* Category Title */}
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                    {getCategoryIcon(category.id)}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-heading font-bold text-white">
                      {category.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Skills Tags Grid */}
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {category.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-2 text-xs md:text-sm font-mono text-neutral-300 hover:text-amber-200 bg-[#0d0d12]/60 border border-white/5 hover:border-amber-500/20 rounded-xl transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_15px_rgba(212,175,55,0.05)] cursor-default select-none"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
