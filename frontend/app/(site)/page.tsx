import type { Metadata } from "next";
import { Services } from "@/widgets/services/ui/Services";
import type { ServiceDto } from "@/entities/service";
import { fetchBackendJson } from "@/lib/backend-api";
import { HydrateService } from "@/widgets/services/ui/HydrateService";

export default async function IndexPage() {
  const services = await fetchBackendJson<ServiceDto[]>("/services");
  
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

