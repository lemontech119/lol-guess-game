import type { Champion } from "./champions";

export type HintId =
  | "release"
  | "region"
  | "species"
  | "gender"
  | "range"
  | "resource"
  | "cc"
  | "skins"
  | "positions"
  | "roles"
  | "damage"
  | "sustain"
  | "height"
  | "hair"
  | "dash"
  | "difficulty";

export type Hint = {
  id: HintId;
  label: string;
  icon: string;
  getValue: (c: Champion) => string;
};

// 2009년 출시 시작 기준 2년 단위 구간 (2009~2010, 2011~2012, ...)
const RELEASE_START_YEAR = 2009;
const RELEASE_STEP = 2;

function releasePeriod(date: string | null): string {
  if (!date) return "알 수 없음";
  const year = Number(date.slice(0, 4));
  if (!Number.isFinite(year)) return "알 수 없음";
  const from = RELEASE_START_YEAR + Math.floor((year - RELEASE_START_YEAR) / RELEASE_STEP) * RELEASE_STEP;
  return `${from}~${from + RELEASE_STEP - 1}년 사이`;
}

const orUnknown = (v: string | null | undefined) => (v && v.length > 0 ? v : "알 수 없음");

export const LEFT_HINTS: Hint[] = [
  {
    id: "release",
    label: "출시 시기",
    icon: "📅",
    getValue: (c) => releasePeriod(c.releaseDate),
  },
  { id: "region", label: "지역 (소속)", icon: "🗺️", getValue: (c) => orUnknown(c.region) },
  { id: "species", label: "종족", icon: "🧬", getValue: (c) => orUnknown(c.species) },
  { id: "gender", label: "성별", icon: "⚧️", getValue: (c) => orUnknown(c.gender) },
  {
    id: "range",
    label: "사거리 타입",
    icon: "🏹",
    getValue: (c) => `${c.rangeType} (기본 사거리 ${c.attackRange})`,
  },
  { id: "resource", label: "자원 종류", icon: "💧", getValue: (c) => c.resource },
  {
    id: "dash",
    label: "돌진기 / 이동기",
    icon: "💨",
    getValue: (c) =>
      c.dashSkills.length ? `${c.dashSkills.length}개 (${c.dashSkills.join(", ")})` : "없음",
  },
  {
    id: "height",
    label: "키 (대략)",
    icon: "📏",
    getValue: (c) => (c.heightRange ? `${c.heightRange}${c.heightRange.includes("~") ? " 사이" : ""}` : "알 수 없음"),
  },
];

export const RIGHT_HINTS: Hint[] = [
  {
    id: "cc",
    label: "CC기 보유 스킬 수",
    icon: "🌀",
    getValue: (c) => `Q·W·E·R 중 ${c.ccCount}개`,
  },
  { id: "skins", label: "스킨 개수", icon: "👗", getValue: (c) => `${c.skinCount}개` },
  {
    id: "positions",
    label: "주요 라인",
    icon: "🧭",
    getValue: (c) => (c.positions.length ? c.positions.join(", ") : "알 수 없음"),
  },
  { id: "roles", label: "역할군", icon: "⚔️", getValue: (c) => c.roles.join(", ") },
  { id: "damage", label: "피해 유형", icon: "💥", getValue: (c) => orUnknown(c.damageType) },
  {
    id: "difficulty",
    label: "Riot 공식 난이도",
    icon: "🎯",
    getValue: (c) => (c.difficulty > 0 ? `${c.difficulty} / 10` : "알 수 없음"),
  },
  { id: "hair", label: "머리색 (기본 스킨)", icon: "💇", getValue: (c) => orUnknown(c.hairColor) },
  {
    id: "sustain",
    label: "쉴드 / 회복",
    icon: "🛡️",
    getValue: (c) =>
      c.hasShield && c.hasHeal
        ? "쉴드·회복 모두 있음"
        : c.hasShield
          ? "쉴드만 있음"
          : c.hasHeal
            ? "회복만 있음"
            : "둘 다 없음",
  },
];

export const ALL_HINTS: Hint[] = [...LEFT_HINTS, ...RIGHT_HINTS];
