// 챔피언 데이터 수집 스크립트
// 출처: Riot Data Dragon, Riot Universe, League of Legends Wiki (CC BY-SA)
// 실행: npm run fetch-data
import { writeFile, readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve("src/data");
const WIKI_API = "https://wiki.leagueoflegends.com/en-us/api.php";

const FACTIONS = {
  "bandle-city": "밴들 시티",
  bilgewater: "빌지워터",
  demacia: "데마시아",
  freljord: "프렐요드",
  ionia: "아이오니아",
  ixtal: "이쉬탈",
  noxus: "녹서스",
  piltover: "필트오버",
  "shadow-isles": "그림자 군도",
  shurima: "슈리마",
  "mount-targon": "타곤",
  void: "공허",
  zaun: "자운",
  unaffiliated: "무소속",
};

const POSITIONS = {
  Top: "탑",
  Jungle: "정글",
  Middle: "미드",
  Bottom: "원딜",
  Support: "서포터",
};

const ROLES = {
  Fighter: "전사",
  Tank: "탱커",
  Mage: "마법사",
  Assassin: "암살자",
  Marksman: "원거리 딜러",
  Support: "서포터",
};

const DAMAGE_TYPES = {
  Physical: "AD (물리)",
  Magic: "AP (마법)",
  Mixed: "혼합",
};

const CC_KEYWORDS = [
  "기절",
  "둔화",
  "속박",
  "공중에 띄",
  "공중으로 띄",
  "공중에 떠",
  "띄워",
  "띄웁",
  "에어본",
  "밀어",
  "밀쳐",
  "넉백",
  "끌어당",
  "끌어와",
  "끌고",
  "침묵",
  "공포",
  "도발",
  "매혹",
  "홀립",
  "홀린",
  "수면",
  "잠들",
  "변이",
  "제압",
  "무장 해제",
  "실명",
  "지면에 고정",
  "이동 불가",
  "억류",
];

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function getText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function parseWikiData(lua) {
  const result = {};
  const blocks = lua.split(/\n  \["/).slice(1);
  for (const block of blocks) {
    const wikiName = block.slice(0, block.indexOf('"'));
    const field = (name) => {
      const m = block.match(new RegExp(`\\["${name}"\\]\\s*=\\s*"([^"]*)"`));
      return m ? m[1] : null;
    };
    const list = (name) => {
      const m = block.match(new RegExp(`\\["${name}"\\]\\s*=\\s*\\{([^}]*)\\}`));
      return m ? [...m[1].matchAll(/"([^"]*)"/g)].map((x) => x[1]) : [];
    };
    const apiname = field("apiname");
    if (!apiname || result[apiname]) continue;
    result[apiname] = {
      wikiName,
      date: field("date"),
      patch: field("patch"),
      rangetype: field("rangetype"),
      adaptivetype: field("adaptivetype"),
      positions: list("client_positions"),
    };
  }
  return result;
}

async function fetchWikiPronouns(wikiNames) {
  const pronouns = {};
  for (let i = 0; i < wikiNames.length; i += 50) {
    const titles = wikiNames.slice(i, i + 50).map((n) => `Universe:${n}`).join("|");
    const url =
      `${WIKI_API}?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&redirects=1` +
      `&titles=${encodeURIComponent(titles)}`;
    const json = await getJson(url);
    for (const page of Object.values(json.query.pages)) {
      const text = page.revisions?.[0]?.slots?.main?.["*"] ?? "";
      const m = text.match(/\|\s*pronoun\s*=([^\n]*)/);
      pronouns[page.title.replace(/^Universe:/, "")] = m ? m[1].trim() : "";
    }
  }
  return pronouns;
}

function genderFromPronoun(pronoun) {
  if (/^He\b/i.test(pronoun)) return "남성";
  if (/^She\b/i.test(pronoun)) return "여성";
  return null;
}

function stripHtml(s) {
  return (s ?? "").replace(/<[^>]+>/g, " ").replace(/\{\{[^}]*\}\}/g, " ");
}

// Data Dragon 툴팁은 CC 효과를 <status> 태그로 감싸므로 이를 우선 신호로 사용
function countCcSkills(spells) {
  return spells.filter((s) => {
    if (/<status>/.test(s.tooltip ?? "")) return true;
    const text = stripHtml(`${s.description} ${s.tooltip}`);
    return CC_KEYWORDS.some((k) => text.includes(k));
  }).length;
}

// 돌진 / 점멸 / 도약 / 순간이동 등 위치를 이동시키는 스킬 (Q/W/E/R 키 배열)
// 설명 문구 기반 추정이라 오차가 있음 → 틀리면 overrides.json 의 dashSkills 로 보정
const DASH_KEYWORDS = /돌진|도약|뛰어|점멸|순간이동|순간 이동|질주|돌격|몸을 날|쇄도|달려|뒤로 물러|뛰어넘|급강하|위치로 이동|위치로 순간|파고들/;

function dashSkills(spells) {
  return spells
    .map((s, i) => ({ key: "QWER"[i], text: stripHtml(`${s.description} ${s.tooltip}`) }))
    .filter(({ text }) => DASH_KEYWORDS.test(text))
    .map(({ key }) => key);
}

// 패시브 + Q/W/E/R 툴팁에서 쉴드(보호막) / 회복 보유 여부 판별
function skillTexts(c) {
  return [...c.spells, c.passive].map((s) => `${s.tooltip ?? ""} ${s.description ?? ""}`);
}

function hasShield(c) {
  return skillTexts(c).some((t) => /<shield>/.test(t) || /보호막[^.<]{0,15}(얻|재생성|충전|부여|생성|씌)/.test(t));
}

function hasHeal(c) {
  // "마나/기력 회복"은 제외하고 체력 회복만 인정
  return skillTexts(c).some((t) => /<healing>/.test(t) || /체력[^.<]{0,20}회복|체력 회복/.test(t));
}

function normalizeResource(partype) {
  const p = (partype ?? "").trim();
  return p || "없음";
}

async function main() {
  const versions = await getJson("https://ddragon.leagueoflegends.com/api/versions.json");
  const version = versions[0];
  console.log(`Data Dragon ${version}`);

  const loadTable = (file) => readFile(path.resolve(file), "utf8").then(JSON.parse);
  const invert = (table) => {
    const map = {};
    for (const [label, ids] of Object.entries(table)) {
      for (const id of ids) {
        if (map[id]) console.warn(`중복 분류: ${id} (${map[id]}, ${label})`);
        map[id] = label;
      }
    }
    return map;
  };
  const [hairById, heightById] = await Promise.all([
    loadTable("scripts/hair.json").then(invert),
    loadTable("scripts/height.json").then(invert),
  ]);

  const [ddKo, ddEn, wikiLua, universe, speciesTable, overrides] = await Promise.all([
    getJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/championFull.json`),
    getJson(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`),
    getText(`https://wiki.leagueoflegends.com/en-us/Module:ChampionData/data?action=raw`),
    getJson("https://universe-meeps.leagueoflegends.com/v1/ko_kr/search/index.json"),
    readFile(path.resolve("scripts/species.json"), "utf8").then(JSON.parse),
    readFile(path.resolve("scripts/overrides.json"), "utf8").then(JSON.parse),
  ]);

  const wiki = parseWikiData(wikiLua);
  const pronouns = await fetchWikiPronouns(Object.values(wiki).map((w) => w.wikiName));
  const universeByName = new Map(universe.champions.map((c) => [c.name, c]));
  const speciesById = {};
  for (const [species, ids] of Object.entries(speciesTable)) {
    for (const id of ids) speciesById[id] = species;
  }

  const warnings = [];
  const champions = Object.keys(ddKo.data)
    .sort()
    .map((id) => {
      const c = ddKo.data[id];
      const w = wiki[id];
      const u = universeByName.get(c.name);
      if (!w) warnings.push(`${id}: wiki 데이터 없음`);
      if (!u) warnings.push(`${id}: universe 데이터 없음`);

      const champ = {
        id,
        name: c.name,
        nameEn: ddEn.data[id]?.name ?? id,
        title: c.title,
        image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`,
        releaseDate: w?.date ?? u?.["release-date"]?.slice(0, 10) ?? null,
        releasePatch: w?.patch ?? null,
        region: FACTIONS[u?.["associated-faction-slug"]] ?? null,
        species: speciesById[id] ?? null,
        hairColor: hairById[id] ?? null,
        heightRange: heightById[id] ?? null,
        gender: genderFromPronoun(pronouns[w?.wikiName] ?? ""),
        rangeType: (w?.rangetype ?? (c.stats.attackrange > 300 ? "Ranged" : "Melee")) === "Ranged" ? "원거리" : "근거리",
        attackRange: c.stats.attackrange,
        resource: normalizeResource(c.partype),
        ccCount: countCcSkills(c.spells),
        dashSkills: dashSkills(c.spells),
        difficulty: c.info.difficulty,
        hasShield: hasShield(c),
        hasHeal: hasHeal(c),
        // 기본 스킨과 크로마(parentSkin 있음)는 제외
        skinCount: c.skins.filter((s) => s.num !== 0 && s.parentSkin === undefined).length,
        positions: (w?.positions ?? []).map((p) => POSITIONS[p] ?? p),
        roles: c.tags.map((t) => ROLES[t] ?? t),
        damageType: DAMAGE_TYPES[w?.adaptivetype] ?? null,
        ...overrides[id],
      };

      for (const [k, v] of Object.entries(champ)) {
        if (k === "dashSkills") continue; // 빈 배열 = 돌진기 없음 (정상)
        if (v == null || (Array.isArray(v) && v.length === 0)) warnings.push(`${id}: ${k} 비어있음`);
      }
      return champ;
    });

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    path.join(OUT_DIR, "champions.json"),
    JSON.stringify({ version, champions }, null, 2) + "\n",
  );
  console.log(`${champions.length}명 저장 완료 → src/data/champions.json`);
  if (warnings.length) {
    console.log(`\n확인 필요 (${warnings.length}건, scripts/overrides.json 또는 species.json 으로 보정):`);
    for (const w of warnings) console.log(" - " + w);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
