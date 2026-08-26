import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

// GET system settings (platform commission %, payment gateways)
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
        platformFeePercent: 10.0,
        applePayEnabled: true,
        googlePayEnabled: true,
        payoutMinThreshold: 100,
      },
    });
  }

  // If not admin, return only public config
  if (!isSuperAdmin(user)) {
    return NextResponse.json({
      platformFeePercent: settings.platformFeePercent,
      applePayEnabled: settings.applePayEnabled,
      googlePayEnabled: settings.googlePayEnabled,
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
    return NextResponse.json({ error: "Neautorizat. Doar SuperAdmin poate modifica setările de ticketing." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      platformFeePercent,
      stripePublishableKey,
      stripeSecretKey,
      paypalClientId,
      applePayEnabled,
      googlePayEnabled,
      payoutMinThreshold,
    } = body;

    const updated = await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: {
        platformFeePercent: typeof platformFeePercent === "number" ? platformFeePercent : 10.0,
        stripePublishableKey: stripePublishableKey || null,
        stripeSecretKey: stripeSecretKey || null,
        paypalClientId: paypalClientId || null,
        applePayEnabled: Boolean(applePayEnabled),
        googlePayEnabled: Boolean(googlePayEnabled),
        payoutMinThreshold: typeof payoutMinThreshold === "number" ? payoutMinThreshold : 100,
      },
      create: {
        id: "default",
        platformFeePercent: typeof platformFeePercent === "number" ? platformFeePercent : 10.0,
        stripePublishableKey: stripePublishableKey || null,
        stripeSecretKey: stripeSecretKey || null,
        paypalClientId: paypalClientId || null,
        applePayEnabled: Boolean(applePayEnabled),
        googlePayEnabled: Boolean(googlePayEnabled),
        payoutMinThreshold: typeof payoutMinThreshold === "number" ? payoutMinThreshold : 100,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("Error updating system settings:", error);
    return NextResponse.json({ error: error.message || "Eroare la salvarea setărilor." }, { status: 500 });
  }
}
