import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { portfolioData } from "../data/portfolioData";

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

export default function Contact() {
  const { socials } = portfolioData.personalInfo;

  return (
    <section
      id="contact"
      className="relative py-28 px-6 md:px-12 bg-[#050505] overflow-hidden"
    >
      {/* Decorative gradient spot */}
      <div className="absolute top-[40%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-amber-600/[0.015] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[0%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-amber-500/[0.015] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center mx-auto max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-widest font-mono text-amber-400 mb-2"
          >
            07 / Interaction
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-extrabold text-white"
          >
            Get In Touch
          </motion.h2>
        </div>

        {/* Centered details card */}
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8 md:p-10 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col items-center text-center space-y-8"
          >
            {/* Header intro */}
            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-heading font-bold text-white">
                Let's construct something unique.
              </h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
                Feel free to email me regarding freelance opportunities, full-time offers, or general project conversations.
              </p>
            </div>

            {/* Direct Details */}
            <div className="w-full space-y-6 py-6 border-y border-white/5 text-left">
              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Email</p>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${socials.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-white hover:text-amber-400 transition-colors"
                  >
                    {socials.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-amber-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Phone</p>
                  <a href={`tel:${socials.phone}`} className="text-sm font-semibold text-white hover:text-amber-400 transition-colors">
                    {socials.phone}
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Location</p>
                  <p className="text-sm font-semibold text-white">
                    {socials.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Anchor Links */}
            <div className="flex items-center justify-center gap-4">
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                aria-label="GitHub Profile"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${socials.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                aria-label="Email Me via Gmail"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
