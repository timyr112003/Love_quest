"use client";

import { motion, AnimatePresence } from "framer-motion";

interface BalanceIndicatorProps {
  balance: number;
  hidden?: boolean;
}

/**
 * Premium-индикатор баланса — компактный glass-pill вверху справа.
 * ◆ символ вместо emoji, Inter шрифт, wine цвет.
 */
export function BalanceIndicator({
  balance,
  hidden = false,
}: BalanceIndicatorProps) {
  if (hidden) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed top-3 right-3 md:top-4 md:right-4 z-40"
    >
      <div
        className="flex items-center gap-2.5 px-4 py-2 md:px-5 md:py-2.5 rounded-full"
        style={{
          background: "oklch(1 0 0 / 0.85)",
          backdropFilter: "blur(16px) saturate(1.3)",
          WebkitBackdropFilter: "blur(16px) saturate(1.3)",
          border: "1px solid oklch(0.92 0.006 60)",
          boxShadow: "0 4px 12px oklch(0.3 0.02 30 / 0.08)",
        }}
      >
        <motion.span
          key={balance}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-ui text-sm md:text-base"
          style={{ color: "oklch(0.68 0.08 75)" }}
        >
          ◆
        </motion.span>
        <div className="flex flex-col leading-none">
          <span
            className="font-ui text-[9px] uppercase tracking-[0.15em] font-semibold"
            style={{ color: "oklch(0.55 0.015 60)" }}
          >
            Баланс
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={balance}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="font-ui text-base md:text-lg font-bold tabular-nums"
              style={{ color: "oklch(0.38 0.1 355)" }}
            >
              {balance.toLocaleString("ru-RU")} ₽
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
