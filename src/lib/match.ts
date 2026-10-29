import type { Champion } from "./champions";

const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

export function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s'.&·\-]/g, "");
}

function toChoseong(s: string): string {
  return [...s]
    .map((ch) => {
      const code = ch.charCodeAt(0) - 0xac00;
      return code >= 0 && code <= 11171 ? CHOSEONG[Math.floor(code / 588)] : ch;
    })
    .join("");
}

const isChoseongOnly = (s: string) => /^[ㄱ-ㅎ]+$/.test(s);

export function isCorrectAnswer(input: string, champ: Champion): boolean {
  const q = normalize(input);
  if (!q) return false;
  return [champ.name, champ.nameEn, champ.id].some((n) => normalize(n) === q);
}

export function searchChampions(input: string, champions: Champion[], limit = 6): Champion[] {
  const q = normalize(input);
  if (!q) return [];
  const scored: { c: Champion; score: number }[] = [];
  for (const c of champions) {
    const ko = normalize(c.name);
    const en = normalize(c.nameEn);
    let score = -1;
    if (ko === q || en === q) score = 0;
    else if (ko.startsWith(q) || en.startsWith(q)) score = 1;
    else if (ko.includes(q) || en.includes(q)) score = 2;
    else if (isChoseongOnly(q) && toChoseong(ko).startsWith(q)) score = 3;
    if (score >= 0) scored.push({ c, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.c.name.localeCompare(b.c.name, "ko"))
    .slice(0, limit)
    .map((x) => x.c);
}
