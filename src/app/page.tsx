import Link from "next/link";
import { Footer } from "@/components/Footer";
import { MAX_HINTS, ROUND_SIZE } from "@/lib/champions";
import { ALL_HINTS } from "@/lib/hints";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <div>
          <p className="mb-2 text-sm tracking-[0.3em] text-gold-500">LEAGUE OF LEGENDS</p>
          <h1 className="text-4xl font-black text-gold-300 sm:text-5xl">롤 챔피언 맞추기</h1>
        </div>
        <ul className="space-y-2 text-gold-200">
          <li>랜덤으로 {ROUND_SIZE}명의 챔피언이 출제됩니다.</li>
          <li>
            {ALL_HINTS.length}가지 힌트 중 <b className="text-gold-300">최대 {MAX_HINTS}개</b>를 골라 열어볼 수 있어요.
          </li>
          <li>챔피언마다 정답 기회는 한 번입니다.</li>
        </ul>
        <Link
          href="/play"
          className="rounded-md bg-gold-400 px-10 py-4 text-lg font-black text-navy-950 shadow-lg shadow-gold-400/20 transition hover:bg-gold-300"
        >
          게임 시작
        </Link>
      </div>
      <Footer />
    </main>
  );
}
