import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, stewardName = "Steward Poartă", token } = body;

    if (!code) {
      return NextResponse.json({ valid: false, error: "Codul biletului este obligatoriu." }, { status: 400 });
    }

    // Clean code if payload is raw JSON from QR
    let cleanCode = code.trim();
    if (cleanCode.startsWith("{") && cleanCode.endsWith("}")) {
      try {
        const parsed = JSON.parse(cleanCode);
        if (parsed.code) cleanCode = parsed.code;
      } catch {
        // use raw string
      }
    }

    // Try finding ticket by ticketCode or by id
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { ticketCode: cleanCode },
          { ticketCode: cleanCode.toUpperCase() },
          { id: cleanCode },
        ],
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            championship: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        status: "invalid",
        error: "❌ Bilet inexistent sau cod invalid. Verificați autenticitatea biletului.",
      }, { status: 404 });
    }

    // Check if match is finished or cancelled
    if (ticket.match.status === "finished" || ticket.match.status === "cancelled") {
      return NextResponse.json({
        valid: false,
        status: "cancelled",
        error: "🚫 Acest meci este deja finalizat. Scannerul porților și validarea biletelor au fost dezactivate.",
      }, { status: 400 });
    }

    // If ticket was already used
    if (ticket.status === "used") {
      const checkInTime = ticket.checkedInAt
        ? new Date(ticket.checkedInAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "anterior";

      return NextResponse.json({
        valid: false,
        status: "already_used",
        error: `⚠️ ATENȚIE: Acest bilet a fost DEJA SCANAT și utilizat la ora ${checkInTime} de ${ticket.checkedInBy || "alt steward"}!`,
        ticket: {
          ticketCode: ticket.ticketCode,
          buyerName: ticket.buyerName,
          seatSector: ticket.seatSector,
          checkedInAt: ticket.checkedInAt,
          checkedInBy: ticket.checkedInBy,
        },
      });
    }

    // If ticket is cancelled
    if (ticket.status === "cancelled") {
      return NextResponse.json({
        valid: false,
        status: "cancelled",
        error: "🚫 Acest bilet a fost anulat sau rambursat.",
      });
    }

    // Mark ticket as used in real-time
    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: "used",
        checkedInAt: new Date(),
        checkedInBy: stewardName,
      },
    });

    return NextResponse.json({
      valid: true,
      status: "access_granted",
      message: "✅ ACCES PERMIS! Bilet validat cu succes.",
      ticket: {
        id: updated.id,
        ticketCode: updated.ticketCode,
        buyerName: updated.buyerName,
        seatSector: updated.seatSector,
        seatRow: updated.seatRow,
        seatNumber: updated.seatNumber,
        price: updated.price,
        match: {
          teams: `${ticket.match.homeTeam.name} vs ${ticket.match.awayTeam.name}`,
          venue: ticket.match.venue || "Arena  ă",
          stage: ticket.match.stage || `Etapa ${ticket.match.round}`,
        },
        checkedInAt: updated.checkedInAt,
      },
    });
  } catch (error: any) {
    console.error("Error validating ticket:", error);
    return NextResponse.json({ valid: false, error: error.message || "Eroare la validarea biletului." }, { status: 500 });
  }
}
