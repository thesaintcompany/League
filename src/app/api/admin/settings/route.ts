import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// GET system settings (platform commission %, payment gateways, activeLogoUrl, company legal data)
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  let settings = await prisma.systemSetting.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: {
        id: "default",
        activeLogoUrl: "/images/logos/logo-1.png",
        companyName: "TSC Q - ligue.ro",
        companyCui: "53063735",
        companyRegCom: "J2025095153006",
        companyAddress: "Timișoara, Județul Timiș, România",
        companyEmail: "contact@ligue.ro",
        companyPhone: "+40 700 000 000",
        platformFeePercent: 10.0,
        applePayMerchantId: "merchant.ro.buu.league",
        applePayDomainVerified: true,
        applePayEnabled: true,
        googlePayMerchantId: "buu-ro-league-pay",
        googlePayEnvironment: "PRODUCTION",
        googlePayEnabled: true,
        payoutMinThreshold: 100,
      },
    });
  }

  // If not admin, return public config
  if (!isSuperAdmin(user)) {
    return NextResponse.json({
      activeLogoUrl: settings.activeLogoUrl || "/images/logos/logo-1.png",
      companyName: settings.companyName,
      companyCui: settings.companyCui,
      companyEmail: settings.companyEmail,
      platformFeePercent: settings.platformFeePercent,
      applePayEnabled: settings.applePayEnabled,
      googlePayEnabled: settings.googlePayEnabled,
      teamSubscriptionPrice: settings.teamSubscriptionPrice ?? 60.0,
      seasonYear: settings.seasonYear,
      seasonMode: settings.seasonMode || "auto",
      notFoundTitle: settings.notFoundTitle || "Pagina nu a fost găsită",
      notFoundMessage:
        settings.notFoundMessage ||
        "Ne pare rău, pagina pe care o căutați nu există, a fost mutată sau adresa URL a fost introdusă greșit.",
      notFoundCountdown: settings.notFoundCountdown ?? 10,
      notFoundRedirectEnabled: settings.notFoundRedirectEnabled ?? true,
      notFoundButtonText: settings.notFoundButtonText || "Mergi la Pagina Principală",
      notFoundRedirectUrl: settings.notFoundRedirectUrl || "/",
    });
  }

  // Admin stats: total tickets sold, platform revenue, organizer payouts
  const allTickets = await prisma.ticket.findMany({
    where: { paymentStatus: "paid" },
    include: { match: { include: { homeTeam: true, awayTeam: true, championship: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalGrossRevenue = allTickets.reduce((acc, t) => acc + t.price, 0);
  const totalPlatformFees = allTickets.reduce((acc, t) => acc + t.platformFee, 0);
  const totalOrganizerPayouts = allTickets.reduce((acc, t) => acc + t.organizerPayout, 0);

  return NextResponse.json({
    settings,
    stats: {
      totalTicketsSold: allTickets.length,
      totalGrossRevenue,
      totalPlatformFees,
      totalOrganizerPayouts,
    },
    recentTransactions: allTickets.slice(0, 20),
  });
}

// PUT update system settings (SuperAdmin only)
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!isSuperAdmin(user)) {
    return NextResponse.json(
      { error: "Neautorizat. Doar SuperAdmin poate modifica setările platformei și brandingul." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      activeLogoUrl,
      companyName,
      companyCui,
      companyRegCom,
      companyAddress,
      companyEmail,
      companyPhone,
      platformFeePercent,
      stripePublishableKey,
      stripeSecretKey,
      stripeWebhookSecret,
      paypalClientId,
      applePayMerchantId,
      applePayDomainVerified,
      applePayEnabled,
      googlePayMerchantId,
      googlePayEnvironment,
      googlePayEnabled,
      payoutMinThreshold,
      teamSubscriptionPrice,
      seasonYear,
      seasonMode,
      notFoundTitle,
      notFoundMessage,
      notFoundCountdown,
      notFoundRedirectEnabled,
      notFoundButtonText,
      notFoundRedirectUrl,
    } = body;

    const updated = await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: {
        activeLogoUrl: activeLogoUrl || undefined,
        companyName: companyName !== undefined ? companyName : undefined,
        companyCui: companyCui !== undefined ? companyCui : undefined,
        companyRegCom: companyRegCom !== undefined ? companyRegCom : undefined,
        companyAddress: companyAddress !== undefined ? companyAddress : undefined,
        companyEmail: companyEmail !== undefined ? companyEmail : undefined,
        companyPhone: companyPhone !== undefined ? companyPhone : undefined,
        platformFeePercent: typeof platformFeePercent === "number" ? platformFeePercent : undefined,
        stripePublishableKey: stripePublishableKey !== undefined ? stripePublishableKey : undefined,
        stripeSecretKey: stripeSecretKey !== undefined ? stripeSecretKey : undefined,
        stripeWebhookSecret: stripeWebhookSecret !== undefined ? stripeWebhookSecret : undefined,
        paypalClientId: paypalClientId !== undefined ? paypalClientId : undefined,
        applePayMerchantId: applePayMerchantId !== undefined ? applePayMerchantId : undefined,
        applePayDomainVerified: applePayDomainVerified !== undefined ? Boolean(applePayDomainVerified) : undefined,
        applePayEnabled: applePayEnabled !== undefined ? Boolean(applePayEnabled) : undefined,
        googlePayMerchantId: googlePayMerchantId !== undefined ? googlePayMerchantId : undefined,
        googlePayEnvironment: googlePayEnvironment !== undefined ? googlePayEnvironment : undefined,
        googlePayEnabled: googlePayEnabled !== undefined ? Boolean(googlePayEnabled) : undefined,
        payoutMinThreshold: typeof payoutMinThreshold === "number" ? payoutMinThreshold : undefined,
        teamSubscriptionPrice: typeof teamSubscriptionPrice === "number" ? teamSubscriptionPrice : undefined,
        seasonYear: seasonYear !== undefined ? (seasonYear ? Number(seasonYear) : null) : undefined,
        seasonMode: seasonMode !== undefined ? seasonMode : undefined,
        notFoundTitle: notFoundTitle !== undefined ? notFoundTitle : undefined,
        notFoundMessage: notFoundMessage !== undefined ? notFoundMessage : undefined,
        notFoundCountdown: typeof notFoundCountdown === "number" ? notFoundCountdown : undefined,
        notFoundRedirectEnabled:
          notFoundRedirectEnabled !== undefined ? Boolean(notFoundRedirectEnabled) : undefined,
        notFoundButtonText: notFoundButtonText !== undefined ? notFoundButtonText : undefined,
        notFoundRedirectUrl: notFoundRedirectUrl !== undefined ? notFoundRedirectUrl : undefined,
      },
      create: {
        id: "default",
        activeLogoUrl: activeLogoUrl || "/images/logos/logo-1.png",
        companyName: companyName || "TSC Q - ligue.ro",
        companyCui: companyCui || "53063735",
        companyRegCom: companyRegCom || "J2025095153006",
        companyAddress: companyAddress || "Timișoara, Județul Timiș, România",
        companyEmail: companyEmail || "contact@ligue.ro",
        companyPhone: companyPhone || "+40 700 000 000",
        platformFeePercent: typeof platformFeePercent === "number" ? platformFeePercent : 10.0,
        stripePublishableKey: stripePublishableKey || null,
        stripeSecretKey: stripeSecretKey || null,
        stripeWebhookSecret: stripeWebhookSecret || null,
        paypalClientId: paypalClientId || null,
        applePayMerchantId: applePayMerchantId || "merchant.ro.buu.league",
        applePayDomainVerified: Boolean(applePayDomainVerified),
        applePayEnabled: Boolean(applePayEnabled),
        googlePayMerchantId: googlePayMerchantId || "buu-ro-league-pay",
        googlePayEnvironment: googlePayEnvironment || "PRODUCTION",
        googlePayEnabled: Boolean(googlePayEnabled),
        payoutMinThreshold: typeof payoutMinThreshold === "number" ? payoutMinThreshold : 100,
        teamSubscriptionPrice: typeof teamSubscriptionPrice === "number" ? teamSubscriptionPrice : 60.0,
        seasonYear: seasonYear ? Number(seasonYear) : null,
        seasonMode: seasonMode || "auto",
        notFoundTitle: notFoundTitle || "Pagina nu a fost găsită",
        notFoundMessage:
          notFoundMessage ||
          "Ne pare rău, pagina pe care o căutați nu există, a fost mutată sau adresa URL a fost introdusă greșit.",
        notFoundCountdown: typeof notFoundCountdown === "number" ? notFoundCountdown : 10,
        notFoundRedirectEnabled:
          notFoundRedirectEnabled !== undefined ? Boolean(notFoundRedirectEnabled) : true,
        notFoundButtonText: notFoundButtonText || "Mergi la Pagina Principală",
        notFoundRedirectUrl: notFoundRedirectUrl || "/",
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("Error updating system settings:", error);
    return NextResponse.json({ error: error.message || "Eroare la salvarea setărilor." }, { status: 500 });
  }
}
