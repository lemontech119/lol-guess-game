import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = {
  title: "결과 | 롤 챔피언 맞추기",
};

export default function ResultPage() {
  return (
    <main className="flex flex-1 flex-col">
      <ResultView />
      <Footer />
    </main>
  );
}
