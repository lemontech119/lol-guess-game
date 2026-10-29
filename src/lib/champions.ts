import data from "@/data/champions.json";

export type Champion = {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  image: string;
  releaseDate: string | null;
  releasePatch: string | null;
  region: string | null;
  species: string | null;
  gender: string | null;
  rangeType: string;
  attackRange: number;
  resource: string;
  ccCount: number;
  hairColor: string | null;
  heightRange: string | null;
  dashSkills: string[];
  difficulty: number;
  hasShield: boolean;
  hasHeal: boolean;
  skinCount: number;
  positions: string[];
  roles: string[];
  damageType: string | null;
};

export const DATA_VERSION: string = data.version;
export const CHAMPIONS: Champion[] = data.champions as Champion[];

export const ROUND_SIZE = 10;
export const MAX_HINTS = 8;

export function pickRandomChampions(count: number): Champion[] {
  const pool = [...CHAMPIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
