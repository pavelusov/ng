import type { ReactNode } from "react";
import { AppProviders } from "@/core/providers/AppProviders";
import { ThemeToggle } from "@/widgets/theme-toggle/ui/ThemeToggle";

import "./styles/globals.css";

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
          <ThemeToggle />
        </AppProviders>
      </body>
    </html>
  );
}
