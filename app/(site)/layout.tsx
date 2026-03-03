import type { ReactNode } from "react";
import { Header } from "@/widgets/header/ui";
import { Footer } from "@/widgets/footer/ui/Footer";

interface Props {
  readonly children: ReactNode;
}

export default function SiteLayout({ children }: Props) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

