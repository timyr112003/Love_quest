"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface PhotoTimerProps {
  /** Длительность в секундах. По умолчанию 5 минут = 300 секунд. */
  duration?: number;
  /** Запускать ли таймер сразу при монтировании. По умолчанию true. */
  autoStart?: boolean;
}

/**
 * Таймер обратного отсчёта для этапа совместного фото.
 * Показывает оставшееся время в формате ММ:СС.
 * Когда остаётся меньше 60 секунд — начинает пульсировать красным.
 * Когда время вышло — показывает ненавязчивую пометку «время вышло, но
 * вы можете сделать ещё кадр» (НЕ блокирует кнопку «Мы сделали фото»).
 */
export function PhotoTimer({ duration = 300, autoStart = true }: PhotoTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isUrgent = secondsLeft > 0 && secondsLeft <= 60;
  const isDone = secondsLeft === 0;

  const togglePause = () => {
    if (isDone) return;
    setRunning((r) => !r);
  };

  const reset = () => {
    setSecondsLeft(duration);
    setRunning(true);
  };

  return (
    <div className="my-5 flex flex-col items-center gap-2">
      <div
        className={`romantic-card rounded-2xl px-6 py-3 inline-flex items-center gap-3 ${
          isUrgent ? "border-red-300" : ""
        }`}
        style={{
          borderColor: isUrgent ? "oklch(0.6 0.2 25 / 0.4)" : undefined,
        }}
      >
        <span className="text-2xl">⏱</span>
        <motion.span
          animate={
            isUrgent
              ? { scale: [1, 1.08, 1] }
              : { scale: 1 }
          }
          transition={{
            duration: 1,
            repeat: isUrgent ? Infinity : 0,
            ease: "easeInOut",
          }}
          className={`font-display text-2xl md:text-3xl font-bold tabular-nums ${
            isUrgent ? "text-red-700" : "accent-text"
          }`}
          style={{
            color: isUrgent ? "oklch(0.5 0.22 25)" : undefined,
          }}
        >
          {timeString}
        </motion.span>
        <span className="text-sm hint-text not-italic">
          {isDone
            ? "время вышло"
            : running
            ? "идёт отсчёт"
            : "на паузе"}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={togglePause}
          disabled={isDone}
          className="underline decoration-dotted accent-text disabled:opacity-40"
        >
          {running ? "пауза" : "продолжить"}
        </button>
        <span className="text-muted-foreground/40">•</span>
        <button
          onClick={reset}
          className="underline decoration-dotted accent-text"
        >
          сбросить
        </button>
      </div>

      {isDone && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="hint-text text-sm text-center max-w-xs"
        >
          Время вышло, но если хочется ещё кадр — никто не торопит. ❤️
        </motion.p>
      )}
    </div>
  );
}
