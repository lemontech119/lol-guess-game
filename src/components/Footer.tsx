import { DATA_VERSION } from "@/lib/champions";

export function Footer() {
  return (
    <footer className="px-4 py-6 text-center text-xs leading-relaxed text-gold-800">
      데이터: Riot Data Dragon {DATA_VERSION} · Riot Universe · League of Legends Wiki (CC BY-SA)
      <br />
      롤 챔피언 맞추기는 Riot Games의 공식 서비스가 아니며, Riot Games 및 League of Legends 관련 상표와 자산은 Riot
      Games, Inc.의 소유입니다.
    </footer>
  );
}
