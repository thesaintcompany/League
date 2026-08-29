import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSeasonYear } from "@/lib/season";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "default" },
      select: {
        activeLogoUrl: true,
        platformFeePercent: true,
        applePayEnabled: true,
        googlePayEnabled: true,
        demoPreFillDisabled: true,
        seasonYear: true,
        seasonMode: true,
        notFoundTitle: true,
        notFoundMessage: true,
        notFoundCountdown: true,
        notFoundRedirectEnabled: true,
        notFoundButtonText: true,
        notFoundRedirectUrl: true,
      },
    });

    const seasonYear = settings?.seasonYear ?? null;
    const seasonMode = settings?.seasonMode || "auto";
    const activeSeasonYear = getCurrentSeasonYear(seasonYear, seasonMode);

    return NextResponse.json({
      activeLogoUrl: settings?.activeLogoUrl || "/images/logos/logo-1.png",
      platformFeePercent: settings?.platformFeePercent ?? 10.0,
      applePayEnabled: settings?.applePayEnabled ?? true,
      googlePayEnabled: settings?.googlePayEnabled ?? true,
      demoPreFillDisabled: settings?.demoPreFillDisabled ?? false,
      seasonYear,
      seasonMode,
      activeSeasonYear,
      notFoundTitle: settings?.notFoundTitle || "Pagina nu a fost găsită",
      notFoundMessage:
        settings?.notFoundMessage ||
        "Ne pare rău, pagina pe care o căutați nu există, a fost mutată sau adresa URL a fost introdusă greșit.",
      notFoundCountdown: settings?.notFoundCountdown ?? 10,
      notFoundRedirectEnabled: settings?.notFoundRedirectEnabled ?? true,
      notFoundButtonText: settings?.notFoundButtonText || "Mergi la Pagina Principală",
      notFoundRedirectUrl: settings?.notFoundRedirectUrl || "/",
    });
  } catch (err) {
    const activeSeasonYear = getCurrentSeasonYear(null, "auto");
    return NextResponse.json({
      activeLogoUrl: "/images/logos/logo-1.png",
      platformFeePercent: 10.0,
      applePayEnabled: true,
      googlePayEnabled: true,
      demoPreFillDisabled: false,
      seasonYear: null,
      seasonMode: "auto",
      activeSeasonYear,
      notFoundTitle: "Pagina nu a fost găsită",
      notFoundMessage:
        "Ne pare rău, pagina pe care o căutați nu există, a fost mutată sau adresa URL a fost introdusă greșit.",
      notFoundCountdown: 10,
      notFoundRedirectEnabled: true,
      notFoundButtonText: "Mergi la Pagina Principală",
      notFoundRedirectUrl: "/",
    });
  }
}
