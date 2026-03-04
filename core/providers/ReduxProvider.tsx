"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/core/store/store";

interface Props {
  readonly children: ReactNode;
}

export const ReduxProvider = ({ children }: Props) => {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
};
