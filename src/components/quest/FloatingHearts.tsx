"use client";

import { useMemo } from "react";

interface FloatingHeartsProps {
  count?: number;
}

/**
 * Тонкая фоновая анимация — едва заметные точки и лепестки.
 * Premium-стиль: минимальная визуальная нагрузка.
 */
export function FloatingHearts({ count = 10 }: FloatingHeartsProps) {
  const petals = useMemo(() => {
    const symbols = ["·", "·", "·", "✦", "·"];
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 137.508;
      const left = (seed % 100);
      const size = 0.4 + ((seed * 0.13) % 0.5);
      const duration = 26 + ((seed * 0.7) % 16);
      const delay = (seed * 0.3) % 26;
      const drift = ((seed * 1.7) % 120) - 60;
      const symbol = symbols[i % symbols.length];
      return { left, size, duration, delay, drift, symbol, id: i };
    });
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {petals.map((p) => (
        <span
          key={p.id}
          className="fall-petal"
          style={
            {
              left: `${p.left}%`,
              "--size": `${p.size}rem`,
              "--duration": `${p.duration}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${p.drift}px`,
              color: p.symbol === "✦"
                ? "oklch(0.68 0.08 75 / 0.4)"
                : "oklch(0.55 0.015 60 / 0.3)",
            } as React.CSSProperties
          }
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}

/**
 * Тонкий разделитель — точка между линиями.
 */
export function Ornament({ symbol = "·" }: { symbol?: string }) {
  return (
    <div className="ornament my-6">
      <span
        className="text-xs"
        style={{ color: "oklch(0.68 0.08 75 / 0.5)" }}
      >
        {symbol}
      </span>
    </div>
  );
}

/**
 * Едва заметные мерцающие точки — subtle premium.
 */
export function Sparkles({ count = 4 }: { count?: number }) {
  const sparks = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: 10 + ((i * 37) % 80),
      left: 10 + ((i * 53) % 80),
      delay: (i * 1.1) % 5,
      size: 0.4 + ((i * 0.2) % 0.4),
    }));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 0 }}
    >
      {sparks.map((s) => (
        <span
          key={s.id}
          className="twinkle absolute"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            fontSize: `${s.size}rem`,
            animationDelay: `${s.delay}s`,
            color: "oklch(0.68 0.08 75 / 0.4)",
          }}
        >
          ·
        </span>
      ))}
    </div>
  );
}
