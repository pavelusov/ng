"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { SessionSync } from "@/core/auth/SessionSync";

interface Props {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}

