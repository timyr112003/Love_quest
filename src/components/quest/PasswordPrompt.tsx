"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ornament } from "./FloatingHearts";
import { PhotoTimer } from "./PhotoTimer";

interface PasswordPromptProps {
  title?: ReactNode;
  prompt?: ReactNode;
  placeholder?: string;
  buttonText?: string;
  onCheck: (input: string) => boolean;
  wrongText?: ReactNode;
  progressiveHints?: readonly string[];
  correctText?: ReactNode;
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  /**
   * Callback для admin-режима: начисляет произвольную сумму на баланс.
   * Вызывается при вводе "admin" и выборе суммы в модалке.
   */
  onAdminReward?: (amount: number) => void;
  children?: ReactNode;
  inputType?: "text" | "number";
  icon?: string;
  stageKey?: string;
  nextButtonText?: string;
}

/**
 * Premium-компонент ввода пароля.
 * Wine & Cream дизайн-система. Вся логика сохранена.
 *
 * Особенность: при вводе "admin" (без проверки обычного ответа)
 * открывается admin-модалка с выбором суммы выигрыша.
 */
export function PasswordPrompt({
  title,
  prompt,
  placeholder = "Введи ответ…",
  buttonText = "Проверить",
  onCheck,
  wrongText,
  progressiveHints,
  correctText,
  onSuccess,
  onReward,
  onAdminReward,
  children,
  inputType = "text",
  icon,
  stageKey,
  nextButtonText = "Далее →",
}: PasswordPromptProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const [shakeKey, setShakeKey] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [rewardAmount, setRewardAmount] = useState<number | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showHintConfirm, setShowHintConfirm] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const potentialReward = Math.max(0, 200 - attempts * 50 - hintIndex * 50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    // Перехват admin-пароля — открывает admin-модалку без проверки ответа.
    // Регистр не важен: "admin", "ADMIN", "Admin" — все работают.
    if (value.trim().toLowerCase() === "admin" && onAdminReward) {
      setShowAdminModal(true);
      return;
    }

    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    if (!value.trim()) return;
    const isCorrect = onCheck(value);
    if (isCorrect) {
      const reward = Math.max(0, 200 - attempts * 50 - hintIndex * 50);
      setRewardAmount(reward);
      if (onReward) onReward(reward);
      setStatus("correct");
    } else {
      setStatus("wrong");
      setShakeKey((k) => k + 1);
      setAttempts((a) => a + 1);
    }
  };

  const handleReset = () => { setStatus("idle"); setValue(""); };
  const handleNext = () => onSuccess();

  const canUseHint =
    progressiveHints && progressiveHints.length > 0 && attempts >= 2 && hintIndex < progressiveHints.length;

  const handleOpenHint = () => {
    if (hintIndex === 0) setShowHintConfirm(true);
    else setShowHintModal(true);
  };

  const handleConfirmHint = () => {
    setShowHintConfirm(false);
    if (progressiveHints && hintIndex < progressiveHints.length) setHintIndex((i) => i + 1);
    setShowHintModal(true);
  };

  const handleNextHint = () => {
    if (progressiveHints && hintIndex < progressiveHints.length) setShowHintConfirm(true);
  };

  const shortWrongText = (() => {
    if (wrongText) return wrongText;
    if (attempts === 1) return "Не совсем. Попробуй ещё раз.";
    return "Снова мимо. Может, стоит воспользоваться подсказкой?";
  })();

  return (
    <>
      <AnimatePresence mode="wait">
        {status === "correct" ? (
          <motion.div
            key={`correct-${stageKey}`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="romantic-card rounded-3xl p-8 md:p-12 max-w-xl w-full"
          >
            {/* Success icon — тонкий SVG круг с галочкой */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="flex justify-center mb-5"
            >
              <div
                className="flex items-center justify-center w-14 h-14 rounded-full"
                style={{
                  background: "oklch(0.38 0.1 355 / 0.06)",
                  border: "1.5px solid oklch(0.38 0.1 355 / 0.25)",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </motion.div>

            {/* Reward badge */}
            {rewardAmount !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mb-6 flex justify-center"
              >
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
                  style={{
                    background: rewardAmount > 0
                      ? "oklch(0.68 0.08 75 / 0.1)"
                      : "oklch(0.95 0.008 75)",
                    border: rewardAmount > 0
                      ? "1px solid oklch(0.68 0.08 75 / 0.25)"
                      : "1px solid oklch(0.9 0.006 60)",
                  }}
                >
                  <span className="font-ui text-sm" style={{ color: "oklch(0.68 0.08 75)" }}>◆</span>
                  <div className="flex flex-col leading-tight text-left">
                    <span className="font-ui text-[9px] uppercase tracking-[0.15em] font-semibold" style={{ color: "oklch(0.55 0.015 60)" }}>
                      {rewardAmount > 0 ? "Награда" : "Награды нет"}
                    </span>
                    <span
                      className="font-ui text-base font-bold tabular-nums"
                      style={{ color: rewardAmount > 0 ? "oklch(0.38 0.1 355)" : "oklch(0.55 0.015 60)" }}
                    >
                      {rewardAmount > 0 ? `+${rewardAmount} ₽` : "0 ₽"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {correctText && (
              <div className="font-body text-lg md:text-xl leading-relaxed whitespace-pre-line mb-7 text-left" style={{ color: "oklch(0.25 0.01 30)" }}>
                {correctText}
              </div>
            )}

            <Ornament />

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="romantic-button px-10 py-3.5 rounded-2xl text-sm md:text-base w-full"
            >
              {nextButtonText}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key={`prompt-${stageKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="romantic-card rounded-3xl p-7 md:p-10 max-w-xl w-full"
          >
            {/* Icon — тонкий, без emoji-перегруза */}
            {icon && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center text-3xl md:text-4xl mb-3"
                style={{ filter: "none" }}
              >
                {icon}
              </motion.div>
            )}

            {title && (
              <h2 className="font-display text-2xl md:text-3xl text-center mb-5 decorative-title" style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.01em" }}>
                {title}
              </h2>
            )}

            {prompt && (
              <div className="font-body text-lg md:text-xl leading-relaxed text-center mb-5 whitespace-pre-line" style={{ color: "oklch(0.3 0.01 30)" }}>
                {prompt}
              </div>
            )}

            {children}

            {/* Potential reward — subtle inline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-5 mb-3 flex justify-center"
              key={`potential-${potentialReward}`}
            >
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
                style={{
                  background: potentialReward > 0
                    ? "oklch(0.68 0.08 75 / 0.08)"
                    : "oklch(0.95 0.008 75)",
                  border: potentialReward > 0
                    ? "1px solid oklch(0.68 0.08 75 / 0.2)"
                    : "1px solid oklch(0.9 0.006 60)",
                }}
              >
                <span className="font-ui text-xs" style={{ color: "oklch(0.68 0.08 75)" }}>◆</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={potentialReward}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.25 }}
                    className="font-ui text-xs font-semibold tabular-nums"
                    style={{ color: potentialReward > 0 ? "oklch(0.5 0.06 75)" : "oklch(0.55 0.015 60)" }}
                  >
                    {potentialReward > 0 ? `За верный ответ: ${potentialReward} ₽` : "Награды больше нет"}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className={status === "wrong" ? "shake" : ""} key={shakeKey}>
                <input
                  type={inputType}
                  inputMode={inputType === "number" ? "numeric" : "text"}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (status === "wrong") setStatus("idle");
                  }}
                  placeholder={placeholder}
                  autoFocus
                  className="romantic-input w-full px-5 py-3.5 rounded-xl text-lg md:text-xl text-center"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>

              <button
                type="submit"
                disabled={!value.trim()}
                className="romantic-button w-full py-3.5 rounded-xl text-sm md:text-base"
              >
                {buttonText}
              </button>
            </form>

            <AnimatePresence>
              {status === "wrong" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{
                      background: "oklch(0.5 0.02 25 / 0.04)",
                      border: "1px solid oklch(0.5 0.02 25 / 0.1)",
                    }}
                  >
                    <div className="mb-1.5 flex justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.02 25 / 0.5)" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <div className="hint-text text-base md:text-lg whitespace-pre-line">
                      {shortWrongText}
                    </div>

                    {attempts >= 2 && (
                      <div className="mt-3 font-ui text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "oklch(0.55 0.015 60)" }}>
                        Неудачных попыток: {attempts}
                      </div>
                    )}

                    {canUseHint && (
                      <motion.button
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleOpenHint}
                        className="romantic-button-secondary px-5 py-2.5 rounded-xl text-xs md:text-sm mt-4 inline-flex items-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18h6" />
                          <path d="M10 22h4" />
                          <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
                        </svg>
                        <span>
                          {hintIndex === 0 ? "Использовать подсказку" : "Посмотреть подсказку"}
                          {hintIndex > 0 && (
                            <span className="ml-1.5 font-ui text-[10px]" style={{ color: "oklch(0.55 0.015 60)" }}>
                              {hintIndex}/{progressiveHints?.length ?? 0}
                            </span>
                          )}
                        </span>
                      </motion.button>
                    )}

                    <button
                      onClick={handleReset}
                      className="mt-3 font-ui text-xs underline decoration-dotted block w-full"
                      style={{ color: "oklch(0.38 0.1 355)" }}
                    >
                      попробовать снова
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Ornament />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка подсказки */}
      <AnimatePresence>
        {showHintModal && progressiveHints && progressiveHints.length > 0 && (
          <HintModal
            hints={progressiveHints}
            currentIndex={Math.max(0, hintIndex - 1)}
            onClose={() => setShowHintModal(false)}
            onNextHint={handleNextHint}
          />
        )}
      </AnimatePresence>

      {/* Подтверждение проверки */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <ConfirmDialog
            icon="check"
            title="Проверить ответ?"
            message={
              potentialReward > 0
                ? `Если ответ неверный — награда уменьшится на 50₽.\n\nСейчас можно получить: ${potentialReward} ₽`
                : "Если ответ неверный — награды не будет, но попробовать стоит."
            }
            confirmLabel="Проверить"
            cancelLabel="← Назад"
            onConfirm={handleConfirmSubmit}
            onCancel={() => setShowSubmitConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Подтверждение подсказки */}
      <AnimatePresence>
        {showHintConfirm && (
          <ConfirmDialog
            icon="hint"
            title="Использовать подсказку?"
            message={
              potentialReward > 50
                ? "За эту подсказку спишется 50₽ от награды.\n\nПодсказка поможет, но награда уменьшится."
                : potentialReward > 0
                ? "За эту подсказку спишется 50₽.\n\nПосле неё награды почти не останется — но ответ станет яснее."
                : "Награды уже нет, так что списывать нечего.\n\nПодсказка бесплатна — можно смотреть смело."
            }
            confirmLabel="Да, открыть"
            cancelLabel="← Назад"
            onConfirm={handleConfirmHint}
            onCancel={() => setShowHintConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Admin-модалка — выбор суммы выигрыша */}
      <AnimatePresence>
        {showAdminModal && onAdminReward && (
          <AdminDialog
            onClose={() => {
              setShowAdminModal(false);
              setValue("");
            }}
            onSelect={(amount) => {
              onAdminReward(amount);
              setShowAdminModal(false);
              setValue("");
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══ Premium AdminDialog — выбор суммы выигрыша ═══ */
function AdminDialog({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (amount: number) => void;
}) {
  const PRESETS = [100, 200, 500, 1000, 2000];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "oklch(0.18 0.01 30 / 0.5)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="romantic-card rounded-3xl p-6 md:p-8 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-3"
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "oklch(0.68 0.08 75 / 0.1)", border: "1px solid oklch(0.68 0.08 75 / 0.3)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.06 75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </motion.div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
            style={{ background: "oklch(0.68 0.08 75 / 0.1)", border: "1px solid oklch(0.68 0.08 75 / 0.25)" }}
          >
            <span className="font-ui text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "oklch(0.5 0.06 75)" }}>
              Admin
            </span>
          </div>
          <h3 className="font-display text-xl md:text-2xl mb-2" style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500 }}>
            Выбери сумму
          </h3>
          <p className="hint-text text-sm md:text-base">
            Сумма будет добавлена к балансу.
          </p>
        </div>

        <Ornament />

        {/* Preset суммы */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {PRESETS.map((amount, i) => (
            <motion.button
              key={amount}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(amount)}
              className="px-4 py-3.5 rounded-xl font-ui text-base font-semibold tabular-nums"
              style={{
                background: "oklch(0.38 0.1 355)",
                color: "oklch(0.97 0.006 75)",
                border: "1px solid oklch(0.38 0.1 355)",
                boxShadow: "0 4px 12px oklch(0.38 0.1 355 / 0.2)",
              }}
            >
              +{amount.toLocaleString("ru-RU")} ₽
            </motion.button>
          ))}
        </div>

        {/* Произвольная сумма */}
        <CustomAmountInput onSelect={onSelect} />

        <Ornament />

        <button
          onClick={onClose}
          className="romantic-button-secondary px-6 py-2.5 rounded-xl text-sm md:text-base w-full"
        >
          ← Отмена
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Кастомная сумма — input с кнопкой ═══ */
function CustomAmountInput({ onSelect }: { onSelect: (amount: number) => void }) {
  const [customValue, setCustomValue] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(customValue, 10);
    if (!isNaN(num) && num > 0) {
      onSelect(num);
    }
  };

  return (
    <form onSubmit={handleCustomSubmit} className="flex gap-2 mt-3">
      <input
        type="number"
        inputMode="numeric"
        value={customValue}
        onChange={(e) => setCustomValue(e.target.value)}
        placeholder="Своя сумма…"
        className="romantic-input flex-1 px-4 py-2.5 rounded-xl text-sm"
        style={{ textAlign: "left" }}
        min="1"
      />
      <motion.button
        type="submit"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={!customValue || parseInt(customValue, 10) <= 0}
        className="romantic-button px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
      >
        Добавить
      </motion.button>
    </form>
  );
}

/* ═══ Premium ConfirmDialog ═══ */
function ConfirmDialog({
  icon,
  title,
  message,
  confirmLabel = "Да",
  cancelLabel = "← Назад",
  onConfirm,
  onCancel,
}: {
  icon?: string;
  title: ReactNode;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "oklch(0.18 0.01 30 / 0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="romantic-card rounded-3xl p-6 md:p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-4"
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "oklch(0.38 0.1 355 / 0.06)", border: "1px solid oklch(0.38 0.1 355 / 0.2)" }}
            >
              {icon === "check" && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {icon === "hint" && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
                </svg>
              )}
            </div>
          </motion.div>
        )}

        <h3 className="font-display text-xl md:text-2xl mb-3" style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500 }}>
          {title}
        </h3>

        <div className="hint-text text-base md:text-lg leading-relaxed whitespace-pre-line mb-6">
          {message}
        </div>

        <div className="flex flex-col gap-2.5">
          <motion.button
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="romantic-button px-6 py-3 rounded-xl text-sm md:text-base w-full"
          >
            {confirmLabel}
          </motion.button>
          <button
            onClick={onCancel}
            className="romantic-button-secondary px-6 py-2.5 rounded-xl text-sm md:text-base"
          >
            {cancelLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Premium HintModal ═══ */
function HintModal({
  hints,
  currentIndex,
  onClose,
  onNextHint,
}: {
  hints: readonly string[];
  currentIndex: number;
  onClose: () => void;
  onNextHint: () => void;
}) {
  const currentHint = hints[Math.min(currentIndex, hints.length - 1)];
  const hasNextHint = currentIndex < hints.length - 1;
  const hintNumber = Math.min(currentIndex + 1, hints.length);

  const hintLabel = (() => {
    if (hintNumber === 1) return "Подсказка";
    if (hintNumber === 2) return "Ещё подсказка";
    if (hintNumber === 3) return "Подумай ещё";
    if (hintNumber === hints.length) return "Последняя подсказка";
    return `Подсказка ${hintNumber}`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "oklch(0.18 0.01 30 / 0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="romantic-card rounded-3xl p-6 md:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-3"
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "oklch(0.38 0.1 355 / 0.06)", border: "1px solid oklch(0.38 0.1 355 / 0.2)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
              </svg>
            </div>
          </motion.div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: "oklch(0.38 0.1 355 / 0.06)", border: "1px solid oklch(0.38 0.1 355 / 0.15)" }}
          >
            <span className="font-ui text-[10px] uppercase tracking-[0.12em] font-semibold" style={{ color: "oklch(0.38 0.1 355)" }}>
              {hintLabel}
            </span>
            <span className="font-ui text-[10px] tabular-nums" style={{ color: "oklch(0.55 0.015 60)" }}>
              {hintNumber} / {hints.length}
            </span>
          </div>
        </div>

        <Ornament />

        <div className="hint-text text-base md:text-lg leading-relaxed text-center whitespace-pre-line mb-5">
          {currentHint}
        </div>

        <Ornament />

        <div className="flex flex-col gap-2.5 mt-2">
          {hasNextHint ? (
            <>
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNextHint}
                className="romantic-button px-6 py-3 rounded-xl text-sm md:text-base w-full"
              >
                Нужна ещё подсказка →
              </motion.button>
              <button
                onClick={onClose}
                className="romantic-button-secondary px-6 py-2.5 rounded-xl text-sm md:text-base"
              >
                Закрыть и попробовать
              </button>
            </>
          ) : (
            <>
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="romantic-button px-6 py-3 rounded-xl text-sm md:text-base w-full"
              >
                Закрыть и попробовать
              </motion.button>
              <p className="font-ui text-xs text-center mt-1" style={{ color: "oklch(0.55 0.015 60)" }}>
                Это была последняя подсказка. Дальше — только ты.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Вспомогательные компоненты ═══ */

export function OnLocationButton({ onClick, label = "Я на месте" }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="romantic-button px-8 py-4 rounded-2xl text-sm md:text-base"
    >
      {label}
    </motion.button>
  );
}

export function RiddleBlock({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`riddle-block px-6 py-5 my-5 ${className}`}>
      <div className="font-body text-lg md:text-xl leading-relaxed italic text-center whitespace-pre-line" style={{ color: "oklch(0.3 0.01 30)" }}>
        {children}
      </div>
    </div>
  );
}

export function NextStageButton({ onClick, label = "Открыть следующую точку →" }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      whileHover={{ x: 3 }}
      onClick={onClick}
      className="romantic-button-secondary px-6 py-3 rounded-xl text-sm md:text-base mt-4"
    >
      {label}
    </motion.button>
  );
}

export function MessageScreen({
  icon, title, children, buttonText = "Далее →", onContinue, secondaryButtonText, onSecondary,
}: {
  icon?: string; title?: ReactNode; children?: ReactNode; buttonText?: string;
  onContinue: () => void; secondaryButtonText?: string; onSecondary?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="romantic-card rounded-3xl p-8 md:p-10 max-w-xl w-full text-center"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl mb-4"
        >
          {icon}
        </motion.div>
      )}

      {title && (
        <h2 className="font-display text-2xl md:text-3xl mb-4 decorative-title" style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.01em" }}>
          {title}
        </h2>
      )}

      {children && (
        <div className="font-body text-lg md:text-xl leading-relaxed space-y-3 mb-6 whitespace-pre-line text-left" style={{ color: "oklch(0.3 0.01 30)" }}>
          {children}
        </div>
      )}

      <Ornament />

      <div className="flex flex-col items-center gap-3 mt-4">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="romantic-button px-10 py-3.5 rounded-2xl text-sm md:text-base"
        >
          {buttonText}
        </motion.button>
        {secondaryButtonText && onSecondary && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSecondary}
            className="romantic-button-secondary px-6 py-2.5 rounded-xl text-sm md:text-base"
          >
            {secondaryButtonText}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/* ═══ AtLocationFlow — 4 шага в premium-стиле ═══ */
export function AtLocationFlow({
  icon, title, children, story, storyTitle, confirmPrompt, onConfirmed,
  arrivalButtonText = "Я на месте", confirmButtonText = "Да, я тут",
  photoButtonText = "Мы сделали фото",
}: {
  icon?: string; title?: ReactNode; children?: ReactNode;
  story?: readonly string[]; storyTitle?: ReactNode; confirmPrompt?: ReactNode;
  onConfirmed: () => void; arrivalButtonText?: string;
  confirmButtonText?: string; photoButtonText?: string;
}) {
  const [step, setStep] = useState<"arrive" | "confirm" | "story" | "photo">("arrive");
  const handleConfirmYes = () => setStep(story ? "story" : "photo");

  return (
    <AnimatePresence mode="wait">
      {/* arrive */}
      {step === "arrive" && (
        <motion.div
          key="arrive"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="romantic-card rounded-3xl p-8 md:p-10 max-w-xl w-full text-center"
        >
          {icon && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl mb-4"
            >
              {icon}
            </motion.div>
          )}
          {title && (
            <h2 className="font-display text-2xl md:text-3xl mb-4 decorative-title" style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.01em" }}>
              {title}
            </h2>
          )}
          {children && (
            <div className="font-body text-lg md:text-xl leading-relaxed space-y-3 mb-6 whitespace-pre-line text-left" style={{ color: "oklch(0.3 0.01 30)" }}>
              {children}
            </div>
          )}
          <Ornament />
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep("confirm")}
            className="romantic-button px-8 py-4 rounded-2xl text-sm md:text-base"
          >
            {arrivalButtonText}
          </motion.button>
        </motion.div>
      )}

      {/* confirm */}
      {step === "confirm" && (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="romantic-card rounded-3xl p-8 md:p-10 max-w-xl w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-5"
          >
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{ background: "oklch(0.38 0.1 355 / 0.06)", border: "1.5px solid oklch(0.38 0.1 355 / 0.25)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </motion.div>

          <h2 className="font-display text-2xl md:text-3xl mb-4 decorative-title" style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.01em" }}>
            Ты точно на месте?
          </h2>

          <p className="hint-text text-base md:text-lg mb-6">
            {confirmPrompt || "Прежде чем мы продолжим — убедись, что ты дошла до нужной точки."}
          </p>

          <Ornament />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirmYes}
              className="romantic-button px-8 py-3.5 rounded-2xl text-sm md:text-base"
            >
              {confirmButtonText}
            </motion.button>
            <BackButton onClick={() => setStep("arrive")} />
          </div>
        </motion.div>
      )}

      {/* story */}
      {step === "story" && story && (
        <motion.div
          key="story"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="romantic-card rounded-3xl p-8 md:p-10 max-w-2xl w-full"
        >
          {icon && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl mb-3 text-center"
            >
              {icon}
            </motion.div>
          )}
          <h2 className="font-display text-2xl md:text-3xl mb-4 text-center decorative-title" style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.01em" }}>
            {storyTitle || title}
          </h2>
          <Ornament />
          <div className="font-body text-base md:text-lg leading-relaxed space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar px-1 text-left" style={{ color: "oklch(0.3 0.01 30)" }}>
            {story.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={paragraph.startsWith("А теперь") || paragraph.startsWith("Теперь нам") || paragraph.startsWith("Но здесь") || paragraph.startsWith("Сейчас") || paragraph.startsWith("Сегодня здесь") || paragraph.startsWith("Сегодня нас") ? "accent-text font-medium" : ""}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
          <Ornament />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep("photo")}
              className="romantic-button px-10 py-3.5 rounded-2xl text-sm md:text-base"
            >
              Далее →
            </motion.button>
            <BackButton onClick={() => setStep("confirm")} />
          </div>
        </motion.div>
      )}

      {/* photo */}
      {step === "photo" && (
        <motion.div
          key="photo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="romantic-card rounded-3xl p-8 md:p-10 max-w-xl w-full text-center"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-4"
          >
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full"
              style={{ background: "oklch(0.38 0.1 355 / 0.06)", border: "1.5px solid oklch(0.38 0.1 355 / 0.25)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </motion.div>

          <h2 className="font-display text-2xl md:text-3xl mb-4 decorative-title" style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.01em" }}>
            Сделайте совместное фото
          </h2>

          <p className="font-body text-lg md:text-xl mb-3 text-left" style={{ color: "oklch(0.3 0.01 30)" }}>
            Каждый шаг этой истории стоит запомнить.
          </p>
          <p className="hint-text text-base md:text-lg mb-4">
            Найдите кого-то, кто сможет вас сфотографировать. Или сделайте селфи вдвоём. Это фото останется с вами на память.
          </p>

          <div
            className="mt-5 mb-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
            style={{ background: "oklch(0.68 0.08 75 / 0.1)", border: "1px solid oklch(0.68 0.08 75 / 0.25)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.06 75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-ui text-xs font-semibold" style={{ color: "oklch(0.5 0.06 75)" }}>
              5 минут на фото
            </span>
          </div>
          <p className="hint-text text-sm mb-2">
            Просто чтобы было чуть азартнее.
          </p>

          <PhotoTimer duration={300} />

          <Ornament />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirmed}
              className="romantic-button px-10 py-3.5 rounded-2xl text-sm md:text-base"
            >
              {photoButtonText}
            </motion.button>
            <BackButton onClick={() => setStep(story ? "story" : "confirm")} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BackButton({ onClick, label = "← Назад" }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      whileHover={{ scale: 1.02, x: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="romantic-button-secondary px-6 py-3 rounded-xl text-sm md:text-base"
    >
      {label}
    </motion.button>
  );
}
