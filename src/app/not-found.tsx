import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { NotFoundClient } from "@/components/NotFoundClient";

export const metadata: Metadata = {
  title: "404 - Pagina nu a fost găsită | PRO LIGUE ROMÂNIA",
  description:
    "Pagina pe care o căutați nu există sau a fost mutată. Redirecționare automată către pagina principală PRO LIGUE ROMÂNIA.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function NotFound() {
  let settings = null;

  try {
    settings = await prisma.systemSetting.findUnique({
      where: { id: "default" },
      select: {
        activeLogoUrl: true,
        notFoundTitle: true,
        notFoundMessage: true,
        notFoundCountdown: true,
        notFoundRedirectEnabled: true,
        notFoundButtonText: true,
        notFoundRedirectUrl: true,
      },
    });
  } catch (err) {
    // If DB is unreachable during build or SSR, fallback to defaults
  }

  return (
    <NotFoundClient
      initialTitle={settings?.notFoundTitle || "Pagina nu a fost găsită"}
      initialMessage={
        settings?.notFoundMessage ||
        "Ne pare rău, pagina pe care o căutați nu există, a fost mutată sau adresa URL a fost introdusă greșit."
      }
      initialCountdown={settings?.notFoundCountdown ?? 10}
      initialRedirectEnabled={settings?.notFoundRedirectEnabled ?? true}
      initialButtonText={settings?.notFoundButtonText || "Mergi la Pagina Principală"}
      initialRedirectUrl={settings?.notFoundRedirectUrl || "/"}
      initialLogoUrl={settings?.activeLogoUrl || "/images/logos/logo-1.png"}
    />
  );
}
