"use client";

import type { PaletteMode } from "@mui/material";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

type ColorModeContextValue = {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggleMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

const STORAGE_KEY = "mui-color-mode";

export function ColorModeProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [mode, setModeState] = useState<PaletteMode>("dark");

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "light" || saved === "dark") {
      setModeState(saved);
      return;
    }
    // Default mode: always dark unless user explicitly selected otherwise.
    setModeState("dark");
  }, []);

  const setMode = useCallback((next: PaletteMode) => {
    setModeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return ctx;
}

