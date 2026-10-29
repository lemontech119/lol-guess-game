"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnswerInput } from "./AnswerInput";
import { MAX_HINTS, ROUND_SIZE, pickRandomChampions, type Champion } from "@/lib/champions";
import { ALL_HINTS, LEFT_HINTS, RIGHT_HINTS, type Hint, type HintId } from "@/lib/hints";
import { isCorrectAnswer } from "@/lib/match";
import { saveResults, useIsClient } from "@/lib/resultStore";

type Result = {
  champion: Champion;
  answer: string | null;
  correct: boolean;
  hintsUsed: number;
};

// 랜덤 출제는 클라이언트에서만 해야 하이드레이션 불일치가 생기지 않음
export function Game() {
  const isClient = useIsClient();
  if (!isClient) {
    return <div className="flex-1" aria-busy="true" />;
  }
  return <Round />;
}

function Round() {
  const router = useRouter();
  const [queue] = useState<Champion[]>(() => pickRandomChampions(ROUND_SIZE));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState<HintId[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  const current = queue[index];
  const currentResult = results[index];
  const answered = currentResult !== undefined;
  const score = results.filter((r) => r.correct).length;

  function reveal(id: HintId) {
    if (answered || revealed.includes(id) || revealed.length >= MAX_HINTS) return;
    setRevealed((r) => [...r, id]);
  }

  function answer(input: string | null) {
    if (!current || answered) return;
    setResults((r) => [
      ...r,
      {
        champion: current,
        answer: input,
        correct: input !== null && isCorrectAnswer(input, current),
        hintsUsed: revealed.length,
      },
    ]);
  }

  function next() {
    if (index + 1 >= queue.length) {
      saveResults(
        results.map((r) => ({
          id: r.champion.id,
          answer: r.answer,
          correct: r.correct,
          hintsUsed: r.hintsUsed,
        })),
      );
      router.push("/result");
      return;
    }
    setIndex((i) => i + 1);
    setRevealed([]);
  }

  const remaining = MAX_HINTS - revealed.length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xl font-black tracking-tight text-gold-300 hover:text-gold-200">
          롤 챔피언 맞추기
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <ProgressDots total={queue.length} index={index} results={results} />
          <span className="rounded-full border border-gold-700/60 px-3 py-1 text-gold-200">
            {index + 1} / {queue.length} · 정답 {score}
          </span>
        </div>
      </header>

      <section className="flex flex-col items-center gap-4 rounded-xl border border-gold-800/50 bg-navy-900/70 p-4 sm:gap-5 sm:p-5">
        <ChampionPortrait champion={current} result={currentResult} />

        <div className="w-full">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-gold-200">공개된 힌트</span>
            <span className={remaining === 0 ? "text-red-400" : "text-gold-400"}>
              남은 힌트 {remaining} / {MAX_HINTS}
            </span>
          </div>
          {revealed.length === 0 && (
            <p className="py-2 text-center text-sm text-gold-600 sm:hidden">아래에서 힌트를 골라보세요</p>
          )}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {Array.from({ length: MAX_HINTS }, (_, i) => {
              const hint = ALL_HINTS.find((h) => h.id === revealed[i]);
              return hint ? (
                <div
                  key={hint.id}
                  className="animate-pop min-h-16 rounded-lg border border-gold-500/50 bg-gold-400/10 px-3 py-2.5"
                >
                  <div className="break-keep text-xs text-gold-400">
                    {hint.icon} {hint.label}
                  </div>
                  <div className="mt-0.5 break-keep font-semibold text-gold-50">{hint.getValue(current)}</div>
                </div>
              ) : (
                <div
                  key={`empty-${i}`}
                  className="hidden min-h-16 items-center justify-center rounded-lg border border-dashed border-gold-800/60 px-3 py-2.5 text-sm text-gold-800 sm:flex"
                >
                  힌트 {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-[1fr_minmax(320px,1.2fr)_1fr]">
        <HintPanel
          title="힌트 A"
          hints={LEFT_HINTS}
          champion={current}
          revealed={revealed}
          limitReached={remaining === 0}
          answered={answered}
          onReveal={reveal}
          className="order-2 lg:order-1"
        />

        <div className="order-1 col-span-2 flex flex-col justify-center rounded-xl border border-gold-800/50 bg-navy-900/70 p-5 lg:order-2 lg:col-span-1">
          {answered ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className={`text-2xl font-black ${currentResult.correct ? "text-emerald-400" : "text-red-400"}`}>
                {currentResult.correct ? "정답!" : currentResult.answer ? "오답" : "패스"}
              </p>
              {!currentResult.correct && currentResult.answer && (
                <p className="text-sm text-gold-500">입력: {currentResult.answer}</p>
              )}
              <button
                type="button"
                autoFocus
                onClick={next}
                className="w-full rounded-md bg-gold-400 px-5 py-3 font-bold text-navy-950 transition hover:bg-gold-300"
              >
                {index + 1 >= queue.length ? "결과 보기" : "다음 챔피언"}
              </button>
            </div>
          ) : (
            <AnswerInput disabled={answered} onSubmit={answer} onSkip={() => answer(null)} />
          )}
        </div>

        <HintPanel
          title="힌트 B"
          hints={RIGHT_HINTS}
          champion={current}
          revealed={revealed}
          limitReached={remaining === 0}
          answered={answered}
          onReveal={reveal}
          className="order-3"
        />
      </section>
    </div>
  );
}

function ChampionPortrait({ champion, result }: { champion: Champion; result?: Result }) {
  if (!result) {
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold-600 bg-navy-950 text-4xl font-black text-gold-600 shadow-inner sm:h-28 sm:w-28 sm:text-5xl">
        ?
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <Image
        src={champion.image}
        alt={champion.name}
        width={128}
        height={128}
        className={`animate-pop h-24 w-24 rounded-full border-2 sm:h-32 sm:w-32 ${result.correct ? "border-emerald-400" : "border-red-400"}`}
      />
      <div className="text-center">
        <p className="text-2xl font-black text-gold-100">{champion.name}</p>
        <p className="text-sm text-gold-400">{champion.title}</p>
      </div>
    </div>
  );
}

function ProgressDots({ total, index, results }: { total: number; index: number; results: Result[] }) {
  return (
    <div className="hidden gap-1.5 sm:flex">
      {Array.from({ length: total }, (_, i) => {
        const r = results[i];
        const color = r
          ? r.correct
            ? "bg-emerald-400"
            : "bg-red-400"
          : i === index
            ? "bg-gold-300"
            : "bg-gold-800";
        return <span key={i} className={`h-2.5 w-2.5 rounded-full ${color}`} />;
      })}
    </div>
  );
}

function HintPanel({
  title,
  hints,
  champion,
  revealed,
  limitReached,
  answered,
  onReveal,
  className = "",
}: {
  title: string;
  hints: Hint[];
  champion: Champion;
  revealed: HintId[];
  limitReached: boolean;
  answered: boolean;
  onReveal: (id: HintId) => void;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-gold-800/50 bg-navy-900/70 p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-gold-200">{title}</h3>
      <div className="flex flex-col gap-2">
        {hints.map((h) => {
          const isOpen = revealed.includes(h.id);
          const disabled = isOpen || answered || limitReached;
          return (
            <button
              key={h.id}
              type="button"
              disabled={disabled}
              onClick={() => onReveal(h.id)}
              className={`flex flex-col break-keep rounded-md border px-3 py-2 text-left text-sm transition ${
                isOpen
                  ? "border-gold-400/70 bg-gold-400/15 text-gold-100"
                  : answered
                    ? "border-gold-800/40 bg-navy-950/60 text-gold-500"
                    : "border-gold-800/60 bg-navy-950 text-gold-200 hover:border-gold-400 hover:bg-gold-400/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gold-800/60 disabled:hover:bg-navy-950"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span>
                  {h.icon} {h.label}
                </span>
                {isOpen && !answered && <span className="text-xs text-gold-400">✓</span>}
              </span>
              {answered && <span className="mt-0.5 text-xs font-semibold">{h.getValue(champion)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
