import type { Metadata } from "next";
import { Services } from "@/widgets/services/ui/Services";
import { serviceRepository } from "@/entities/service/api/service.repository";
import { HydrateService } from "@/widgets/services/ui/HydrateService";

export default async function IndexPage() {
  const services = await serviceRepository.getServices();
  
  return (
    <main>
      <HydrateService initialServices={services} />
      <Services />
    </main>
  );
}

export const metadata: Metadata = {
  title: "Новые горизонты",
  description: "Новые горизонты",
  openGraph: {
    title: "Новые горизонты",
    description: "Новые горизонты",
    url: "https://novagor.ru",
    siteName: "Новые горизонты",
    images: [{ url: "https://novagor.ru/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Новые горизонты",
    description: "Новые горизонты",
    images: [{ url: "https://novagor.ru/og-image.png" }],
  },
};

