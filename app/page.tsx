import type { Metadata } from "next";
import { Achievements } from "@/widgets/achievements/ui/Achievements";
import { Contacts } from "@/widgets/contacts/ui/Contacts";
import { Footer } from "@/widgets/footer/ui/Footer";
import { Hero } from "@/widgets/hero/ui/Hero";
import { Services } from "@/widgets/services/ui/Services";

export default function IndexPage() {
  return (
    <main>
      <Hero />
      <Services />
      <Contacts />
      <Achievements />
      <Footer />
    </main>
  );
}

export const metadata: Metadata = {
  title: "Новые горизонты",
};
