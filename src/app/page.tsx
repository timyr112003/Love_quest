"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QUEST_CONFIG,
  STAGE_ORDER,
  checkAnswer,
  type Stage,
  STORAGE_KEY,
} from "@/lib/quest-config";
import { useBalance } from "@/lib/useBalance";
import { FloatingHearts, Ornament, Sparkles } from "@/components/quest/FloatingHearts";
import {
  PasswordPrompt,
  RiddleBlock,
  MessageScreen,
  AtLocationFlow,
} from "@/components/quest/PasswordPrompt";
import { ProgressIndicator } from "@/components/quest/ProgressIndicator";
import { BalanceIndicator } from "@/components/quest/BalanceIndicator";

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [hydrated, setHydrated] = useState(false);
  // Флаг: восстановление завершено. Используем ref, чтобы избежать
  // промежуточного сохранения "intro" поверх сохранённого прогресса.
  const restoreDone = useRef(false);
  const { balance, award, reset: resetBalance } = useBalance();

  // Восстанавливаем прогресс из localStorage при загрузке.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && STAGE_ORDER.includes(saved as Stage)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStage(saved as Stage);
      }
    } catch {
      // localStorage недоступен
    }
    restoreDone.current = true;
    setHydrated(true);
  }, []);

  // Сохраняем прогресс при смене этапа — только если восстановление завершено.
  useEffect(() => {
    if (!restoreDone.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, stage);
    } catch {
      // игнорируем
    }
  }, [stage]);

  // Синхронизация между вкладками: если в другой вкладке изменили
  // прогресс — обновляем и в этой. Полезно, если квест проходят
  // одновременно на телефоне и компьютере.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && STAGE_ORDER.includes(e.newValue as Stage)) {
        setStage(e.newValue as Stage);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const goTo = (next: Stage) => setStage(next);

  // Создаёт callback для начисления награды за конкретную загадку.
  // Если за эту загадку уже давали награду — повторно не начислит.
  const handleReward = (stageId: string) => (amount: number) => {
    award(stageId, amount);
  };

  // Admin-функция: начисляет произвольную сумму на баланс.
  // Использует специальный stageId "admin", чтобы не конфликтовать
  // с обычными наградами. Может вызываться многократно.
  const handleAdminReward = (amount: number) => {
    award(`admin-${Date.now()}`, amount);
  };

  const resetQuest = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Точно начать квест заново? Весь прогресс и баланс будут сброшены.")
    ) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // игнорируем
      }
      resetBalance();
      setStage("intro");
    }
  };

  // Баланс скрыт на intro и finale
  const showBalance = hydrated && stage !== "intro" && stage !== "finale";

  return (
    <main className="quest-bg min-h-screen relative overflow-x-hidden">
      <FloatingHearts count={16} />
      <ProgressIndicator currentStage={stage} />
      <BalanceIndicator balance={balance} hidden={!showBalance} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-16 pt-20 md:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="w-full flex flex-col items-center"
          >
            {stage === "intro" && <IntroStage onStart={() => goTo("days")} />}

            {stage === "days" && (
              <DaysStage
                onSuccess={() => goTo("loc1_riddle")}
                onReward={handleReward("days")}
      onAdminReward={handleAdminReward}
                stageKey="days"
              />
            )}

            {stage === "loc1_riddle" && (
              <Loc1RiddleStage
                onSuccess={() => goTo("loc1_at")}
                onReward={handleReward("bolshoi")}
      onAdminReward={handleAdminReward}
                stageKey="loc1_riddle"
              />
            )}

            {stage === "loc1_at" && (
              <Loc1AtStage
                onSuccess={() => goTo("loc2_riddle")}
                onReward={handleReward("columns")}
      onAdminReward={handleAdminReward}
                stageKey="loc1_at"
              />
            )}

            {stage === "loc2_riddle" && (
              <Loc2RiddleStage
                onSuccess={() => goTo("loc2_at")}
                onReward={handleReward("redSquare")}
      onAdminReward={handleAdminReward}
                stageKey="loc2_riddle"
              />
            )}

            {stage === "loc2_at" && (
              <Loc2AtStage
                onSuccess={() => goTo("loc3_riddle")}
                onReward={handleReward("minin")}
      onAdminReward={handleAdminReward}
                stageKey="loc2_at"
              />
            )}

            {stage === "loc3_riddle" && (
              <Loc3RiddleStage
                onSuccess={() => goTo("loc3_at")}
                onReward={handleReward("zaryadye")}
      onAdminReward={handleAdminReward}
                stageKey="loc3_riddle"
              />
            )}

            {stage === "loc3_at" && (
              <Loc3AtStage
                onSuccess={() => goTo("loc4_riddle")}
                onReward={handleReward("candy")}
      onAdminReward={handleAdminReward}
                stageKey="loc3_at"
              />
            )}

            {stage === "loc4_riddle" && (
              <Loc4RiddleStage
                onSuccess={() => goTo("loc4_at")}
                onReward={handleReward("alexGarden")}
      onAdminReward={handleAdminReward}
                stageKey="loc4_riddle"
              />
            )}

            {stage === "loc4_at" && (
              <Loc4AtStage
                onSuccess={() => goTo("loc5_riddle")}
                onReward={handleReward("paper")}
      onAdminReward={handleAdminReward}
                stageKey="loc4_at"
              />
            )}

            {stage === "loc5_riddle" && (
              <Loc5RiddleStage
                onSuccess={() => goTo("loc5_at")}
                onReward={handleReward("arbat")}
      onAdminReward={handleAdminReward}
                stageKey="loc5_riddle"
              />
            )}

            {stage === "loc5_at" && (
              <Loc5AtStage
                onSuccess={() => goTo("loc6_riddle")}
                stageKey="loc5_at"
              />
            )}

            {stage === "loc6_riddle" && (
              <Loc6RiddleStage
                onSuccess={() => goTo("loc6_gift")}
                onReward={handleReward("patriarch")}
      onAdminReward={handleAdminReward}
                stageKey="loc6_riddle"
              />
            )}

            {stage === "loc6_gift" && (
              <Loc6GiftStage
                onSuccess={() => goTo("loc6_envelope")}
                stageKey="loc6_gift"
              />
            )}

            {stage === "loc6_envelope" && (
              <Loc6EnvelopeStage
                onSuccess={() => goTo("finale")}
                onReward={handleReward("final")}
      onAdminReward={handleAdminReward}
                stageKey="loc6_envelope"
              />
            )}

            {stage === "finale" && <FinaleStage onRestart={resetQuest} balance={balance} />}
          </motion.div>
        </AnimatePresence>

        {/* Тонкая ссылка для сброса прогресса — внизу страницы */}
        {hydrated && stage !== "intro" && stage !== "finale" && (
          <button
            onClick={resetQuest}
            className="mt-12 text-xs text-muted-foreground/60 hover:text-muted-foreground underline decoration-dotted transition-colors"
          >
            начать заново
          </button>
        )}
      </div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: INTRO — Начальная страница
 * ═══════════════════════════════════════════════════════════════ */
function IntroStage({ onStart }: { onStart: () => void }) {
  return (
    <div className="romantic-card rounded-[1.75rem] p-8 md:p-12 max-w-2xl w-full relative overflow-hidden">
      <Sparkles count={4} />

      {/* Тонкий SVG outline-сердце вместо emoji */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center mb-5"
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-4xl md:text-5xl text-center mb-2"
        style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.02em" }}
      >
        Наша история
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mb-8"
      >
        <span className="font-ui text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "oklch(0.55 0.015 60)" }}>
          18 сентября 2026
        </span>
      </motion.div>

      <Ornament />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="font-body text-lg md:text-xl leading-relaxed space-y-4 mb-8"
        style={{ color: "oklch(0.25 0.01 30)" }}
      >
        <p className="text-xl md:text-2xl accent-text font-medium">Сегодня твой день.</p>
        <p>Но в этот раз я решил подарить тебе нечто немного необычное.</p>
        <p>Не коробку, которую можно открыть за несколько секунд. Не букет, который однажды завянет.</p>
        <p>А один день, который мы проживём вместе.</p>
        <p>Сегодня Москва станет нашей игрой. Тебя ждут места, загадки, маленькие секреты и подарки.</p>
        <p className="hint-text">
          Иногда ответ будет прямо перед глазами. Иногда — спрятан в словах. А иногда тебе придётся немного мне довериться.
        </p>
      </motion.div>

      {/* Главное правило — left-border callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="riddle-block mb-4"
      >
        <div className="font-ui text-[10px] uppercase tracking-[0.15em] font-semibold mb-1.5" style={{ color: "oklch(0.38 0.1 355)" }}>
          Главное правило
        </div>
        <p className="hint-text text-base md:text-lg">
          Не пытайся узнать следующий шаг заранее. Просто иди вперёд. А я позабочусь о том, чтобы тебе было интересно дойти до конца.
        </p>
      </motion.div>

      {/* Блок о балансе */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="riddle-block mb-8"
        style={{ borderLeftColor: "oklch(0.68 0.08 75 / 0.5)" }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-ui text-sm" style={{ color: "oklch(0.68 0.08 75)" }}>◆</span>
          <span className="font-ui text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "oklch(0.5 0.06 75)" }}>
            Один важный нюанс
          </span>
        </div>
        <div className="font-body text-base md:text-lg leading-relaxed space-y-2" style={{ color: "oklch(0.3 0.01 30)" }}>
          <p>
            За каждую разгаданную загадку ты будешь получать <span className="accent-text font-semibold">награду</span> — в специальной валюте этого квеста.
          </p>
          <p>
            Чем быстрее догадаешься — тем больше получишь. Каждая неудачная попытка и каждая подсказка немного уменьшают награду.
          </p>
          <p className="accent-text font-semibold">
            Этот баланс можно будет потратить в самом конце квеста.
          </p>
          <p className="hint-text text-sm md:text-base">
            На что именно — пока секрет. Скажу только, что оно того стоит.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="romantic-button px-12 py-4 rounded-2xl text-base md:text-lg"
        >
          Открыть историю
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: ПАРОЛЬ №1 — 759 дней
 * ═══════════════════════════════════════════════════════════════ */
function DaysStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  return (
    <PasswordPrompt
      stageKey={stageKey}
      icon="🔐"
      title="ПЕРВЫЙ ПАРОЛЬ"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Введи число…"
      inputType="number"
      prompt={
        <>
          <p className="mb-3">С чего всё началось?</p>
          <p className="font-display text-3xl md:text-4xl accent-text font-semibold">
            20.08.2024
          </p>
          <p className="my-3 text-base md:text-lg">
            Есть даты, которые просто остаются в календаре.
          </p>
          <p className="text-base md:text-lg">
            А есть даты, после которых всё становится немного другим.
          </p>
          <p className="mt-3">
            Для нас такой датой стало{" "}
            <span className="accent-text font-semibold">20 августа 2024 года</span>.
          </p>
          <p className="mt-4">
            Сегодня —{" "}
            <span className="font-display text-2xl md:text-3xl accent-text font-semibold">
              18.09.2026
            </span>
          </p>
          <p className="mt-3 text-base md:text-lg">Прошло немало времени.</p>
        </>
      }
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.daysAccepted)}
      wrongText={
        "Не торопись…\n\n20.08.2024 → 18.09.2026\n\nПопробуй посчитать ещё раз."
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.days}
      correctText={
        "759 🔓\n\n759 дней.\n\nИменно столько дней прошло с того момента, когда началась наша история.\n\nНо сегодня я предлагаю тебе написать ещё несколько её страниц.\n\nИ первая из них уже ждёт тебя."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <p className="font-body text-base md:text-lg text-center mb-3 hint-text">
        И первая загадка очень простая:
        <br />
        <span className="accent-text font-semibold not-italic">
          Сколько дней прошло с того момента, как началась наша история?
        </span>
      </p>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: ЛОКАЦИЯ №1 — Большой театр (загадка)
 * ═══════════════════════════════════════════════════════════════ */
function Loc1RiddleStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  return (
    <PasswordPrompt
      stageKey={stageKey}
      icon="📍"
      title="ТОЧКА №1"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Что это за место?…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.bolshoiAccepted)}
      wrongText={"Посмотри на подсказки ещё раз. Четыре лошади, колесница, истории…"}
      progressiveHints={QUEST_CONFIG.progressiveHints.bolshoi}
      correctText={
        "БОЛЬШОЙ ТЕАТР 🎭\n\nТы нашла первую точку.\n\nТеперь отправляйся туда.\n\nНо дальше сайт тебе не поможет.\n\nСледующий пароль спрятан не в интернете, а прямо перед тобой."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <RiddleBlock>
        {`В Москве есть место,
где каждый вечер оживают истории.

Здесь люди приходят смотреть на любовь,
встречать героев, переживать за них
и на несколько часов забывать
о собственном мире.

Сегодня одна история начнётся там.

Перед зданием стоит тот,
кто смотрит на город сверху.

Он едет на колеснице,
которую несут четыре лошади.

Что это за место?`}
      </RiddleBlock>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: НА МЕСТЕ — Большой театр (8 колонн)
 * ═══════════════════════════════════════════════════════════════ */
function Loc1AtStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  const [atPlace, setAtPlace] = useState(false);

  if (!atPlace) {
    return (
      <AtLocationFlow
        icon="🎭"
        title="БОЛЬШОЙ ТЕАТР"
        storyTitle="Большой театр"
        story={QUEST_CONFIG.stories.bolshoi}
        confirmPrompt={
          <>
            Ты перед фасадом с восемью колоннами и квадригой Аполлона над входом?
            <br />
            Если да — я расскажу тебе немного об этом месте.
          </>
        }
        onConfirmed={() => setAtPlace(true)}
      >
        <p>Ты нашла первую точку.</p>
        <p>Теперь отправляйся туда.</p>
        <p className="hint-text">Но дальше сайт тебе не поможет.</p>
        <p className="accent-text font-semibold">
          Следующий пароль спрятан не в интернете, а прямо перед тобой.
        </p>
      </AtLocationFlow>
    );
  }

  return (
    <PasswordPrompt
      stageKey={`${stageKey}-at`}
      icon="🏛️"
      title="Перед фасадом"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Что ты насчитала?…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.columnsAccepted)}
      wrongText={
        "Ты близко.\n\nИх действительно восемь.\n\nНо мне нужно не количество.\n\nЧто именно ты насчитала?\n\nПосмотри на фасад ещё раз."
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.columns}
      correctText={
        "КОЛОННЫ 🔓\n\nПервый секрет найден.\n\nТеперь отправляйся туда, где Москва хранит одни из самых известных страниц своей истории."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <div className="font-body text-lg md:text-xl leading-relaxed text-center mb-4 space-y-3">
        <p>Ты на месте.</p>
        <p>Теперь просто посмотри на здание.</p>
        <p className="hint-text">Не спеши.</p>
        <p className="hint-text">
          Иногда самые очевидные вещи мы замечаем последними.
        </p>
        <p>
          Найди{" "}
          <span className="accent-text font-semibold">
            восемь одинаковых элементов
          </span>{" "}
          на главном фасаде.
        </p>
        <p>
          Их ровно <span className="font-display text-3xl accent-text font-bold">восемь</span>.
        </p>
      </div>
      <div className="riddle-block rounded-xl px-5 py-4 my-4">
        <p className="hint-text">
          Тебе нужно не число. Назови то, чего ты насчитала восемь.
        </p>
      </div>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: ЛОКАЦИЯ №2 — Красная площадь (загадка)
 * ═══════════════════════════════════════════════════════════════ */
function Loc2RiddleStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  return (
    <PasswordPrompt
      stageKey={stageKey}
      icon="📍"
      title="ТОЧКА №2"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Что это за место?…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.redSquareAccepted)}
      wrongText={
        "Посмотри на подсказки ещё раз:\n\n🧱 древние стены\n🌈 разноцветные купола\n🛍️ торговые ряды\n\nГде всё это находится вместе?"
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.redSquare}
      correctText={
        "КРАСНАЯ ПЛОЩАДЬ 🔓\n\nТы снова там, где нужно.\n\nНо теперь тебе придётся найти человека."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <RiddleBlock>
        {`Здесь проходили торжества,
торговали, встречали правителей
и становились свидетелями событий,
которые меняли историю.

Сегодня вокруг тебя:

🧱 древние стены;
🌈 разноцветные купола;
🛍️ знаменитые торговые ряды.

Что это за место?`}
      </RiddleBlock>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: НА МЕСТЕ — Красная площадь (Минин)
 * ═══════════════════════════════════════════════════════════════ */
function Loc2AtStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  const [atPlace, setAtPlace] = useState(false);

  if (!atPlace) {
    return (
      <AtLocationFlow
        icon="❤"
        title="КРАСНАЯ ПЛОЩАДЬ"
        storyTitle="Красная площадь"
        story={QUEST_CONFIG.stories.redSquare}
        confirmPrompt={
          <>
            Ты стоишь на брусчатке, а вокруг — древние стены, разноцветные купола и торговые ряды?
            <br />
            Если да — я расскажу тебе немного об этом месте.
          </>
        }
        onConfirmed={() => setAtPlace(true)}
      >
        <p>Ты снова там, где нужно.</p>
        <p className="accent-text font-semibold">
          Но теперь тебе придётся найти человека.
        </p>
      </AtLocationFlow>
    );
  }

  return (
    <PasswordPrompt
      stageKey={`${stageKey}-at`}
      icon="🗿"
      title="Найди их"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Введи имя…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.mininAccepted)}
      wrongText={
        "Посмотри внимательнее.\n\nИх двое.\n\nОдин — князь.\nДругой — человек, который повёл за собой народ.\n\nКак зовут того, кто стоит впереди и протягивает руку?"
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.minin}
      correctText={
        "МИНИН 🔓\n\nТы нашла правильное имя.\n\nА теперь отправляйся туда, где современная Москва встретилась с историей."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <RiddleBlock>
        {`Перед тобой двое.

Они стоят вместе уже много лет
и навсегда вошли в историю Москвы.

Один из них — князь.

Другой — человек,
который повёл за собой народ.

Посмотри на того,
кто стоит впереди и протягивает руку.

Как его зовут?

Его имя станет следующим паролем.`}
      </RiddleBlock>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: ЛОКАЦИЯ №3 — Зарядье (загадка)
 * ═══════════════════════════════════════════════════════════════ */
function Loc3RiddleStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  return (
    <PasswordPrompt
      stageKey={stageKey}
      icon="📍"
      title="ТОЧКА №3"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Что это за место?…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.zaryadyeAccepted)}
      wrongText={
        "Вспомни:\n\n🏙️ место бывшей гостиницы\n🌳 современный парк\n🌉 мост, который «парит»\n\nЧто это?"
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.zaryadye}
      correctText={
        "ЗАРЯДЬЕ 🌿 🔓\n\nТы нашла следующую точку.\n\nНо на этот раз тебе не придётся искать пароль на здании."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <RiddleBlock>
        {`Когда-то здесь стояло здание,
которое знала вся Москва.

Сегодня его больше нет.

На его месте появилось пространство,
где можно за одну прогулку
увидеть разные уголки России.

А ещё здесь есть место,
которое выглядит как мост,
но не ведёт через реку.

Он будто завис над городом.

Что это за место?`}
      </RiddleBlock>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: НА МЕСТЕ — Зарядье (секретная жвачка)
 * ═══════════════════════════════════════════════════════════════ */
function Loc3AtStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  const [atPlace, setAtPlace] = useState(false);
  const [candyOpened, setCandyOpened] = useState(false);

  if (!atPlace) {
    return (
      <AtLocationFlow
        icon="🌿"
        title="ЗАРЯДЬЕ"
        storyTitle="Зарядье"
        story={QUEST_CONFIG.stories.zaryadye}
        confirmPrompt={
          <>
            Ты в парке Зарядье, рядом с Парящим мостом над Москвой-рекой?
            <br />
            Если да — я расскажу тебе немного об этом месте.
          </>
        }
        onConfirmed={() => setAtPlace(true)}
      >
        <p>Ты нашла следующую точку.</p>
        <p className="accent-text font-semibold">
          Но на этот раз тебе не придётся искать пароль на здании.
        </p>
      </AtLocationFlow>
    );
  }

  if (!candyOpened) {
    return (
      <MessageScreen
        icon="🍬"
        title="Найди меня"
        buttonText="Открыл жвачку"
        onContinue={() => setCandyOpened(true)}
      >
        <p>На этот раз найди меня.</p>
        <p>У меня для тебя несколько маленьких подарков.</p>
        <p>На первый взгляд они будут совершенно одинаковыми.</p>
        <p>
          Но одна жвачка{" "}
          <span className="accent-text font-semibold">отличается от остальных</span>.
        </p>
        <p>Посмотри внимательно на фантики.</p>
        <p className="accent-text font-semibold">
          Найди ту, которая выделяется.
        </p>
        <p>Открой именно её.</p>
        <p className="hint-text">
          Внутри тебя ждёт следующий пароль.
        </p>
      </MessageScreen>
    );
  }

  return (
    <PasswordPrompt
      stageKey={`${stageKey}-at`}
      icon="🍬"
      title="Пароль найден"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Слово из фантика…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.candyAccepted)}
      wrongText={
        "Кажется, эта жвачка не хочет тебя отпускать. 🍬\n\nПосмотри на неё ещё раз.\n\nФантик отличается от остальных."
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.candy}
      correctText={
        "🔓 ПАРОЛЬ ПРИНЯТ\n\nИногда самые маленькие вещи могут хранить самые большие секреты.\n\nОтлично.\n\nТы снова разгадала всё сама.\n\nТеперь впереди место, где можно на несколько минут спрятаться от шума города, оставаясь в самом его центре."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <div className="font-body text-lg md:text-xl leading-relaxed text-center mb-4 space-y-3">
        <p>Ты нашла секретную жвачку.</p>
        <p className="hint-text">
          Иногда самые маленькие вещи могут хранить самые большие секреты.
        </p>
        <p className="accent-text font-semibold">
          Введи пароль, который был спрятан внутри.
        </p>
      </div>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: ЛОКАЦИЯ №4 — Александровский сад (загадка)
 * ═══════════════════════════════════════════════════════════════ */
function Loc4RiddleStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  return (
    <PasswordPrompt
      stageKey={stageKey}
      icon="📍"
      title="ТОЧКА №4"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Что это за место?…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.alexGardenAccepted)}
      wrongText={
        "Древние стены.\n\nЦентр Москвы.\n\nВечный огонь.\n\nВ каком месте всё это находится?"
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.alexGarden}
      correctText={
        "АЛЕКСАНДРОВСКИЙ САД 🌳 🔓\n\nТы нашла следующую точку.\n\nНо на этот раз подсказка будет не на экране."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <RiddleBlock>
        {`Здесь можно гулять среди деревьев
буквально в самом сердце Москвы.

За ними возвышаются древние стены.

Но тебе нужен не Кремль.

Найди огонь, который никогда не должен погаснуть.

Он горит в память о тех,
чьи имена знает не каждый,
но чью память знает вся страна.

Что это за место?`}
      </RiddleBlock>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: НА МЕСТЕ — Александровский сад (бумажка с акростихом АРБАТ)
 * ═══════════════════════════════════════════════════════════════ */
function Loc4AtStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  const [atPlace, setAtPlace] = useState(false);
  const [showPaper, setShowPaper] = useState(false);

  if (!atPlace) {
    return (
      <AtLocationFlow
        icon="🌳"
        title="АЛЕКСАНДРОВСКИЙ САД"
        storyTitle="Александровский сад"
        story={QUEST_CONFIG.stories.alexGarden}
        confirmPrompt={
          <>
            Ты в Александровском саду, у стен Кремля, недалеко от Вечного огня?
            <br />
            Если да — я расскажу тебе немного об этом месте.
          </>
        }
        onConfirmed={() => setAtPlace(true)}
      >
        <p>Ты нашла следующую точку.</p>
        <p className="accent-text font-semibold">
          Но на этот раз подсказка будет не на экране.
        </p>
      </AtLocationFlow>
    );
  }

  if (!showPaper) {
    return (
      <MessageScreen
        icon="✉️"
        title="Найди меня"
        buttonText="Прочитал бумажку"
        onContinue={() => setShowPaper(true)}
      >
        <p>Найди меня.</p>
        <p>Я приготовил для тебя одну маленькую бумажку.</p>
        <p>Возьми её. И внимательно прочитай.</p>
        <p className="accent-text font-semibold">
          В ней спрятан следующий пароль.
        </p>
      </MessageScreen>
    );
  }

  return (
    <PasswordPrompt
      stageKey={`${stageKey}-at`}
      icon="✉️"
      title="Прочитай бумажку"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Слово с бумажки…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.paperAccepted)}
      wrongText={
        "Кажется, ответ спрятался чуть лучше, чем я рассчитывал. ❤️\n\nПрочитай бумажку ещё раз — внимательно, с самого начала."
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.paper}
      correctText={
        "ВМЕСТЕ 🔓\n\nИногда подсказка оказывается не в том, что написано, а в том, как это написано.\n\nТеперь отправляйся туда, где Москва становится немного свободнее, громче и романтичнее."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <div className="font-body text-lg md:text-xl leading-relaxed text-center mb-3 space-y-2">
        <p className="accent-text font-semibold">
          Прочитай бумажку внимательно. Ответ спрятан в ней.
        </p>
      </div>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: ЛОКАЦИЯ №5 — Арбат (загадка)
 * ═══════════════════════════════════════════════════════════════ */
function Loc5RiddleStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  return (
    <PasswordPrompt
      stageKey={stageKey}
      icon="📍"
      title="ТОЧКА №5"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Что это за место?…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.arbatAccepted)}
      wrongText={
        "Вспомни:\n\n🎸 улица музыки и искусства\n🎨 история и случайные встречи\n🚶‍♀️ одна из самых известных улиц Москвы\n\nЧто это?"
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.arbat}
      correctText={
        "АРБАТ 🎸 🔓\n\nТы нашла следующую точку.\n\nНо сегодня мне интересно не то, чем знаменит Арбат.\n\nА то, что произойдёт на нём с нами."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <RiddleBlock>
        {`Следующая точка —
одна из самых известных улиц Москвы.

Здесь встречаются музыка, искусство,
история и тысячи случайных встреч.

Что это за место?`}
      </RiddleBlock>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: НА МЕСТЕ — Арбат (подарок без пароля)
 * ═══════════════════════════════════════════════════════════════ */
function Loc5AtStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  const [atPlace, setAtPlace] = useState(false);
  const [giftClaimed, setGiftClaimed] = useState(false);

  if (!atPlace) {
    return (
      <AtLocationFlow
        icon="🎸"
        title="АРБАТ"
        storyTitle="Арбат"
        story={QUEST_CONFIG.stories.arbat}
        confirmPrompt={
          <>
            Ты на пешеходной улице Арбат — где музыканты, художники и стёртые камни под ногами?
            <br />
            Если да — я расскажу тебе немного об этом месте.
          </>
        }
        onConfirmed={() => setAtPlace(true)}
      >
        <p>Ты дошла.</p>
        <p>Остановись на минуту. Посмотри вокруг.</p>
        <p>
          Ты уже прошла несколько точек, разгадала несколько паролей и нашла
          больше подсказок, чем могла ожидать.
        </p>
        <p className="accent-text font-semibold">
          Но этот этап я не хочу превращать в загадку.
        </p>
      </AtLocationFlow>
    );
  }

  if (!giftClaimed) {
    return (
      <MessageScreen
        icon="🎁"
        title="Подарок"
        buttonText="🎁 Забрать подарок"
        onContinue={() => setGiftClaimed(true)}
      >
        <p>Сегодня у тебя день рождения.</p>
        <p>И поэтому здесь я хочу просто сделать тебе подарок.</p>
        <p className="font-display text-xl md:text-2xl accent-text font-semibold">
          Без условий.
          <br />
          Без пароля.
          <br />
          Без следующего задания.
        </p>
        <p className="hint-text">Просто потому что ты — ты. ❤️</p>
      </MessageScreen>
    );
  }

  return (
    <MessageScreen
      icon="❤️"
      title="Подарок у тебя"
      buttonText="Далее →"
      onContinue={onSuccess}
    >
      <p>🎁 Подарок получен.</p>
      <p>Отложи подарок ненадолго.</p>
      <p className="accent-text font-semibold">
        Потому что квест ещё не закончен.
      </p>
    </MessageScreen>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: ЛОКАЦИЯ №6 — Патриаршие пруды (загадка)
 * ═══════════════════════════════════════════════════════════════ */
function Loc6RiddleStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  return (
    <PasswordPrompt
      stageKey={stageKey}
      icon="📍"
      title="ТОЧКА №6"
      buttonText="ПРОВЕРИТЬ"
      placeholder="Что это за место?…"
      onCheck={(v) => checkAnswer(v, QUEST_CONFIG.patriarchAccepted)}
      wrongText={
        "Вспомни:\n\n💧 несколько прудов в прошлом\n📖 знаменитый московский роман\n😈 загадочный гость Москвы\n\nПопробуй ещё раз."
      }
      progressiveHints={QUEST_CONFIG.progressiveHints.patriarch}
      correctText={
        "ПАТРИАРШИЕ ПРУДЫ 🌙 🔓\n\nТы нашла следующую точку.\n\nОтправляйся туда.\n\nЯ буду ждать тебя.\n\nИ на этот раз тебя ждёт не только загадка."
      }
      onSuccess={onSuccess}
      onReward={onReward}
      onAdminReward={onAdminReward}
    >
      <RiddleBlock>
        {`Следующее место связано
с одной из самых известных
московских историй.

Когда-то здесь было несколько прудов.

Сегодня остался только один.

Здесь однажды началась история
о любви, свободе,
загадочном незнакомце
и Москве, которая оказалась
совсем не такой простой, как кажется.

Что это за место?`}
      </RiddleBlock>
    </PasswordPrompt>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: НА МЕСТЕ — Патриаршие пруды (потребовать подарок)
 * ═══════════════════════════════════════════════════════════════ */
function Loc6GiftStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  const [atPlace, setAtPlace] = useState(false);

  if (!atPlace) {
    return (
      <AtLocationFlow
        icon="🌙"
        title="ПАТРИАРШИЕ ПРУДЫ"
        storyTitle="Патриаршие пруды"
        story={QUEST_CONFIG.stories.patriarch}
        confirmPrompt={
          <>
            Ты у пруда, где когда-то Берлиоз встретил Воланда?
            <br />
            Если да — я расскажу тебе немного об этом месте.
          </>
        }
        onConfirmed={() => setAtPlace(true)}
      >
        <p>Ты нашла следующую точку.</p>
        <p>Отправляйся туда.</p>
        <p>Я буду ждать тебя.</p>
        <p className="accent-text font-semibold">
          И на этот раз тебя ждёт кое-что особенное.
        </p>
      </AtLocationFlow>
    );
  }

  return (
    <MessageScreen
      icon="✉️"
      title="Конверт"
      buttonText="Открыть конверт"
      onContinue={onSuccess}
    >
      <p>Ты дошла.</p>
      <p>И я приготовил для тебя кое-что.</p>
      <p className="accent-text font-semibold">
        Открой конверт.
      </p>
      <p className="hint-text">
        Внутри — последнее сообщение этого квеста.
      </p>
    </MessageScreen>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: КОНВЕРТ — финальная загадка
 * ═══════════════════════════════════════════════════════════════ */
function Loc6EnvelopeStage({
  onSuccess,
  onReward,
  onAdminReward,
  stageKey,
}: {
  onSuccess: () => void;
  onReward?: (amount: number) => void;
  onAdminReward?: (amount: number) => void;
  stageKey: string;
}) {
  return (
    <MessageScreen
      icon="✉️"
      title="Конверт"
      buttonText="Далее →"
      onContinue={onSuccess}
    >
      <div className="font-body text-lg md:text-xl leading-relaxed text-center mb-4 space-y-3">
        <p>Это последнее сообщение этого квеста.</p>
        <p className="hint-text">Читай внимательно. Не торопись.</p>
      </div>

      {/* Конверт с текстом */}
      <div className="riddle-block rounded-2xl px-6 py-6 my-5 relative">
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-display"
          style={{
            background: "oklch(1 0.003 75 / 0.9)",
            backdropFilter: "blur(8px)",
            border: "1px solid oklch(0.7 0.12 75 / 0.3)",
            color: "oklch(0.42 0.14 355)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          ✉️ Конверт
        </div>
        <div className="font-body text-base md:text-lg leading-relaxed italic text-center whitespace-pre-line mt-2">
          {QUEST_CONFIG.finalRiddleText.join("\n")}
        </div>
      </div>
    </MessageScreen>
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  ЭТАП: ФИНАЛ — с выбором, на что потратить баланс
 * ═══════════════════════════════════════════════════════════════ */

const SPEND_OPTIONS = [
  "Кафе / бар",
  "Ресторан",
  "Прогулка по воде",
  "Катамараны",
  "Кино",
  "Кофе + сладкое",
  "Антикафе",
  "Дальнейшая прогулка",
  "Бильярд",
  "Боулинг",
  "Музеи / выставки",
  "Стендап",
  "Зоопарк",
  "Планетарий",
  "Другое",
] as const;

function FinaleStage({
  onRestart,
  balance,
}: {
  onRestart: () => void;
  balance: number;
}) {
  const [phase, setPhase] = useState<"intro" | "choose" | "done">("intro");
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    setSelected((prev) => {
      if (prev.includes(option)) {
        return prev.filter((o) => o !== option);
      }
      if (prev.length >= 3) return prev; // максимум 3
      return [...prev, option];
    });
  };

  /* ─── Фаза 1: приветственный экран финала ─── */
  if (phase === "intro") {
    return (
      <div className="romantic-card rounded-[1.75rem] p-8 md:p-12 max-w-2xl w-full relative overflow-hidden text-center">
        <Sparkles count={5} />

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-5"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="heartbeat">
            <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-4"
        >
          <span className="font-ui text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "oklch(0.55 0.015 60)" }}>
            Финал
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-3xl md:text-4xl mb-6"
          style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.02em" }}
        >
          Квест пройден
        </motion.h1>

        <Ornament />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-lg md:text-xl leading-relaxed space-y-4 mb-8 text-left"
          style={{ color: "oklch(0.25 0.01 30)" }}
        >
          {QUEST_CONFIG.finaleText.map((line, i) => (
            <p key={i}>{line || "\u00A0"}</p>
          ))}
        </motion.div>

        {/* Баланс */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex justify-center"
        >
          <div
            className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{
              background: "oklch(0.68 0.08 75 / 0.1)",
              border: "1px solid oklch(0.68 0.08 75 / 0.25)",
            }}
          >
            <span className="font-ui text-lg" style={{ color: "oklch(0.68 0.08 75)" }}>◆</span>
            <div className="flex flex-col leading-tight text-left">
              <span className="font-ui text-[10px] uppercase tracking-[0.15em] font-semibold" style={{ color: "oklch(0.55 0.015 60)" }}>
                Твой баланс
              </span>
              <span className="font-ui text-2xl font-bold tabular-nums" style={{ color: "oklch(0.38 0.1 355)" }}>
                {balance.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPhase("choose")}
            className="romantic-button px-10 py-4 rounded-2xl text-base md:text-lg"
          >
            Потратить баланс
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ─── Фаза 2: выбор вариантов ─── */
  if (phase === "choose") {
    return (
      <div className="romantic-card rounded-[1.75rem] p-7 md:p-10 max-w-2xl w-full relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-center mb-2">
            <span className="font-ui text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "oklch(0.55 0.015 60)" }}>
              На что потратить
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-center mb-2 decorative-title" style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.01em" }}>
            Выбери до трёх вариантов
          </h2>
          <p className="hint-text text-center text-base md:text-lg mb-5">
            Что вам хочется сделать прямо сейчас — на твой баланс.
          </p>

          {/* Счётчик выбора */}
          <div className="flex justify-center mb-5">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: selected.length > 0
                  ? "oklch(0.38 0.1 355 / 0.06)"
                  : "oklch(0.95 0.008 75)",
                border: selected.length > 0
                  ? "1px solid oklch(0.38 0.1 355 / 0.15)"
                  : "1px solid oklch(0.9 0.006 60)",
              }}
            >
              <span className="font-ui text-xs" style={{ color: "oklch(0.68 0.08 75)" }}>◆</span>
              <span className="font-ui text-xs font-semibold tabular-nums" style={{ color: "oklch(0.38 0.1 355)" }}>
                Выбрано: {selected.length} / 3
              </span>
            </div>
          </div>

          {/* Сетка вариантов */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-6">
            {SPEND_OPTIONS.map((option, i) => {
              const isSelected = selected.includes(option);
              const isDisabled = !isSelected && selected.length >= 3;
              return (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={!isDisabled ? { scale: 1.03 } : undefined}
                  whileTap={!isDisabled ? { scale: 0.97 } : undefined}
                  onClick={() => !isDisabled && toggleOption(option)}
                  disabled={isDisabled}
                  className="px-4 py-3 rounded-xl text-sm md:text-base font-body text-center transition-all"
                  style={{
                    background: isSelected
                      ? "oklch(0.38 0.1 355)"
                      : isDisabled
                      ? "oklch(0.95 0.008 75)"
                      : "oklch(1 0 0)",
                    color: isSelected
                      ? "oklch(0.97 0.006 75)"
                      : isDisabled
                      ? "oklch(0.7 0.01 60)"
                      : "oklch(0.3 0.01 30)",
                    border: isSelected
                      ? "1px solid oklch(0.38 0.1 355)"
                      : isDisabled
                      ? "1px solid oklch(0.9 0.006 60)"
                      : "1px solid oklch(0.9 0.006 60)",
                    boxShadow: isSelected
                      ? "0 4px 12px oklch(0.38 0.1 355 / 0.2)"
                      : "var(--shadow-sm)",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>

          <Ornament />

          <div className="flex flex-col items-center gap-3 mt-4">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase("done")}
              disabled={selected.length === 0}
              className="romantic-button px-10 py-3.5 rounded-2xl text-sm md:text-base w-full"
            >
              {selected.length === 0 ? "Выбери хотя бы один вариант" : "Подтвердить выбор"}
            </motion.button>
            <button
              onClick={() => setPhase("intro")}
              className="romantic-button-secondary px-6 py-2.5 rounded-xl text-sm md:text-base"
            >
              ← Назад
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── Фаза 3: финальный экран с выбором ─── */
  return (
    <div className="romantic-card rounded-[1.75rem] p-8 md:p-12 max-w-2xl w-full relative overflow-hidden text-center">
      <Sparkles count={6} />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center mb-5"
      >
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="heartbeat">
          <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-3"
      >
        <span className="font-ui text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "oklch(0.55 0.015 60)" }}>
          Наш вечер
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-3xl md:text-4xl mb-6"
        style={{ color: "oklch(0.18 0.01 30)", fontWeight: 500, letterSpacing: "-0.02em" }}
      >
        Поздравляю
      </motion.h1>

      <Ornament />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="font-body text-lg md:text-xl leading-relaxed mb-6 text-left"
        style={{ color: "oklch(0.25 0.01 30)" }}
      >
        <p className="mb-4">
          Ты прошла весь квест. Каждую загадку. Каждую точку. Каждый пароль.
        </p>
        <p className="mb-4">
          Ты заработала <span className="accent-text font-semibold">{balance.toLocaleString("ru-RU")} ₽</span> — и теперь можешь потратить их на то, что выбрала:
        </p>
      </motion.div>

      {/* Выбранные варианты */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap justify-center gap-2.5 mb-6"
      >
        {selected.map((option, i) => (
          <motion.div
            key={option}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: "oklch(0.38 0.1 355 / 0.06)",
              border: "1px solid oklch(0.38 0.1 355 / 0.2)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.38 0.1 355)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-ui text-sm font-semibold" style={{ color: "oklch(0.38 0.1 355)" }}>
              {option}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <Ornament />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6"
      >
        <p className="font-display text-xl md:text-2xl mb-2" style={{ color: "oklch(0.38 0.1 355)", fontWeight: 500 }}>
          С днём рождения.
        </p>
        <p className="font-body text-lg md:text-xl italic" style={{ color: "oklch(0.5 0.06 75)" }}>
          Я люблю тебя.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 1.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="romantic-button-secondary px-6 py-3 rounded-xl text-sm md:text-base"
        >
          Прочитать ещё раз
        </motion.button>
      </motion.div>
    </div>
  );
}
