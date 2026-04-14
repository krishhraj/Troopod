"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LOADING_STAGES, LoadingStage } from "@/types";

interface LoadingOrbProps {
  stage: LoadingStage;
}

export function LoadingOrb({ stage }: LoadingOrbProps) {
  const stageInfo = stage !== "idle" && stage !== "done" && stage !== "error"
    ? LOADING_STAGES[stage]
    : null;

  const progress = stageInfo?.progress ?? 0;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Animated orb */}
      <div className="relative w-24 h-24">
        {/* Outer glow rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-amber-500/30"
            animate={{
              scale: [1, 1.4 + i * 0.2, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Core orb */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, #f0b429, #c8941a 50%, #5c4033 100%)",
            boxShadow: "0 0 24px rgba(200,148,26,0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Shine */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.4) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Stage text */}
      <AnimatePresence mode="wait">
        {stageInfo && (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="font-serif text-lg text-walnut-500 font-medium">
              {stageInfo.label}
            </p>
            <p className="text-sm text-walnut-400 mt-1 font-sans">{stageInfo.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-walnut-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full progress-glow"
          style={{
            background: "linear-gradient(90deg, #c8941a, #f0b429)",
          }}
          initial={{ width: "5%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Stage dots */}
      <div className="flex gap-2">
        {Object.keys(LOADING_STAGES).map((s, i) => {
          const stages = Object.keys(LOADING_STAGES);
          const currentIndex = stages.indexOf(stage);
          const isDone = i <= currentIndex;
          const isCurrent = s === stage;
          return (
            <motion.div
              key={s}
              className="w-2 h-2 rounded-full"
              animate={{
                backgroundColor: isDone
                  ? isCurrent
                    ? "#c8941a"
                    : "#a67c5b"
                  : "#dec8ba",
                scale: isCurrent ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>
    </div>
  );
}
