import type { Metadata } from "next";
import { Services } from "@/widgets/services/ui/Services";

export default function IndexPage() {
  return (
    <main>
      <Services />
    </main>
  );
}

export const metadata: Metadata = {
  title: "Новые горизонты",
};

