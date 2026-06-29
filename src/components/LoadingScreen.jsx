import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ onFinished }) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const duration = 1800; // 1.8 seconds loading screen
    const intervalTime = 18;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setLoading(false);
            setTimeout(() => {
              onFinished();
            }, 600); // Allow animation out
          }, 300);
          return 100;
        }
        return Math.floor(next);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinished]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center">
            {/* Logo initials */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-heading font-extrabold tracking-wider bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent mb-6 select-none"
            >
              MAM
            </motion.div>

            {/* Cinematic loading bar */}
            <div className="w-48 h-[2px] bg-neutral-900 rounded-full overflow-hidden relative mb-4">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-300"
                style={{ width: `${count}%` }}
              />
            </div>

            {/* Percentage Text */}
            <motion.div 
              className="text-neutral-400 font-mono text-sm tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {count.toString().padStart(3, '0')}%
            </motion.div>
          </div>

          {/* Cinematic corner details */}
          <div className="absolute bottom-10 left-10 text-[10px] tracking-widest font-mono text-neutral-600 select-none">
            MUHAMMADHU ANAS M
          </div>
          <div className="absolute bottom-10 right-10 text-[10px] tracking-widest font-mono text-neutral-600 select-none">
            PORTFOLIO 2026
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
