import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export default function LoadingAnimation() {
  return (
    <div className="w-full py-4 flex justify-start">
      <div className="flex items-center gap-3.5 max-w-[88%] lg:max-w-[78%]">
        {/* Animated Avatar Icon Container */}
        <div className="relative size-7 flex items-center justify-center shrink-0">
          {/* Radar Ripple Rings */}
          {[0, 0.6, 1.2].map((delay, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-indigo-400/40 bg-indigo-500/10"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Glowing Center Badge */}
          <motion.div
            className="size-7 rounded-full bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 z-10"
            animate={{
              scale: [1, 1.08, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles size={14} />
          </motion.div>
        </div>

        {/* Shimmering Loading Text + Animated Dots */}
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium select-none">
          <motion.span
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="bg-linear-to-r from-slate-300 via-indigo-300 to-slate-400 bg-clip-text text-transparent"
          >
            ElysiumAI is thinking
          </motion.span>

          {/* Bouncing Dot Indicators */}
          <div className="flex items-center gap-1">
            {[0, 0.2, 0.4].map((delay, index) => (
              <motion.span
                key={index}
                className="size-1.5 rounded-full bg-indigo-400"
                animate={{
                  y: ["0%", "-40%", "0%"],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
