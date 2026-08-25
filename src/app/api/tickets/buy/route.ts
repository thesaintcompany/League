import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Get Platform Fee Percent from SystemSetting
    const setting = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    const feePercent = setting?.platformFeePercent ?? 10.0;

    const count = Math.max(1, parseInt(quantity) || 1);
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
          paymentMethod,
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

    return NextResponse.json({
      success: true,
      message: `S-au emis cu succes ${createdTickets.length} bilet(e)!`,
      tickets: createdTickets,
      firstTicketCode: createdTickets[0].ticketCode,
      redirectUrl: `/tickets/${createdTickets[0].id}/print`,
    });
  } catch (error: any) {
    console.error("Error processing ticket purchase:", error);
    return NextResponse.json({ error: error.message || "Eroare la procesarea achiziției de bilete" }, { status: 500 });
  }
}
