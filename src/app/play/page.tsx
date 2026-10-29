import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Game } from "@/components/Game";

export const metadata: Metadata = {
  title: "게임 | 롤 챔피언 맞추기",
};

export default function PlayPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Game />
      <Footer />
    </main>
  );
}
