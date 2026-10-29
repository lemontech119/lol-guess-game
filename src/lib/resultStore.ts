"use client";

import { useSyncExternalStore } from "react";

// 게임(/play) → 결과(/result) 로 점수를 넘기기 위한 sessionStorage 저장소
export type StoredResult = {
  id: string;
  answer: string | null;
  correct: boolean;
  hintsUsed: number;
};

const KEY = "lol-quiz-result";
const EVENT = "lol-quiz-result-change";

export function saveResults(results: StoredResult[]) {
  sessionStorage.setItem(KEY, JSON.stringify(results));
  window.dispatchEvent(new Event(EVENT));
}

export function clearResults() {
  sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

const getSnapshot = () => sessionStorage.getItem(KEY);
const getServerSnapshot = () => undefined;

/** undefined: 서버/하이드레이션 전, null: 저장된 결과 없음 */
export function useStoredResults(): StoredResult[] | null | undefined {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as StoredResult[];
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
