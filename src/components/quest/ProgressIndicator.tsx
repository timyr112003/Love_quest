"use client";

import { STAGE_ORDER, type Stage } from "@/lib/quest-config";
import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  currentStage: Stage;
}

/**
 * Тонкий прогресс-индикатор — точки с золотыми переходами.
 * Wine для текущей, золото для пройденной, серый для будущей.
 */
export function ProgressIndicator({ currentStage }: ProgressIndicatorProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  const locations = [
    { id: 1, stages: ["loc1_riddle", "loc1_at"] },
    { id: 2, stages: ["loc2_riddle", "loc2_at"] },
    { id: 3, stages: ["loc3_riddle", "loc3_at"] },
    { id: 4, stages: ["loc4_riddle", "loc4_at"] },
    { id: 5, stages: ["loc5_riddle", "loc5_at"] },
    { id: 6, stages: ["loc6_riddle", "loc6_gift", "loc6_envelope"] },
  ];

  if (currentStage === "intro" || currentStage === "finale") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="fixed top-3 left-1/2 -translate-x-1/2 md:top-4 z-40"
    >
      <div
        className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full"
        style={{
          background: "oklch(1 0 0 / 0.85)",
          backdropFilter: "blur(16px) saturate(1.3)",
          WebkitBackdropFilter: "blur(16px) saturate(1.3)",
          border: "1px solid oklch(0.92 0.006 60)",
          boxShadow: "0 4px 12px oklch(0.3 0.02 30 / 0.08)",
        }}
      >
        {locations.map((loc, idx) => {
          const firstStage = STAGE_ORDER.indexOf(loc.stages[0] as Stage);
          const lastStage = STAGE_ORDER.indexOf(loc.stages[loc.stages.length - 1] as Stage);
          const isCompleted = currentIndex > lastStage;
          const isActive = currentIndex >= firstStage && currentIndex <= lastStage;

          return (
            <div key={loc.id} className="flex items-center">
              <motion.div
                animate={{ scale: isActive ? 1.5 : 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`progress-dot ${isActive ? "active" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
              />
              {idx < locations.length - 1 && (
                <div
                  className="w-3 md:w-4 h-px mx-0.5 transition-all duration-500"
                  style={{
                    background: isCompleted
                      ? "oklch(0.68 0.08 75)"
                      : "oklch(0.9 0.006 60)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
