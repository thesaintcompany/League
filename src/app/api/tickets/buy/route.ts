import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTicketSalesClosed } from "@/lib/tickets";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      matchId,
      tierId,
      quantity = 1,
      buyerName,
      buyerEmail,
      buyerPhone,
      paymentMethod = "card", // "card" | "paypal" | "apple_pay" | "google_pay"
      seatSector = "Tribuna 1",
      promoCode,
    } = body;

    if (!matchId || !buyerName || !buyerEmail) {
      return NextResponse.json({ error: "matchId, buyerName și buyerEmail sunt obligatorii" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        championship: true,
        homeTeam: true,
        awayTeam: true,
        ticketTiers: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Meciul nu a fost găsit" }, { status: 404 });
    }

    if (isTicketSalesClosed(match)) {
      return NextResponse.json(
        { error: "Vânzarea online a biletelor pentru această competiție este închisă (ziua meciului sau eveniment finalizat)." },
        { status: 400 }
      );
    }

    const count = Math.max(1, parseInt(quantity) || 1);
    const normalizedPromoCode = String(promoCode || "").trim().toUpperCase();
    let appliedPromoCode: { id: string; code: string; maxRedemptions: number; redeemedCount: number } | null = null;

    if (normalizedPromoCode) {
      appliedPromoCode = await prisma.ticketPromoCode.findFirst({
        where: { matchId: match.id, code: normalizedPromoCode, isActive: true },
        select: { id: true, code: true, maxRedemptions: true, redeemedCount: true },
      });

      if (!appliedPromoCode) {
        return NextResponse.json({ error: "Codul pentru bilete gratuite este invalid sau nu mai este activ." }, { status: 400 });
      }

      const availableTickets = appliedPromoCode.maxRedemptions - appliedPromoCode.redeemedCount;
      if (count > availableTickets) {
        return NextResponse.json(
          { error: `Codul mai are disponibile doar ${availableTickets} bilete gratuite.` },
          { status: 400 }
        );
      }
    }

    // Determine price from tier or match default
    let unitPrice = match.ticketPrice || 25;
    let selectedTierName = seatSector;
    let targetTier = null;

    if (tierId) {
      targetTier = match.ticketTiers.find((t) => t.id === tierId);
      if (targetTier) {
        unitPrice = targetTier.price;
        selectedTierName = targetTier.name;
      }
    }

    if (appliedPromoCode) {
      unitPrice = 0;
    }

    // Get Platform Fee Percent from SystemSetting
    const setting = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    const feePercent = setting?.platformFeePercent ?? 10.0;

    const createdTickets = [];

    for (let i = 0; i < count; i++) {
      // Generate Unique Ticket Code (e.g. TCK-2026-98F12A)
      const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
      const ticketCode = `TCK-2026-${randomPart}`;

      // Calculate splits
      const platformFee = Math.round((unitPrice * (feePercent / 100)) * 100) / 100;
      const organizerPayout = Math.round((unitPrice - platformFee) * 100) / 100;

      // Verification QR Payload
      const qrPayload = JSON.stringify({
        code: ticketCode,
        matchId: match.id,
        name: buyerName,
        sector: selectedTierName,
        hash: crypto.createHash("sha256").update(`${ticketCode}-${match.id}-LIGUEPRO2026`).digest("hex").substring(0, 16),
      });

      const randomSeatNum = Math.floor(Math.random() * 40) + 1;
      const randomRow = Math.floor(Math.random() * 15) + 1;

      const ticket = await prisma.ticket.create({
        data: {
          ticketCode,
          matchId: match.id,
          tierId: targetTier?.id || null,
          buyerName,
          buyerEmail,
          buyerPhone: buyerPhone || null,
          seatSector: selectedTierName,
          seatRow: `Rândul ${randomRow}`,
          seatNumber: `Locul ${randomSeatNum}`,
          price: unitPrice,
          platformFee,
          organizerPayout,
          paymentMethod: appliedPromoCode ? "promo_code" : paymentMethod,
          paymentStatus: "paid",
          status: "valid",
          qrPayload,
        },
      });

      // Update tier sold seats if applicable
      if (targetTier) {
        await prisma.ticketTier.update({
          where: { id: targetTier.id },
          data: { soldSeats: { increment: 1 } },
        });
      }

      createdTickets.push(ticket);
    }

    if (appliedPromoCode) {
      await prisma.ticketPromoCode.update({
        where: { id: appliedPromoCode.id },
        data: { redeemedCount: { increment: count } },
      });
    }

    return NextResponse.json({
      success: true,
      message: appliedPromoCode
        ? `S-au emis cu succes ${createdTickets.length} bilet(e) gratuit(e) cu codul ${appliedPromoCode.code}!`
        : `S-au emis cu succes ${createdTickets.length} bilet(e)!`,
      tickets: createdTickets,
      firstTicketCode: createdTickets[0].ticketCode,
      redirectUrl: `/tickets/${createdTickets[0].id}/print`,
      isFreeTicket: Boolean(appliedPromoCode),
    });
  } catch (error: any) {
    console.error("Error processing ticket purchase:", error);
    return NextResponse.json({ error: error.message || "Eroare la procesarea achiziției de bilete" }, { status: 500 });
  }
}
