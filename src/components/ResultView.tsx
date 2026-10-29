"use client";

import Image from "next/image";
import Link from "next/link";
import { CHAMPIONS } from "@/lib/champions";
import { useStoredResults } from "@/lib/resultStore";

const byId = new Map(CHAMPIONS.map((c) => [c.id, c]));

export function ResultView() {
  const stored = useStoredResults();

  // 서버 렌더링 / 하이드레이션 전
  if (stored === undefined) return <div className="flex-1" aria-busy="true" />;

  const results = (stored ?? []).flatMap((r) => {
    const champion = byId.get(r.id);
    return champion ? [{ ...r, champion }] : [];
  });

  if (results.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <p className="text-gold-200">아직 플레이한 기록이 없어요.</p>
        <Link
          href="/play"
          className="rounded-md bg-gold-400 px-8 py-3 font-black text-navy-950 transition hover:bg-gold-300"
        >
          게임 시작
        </Link>
      </div>
    );
  }

  const score = results.filter((r) => r.correct).length;
  const message =
    score === results.length
      ? "완벽해요! 진정한 소환사!"
      : score >= 7
        ? "대단해요! 챔피언 박사네요."
        : score >= 4
          ? "괜찮아요! 조금만 더!"
          : "다음엔 더 잘할 수 있어요!";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-8 px-4 py-12">
      <div className="text-center">
        <p className="text-gold-400">결과</p>
        <h1 className="mt-1 text-5xl font-black text-gold-300">
          {results.length}개 중 {score}개 정답
        </h1>
        <p className="mt-3 text-gold-200">{message}</p>
      </div>

      <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {results.map((r, i) => (
          <li
            key={r.id}
            className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center ${
              r.correct ? "border-emerald-500/60 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10"
            }`}
          >
            <span className="text-xs text-gold-500">#{i + 1}</span>
            <Image src={r.champion.image} alt={r.champion.name} width={64} height={64} className="rounded-md" />
            <span className="font-bold text-gold-100">{r.champion.name}</span>
            <span className={`text-sm font-semibold ${r.correct ? "text-emerald-400" : "text-red-400"}`}>
              {r.correct ? "정답" : r.answer ? `오답 (${r.answer})` : "패스"}
            </span>
            <span className="text-xs text-gold-600">힌트 {r.hintsUsed}개 사용</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Link
          href="/play"
          className="rounded-md bg-gold-400 px-8 py-3 text-lg font-black text-navy-950 transition hover:bg-gold-300"
        >
          다시 하기
        </Link>
        <Link
          href="/"
          className="rounded-md border border-gold-700/60 px-8 py-3 text-lg font-bold text-gold-200 transition hover:border-gold-400"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
