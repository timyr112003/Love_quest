"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * ═══ ГЕЙМИФИКАЦИЯ: БАЛАНС ═══
 *
 * Правила начисления:
 * - Стартовый баланс за загадку: 200₽
 * - Минус 50₽ за каждую неудачную попытку
 * - Минус 50₽ за каждую использованную подсказку
 * - Минимум — 0₽ (в минус не уходим)
 *
 * Примеры:
 *   - Верно с 1-й попытки, 0 подсказок: 200₽
 *   - Верно со 2-й попытки, 0 подсказок: 150₽
 *   - Верно с 3-й попытки, 1 подсказка: 50₽
 *   - Верно с 5-й попытки: 0₽
 *
 * Баланс сохраняется в localStorage.
 * Если пользователь уже получил награду за загадку — повторно не выдаём.
 */

const BALANCE_KEY = "quest-balance-v1";
const AWARDED_KEY = "quest-awarded-v1";

/** Максимальная награда за загадку */
export const MAX_REWARD = 200;
/** Штраф за каждую неудачную попытку */
export const PENALTY_PER_ATTEMPT = 50;
/** Штраф за каждую подсказку */
export const PENALTY_PER_HINT = 50;

/**
 * Считает награду за загадку на основе количества неудач и подсказок.
 * Не уходит в минус.
 */
export function calculateReward(
  failedAttempts: number,
  hintsUsed: number
): number {
  const reward =
    MAX_REWARD -
    failedAttempts * PENALTY_PER_ATTEMPT -
    hintsUsed * PENALTY_PER_HINT;
  return Math.max(0, reward);
}

/**
 * Хук для управления балансом.
 * Возвращает текущий баланс, функцию начисления награды и проверку,
 * выдавалась ли уже награда за конкретную загадку.
 */
export function useBalance() {
  // Ленивая инициализация из localStorage — работает только на клиенте.
  // На сервере (SSR) возвращает 0, что нормально — баланс всё равно
  // скрывается до hydrated.
  const [balance, setBalance] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const saved = localStorage.getItem(BALANCE_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [awarded, setAwarded] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(AWARDED_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [hydrated, setHydrated] = useState(false);
  const restoreDone = useRef(true); // уже восстановлено через ленивую инициализацию

  // Помечаем, что компонент смонтирован.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Сохранение в localStorage при изменении balance/awarded.
  useEffect(() => {
    try {
      localStorage.setItem(BALANCE_KEY, String(balance));
      localStorage.setItem(AWARDED_KEY, JSON.stringify(awarded));
    } catch {
      // игнорируем
    }
  }, [balance, awarded]);

  /**
   * Начисляет награду за загадку.
   * Если за эту загадку уже начисляли — не делает ничего (возвращает 0).
   * Возвращает сумму, которая была начислена.
   */
  const award = useCallback(
    (stageId: string, amount: number): number => {
      if (awarded[stageId] !== undefined) return 0;
      setAwarded((prev) => ({ ...prev, [stageId]: amount }));
      setBalance((prev) => prev + amount);
      return amount;
    },
    [awarded]
  );

  /** Проверяет, выдавалась ли уже награда за загадку */
  const isAwarded = useCallback(
    (stageId: string): boolean => awarded[stageId] !== undefined,
    [awarded]
  );

  /** Возвращает сумму, выданную за конкретную загадку (или undefined) */
  const getAwardedAmount = useCallback(
    (stageId: string): number | undefined => awarded[stageId],
    [awarded]
  );

  /** Полный сброс баланса */
  const reset = useCallback(() => {
    setBalance(0);
    setAwarded({});
    try {
      localStorage.removeItem(BALANCE_KEY);
      localStorage.removeItem(AWARDED_KEY);
    } catch {
      // игнорируем
    }
  }, []);

  return {
    balance,
    award,
    isAwarded,
    getAwardedAmount,
    reset,
    hydrated,
  };
}
