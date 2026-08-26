import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET tiers for a match with strict privacy protection
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");

  if (!matchId) {
    return NextResponse.json({ error: "matchId este obligatoriu" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      ticketTiers: true,
      championship: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Meciul nu a fost găsit" }, { status: 404 });
  }

  const isOwner = session?.user && (match.championship.ownerId === (session.user as any).id || isSuperAdmin(session.user));

  // Only return private banking and gate secrets to the event organizer or superadmin
  return NextResponse.json({
    matchId: match.id,
    venue: match.venue,
    ticketPrice: match.ticketPrice,
    organizerIban: isOwner ? match.organizerIban : null,
    organizerBank: isOwner ? match.organizerBank : null,
    organizerAccountHolder: isOwner ? match.organizerAccountHolder : null,
    gateAccessSecret: isOwner ? match.gateAccessSecret : null,
    tiers: match.ticketTiers,
  });
}

// POST create or update ticket tier for a match
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchId, name, price, totalSeats, gateNumber, organizerIban, organizerBank, organizerAccountHolder } = body;

    if (!matchId || !name || price == null) {
      return NextResponse.json({ error: "matchId, name și price sunt obligatorii" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { championship: true },
    });

    if (!match) {
      return NextResponse.json({ error: "Meciul nu a fost găsit" }, { status: 404 });
    }

    const isOwner = match.championship.ownerId === (session.user as any).id || isSuperAdmin(session.user);
    if (!isOwner) {
      return NextResponse.json({ error: "Acces interzis. Puteți gestiona biletele doar pentru campionatele proprii." }, { status: 403 });
    }

    // Update match payout details if provided
    if (organizerIban || organizerBank || organizerAccountHolder) {
      await prisma.match.update({
        where: { id: matchId },
        data: {
          organizerIban: organizerIban || undefined,
          organizerBank: organizerBank || undefined,
          organizerAccountHolder: organizerAccountHolder || undefined,
        },
      });
    }

    // Create tier
    const tier = await prisma.ticketTier.create({
      data: {
        matchId,
        name,
        price: parseFloat(price),
        totalSeats: parseInt(totalSeats) || 100,
        gateNumber: gateNumber || "Poarta A (Nord)",
      },
    });

    return NextResponse.json({ success: true, tier });
  } catch (error: any) {
    console.error("Error creating ticket tier:", error);
    return NextResponse.json({ error: error.message || "Eroare la crearea categoriei de bilete" }, { status: 500 });
  }
}

// DELETE a ticket tier
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tierId = searchParams.get("tierId");

  if (!tierId) {
    return NextResponse.json({ error: "tierId este obligatoriu" }, { status: 400 });
  }

  const tier = await prisma.ticketTier.findUnique({
    where: { id: tierId },
    include: { match: { include: { championship: true } } },
  });

  if (!tier) {
    return NextResponse.json({ error: "Categoria nu a fost găsită" }, { status: 404 });
  }

  const isOwner = tier.match.championship.ownerId === (session.user as any).id || isSuperAdmin(session.user);
  if (!isOwner) {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  await prisma.ticketTier.delete({
    where: { id: tierId },
  });

  return NextResponse.json({ success: true });
}
