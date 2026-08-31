"use client";

import React, { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { SportProvider } from "@/context/SportContext";
import { ImpersonationBanner } from "./ImpersonationBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ImpersonationBanner />
        <Suspense fallback={null}>
          <SportProvider>{children}</SportProvider>
        </Suspense>
      </ThemeProvider>
    </SessionProvider>
  );
}
