import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      },
    });

    return NextResponse.json({
      activeLogoUrl: settings?.activeLogoUrl || "/images/logos/logo-1.png",
      platformFeePercent: settings?.platformFeePercent ?? 10.0,
      applePayEnabled: settings?.applePayEnabled ?? true,
      googlePayEnabled: settings?.googlePayEnabled ?? true,
      demoPreFillDisabled: settings?.demoPreFillDisabled ?? false,
    });
  } catch (err) {
    return NextResponse.json({
      activeLogoUrl: "/images/logos/logo-1.png",
      platformFeePercent: 10.0,
      applePayEnabled: true,
      googlePayEnabled: true,
      demoPreFillDisabled: false,
    });
  }
}
