"use client";

import React, { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { SportProvider } from "@/context/SportContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Suspense fallback={null}>
          <SportProvider>{children}</SportProvider>
        </Suspense>
      </ThemeProvider>
    </SessionProvider>
  );
}
