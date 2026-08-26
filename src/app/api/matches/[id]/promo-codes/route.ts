import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

function normalizeCode(value: unknown) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
}

async function getManagedMatch(matchId: string, user: any) {
  return prisma.match.findFirst({
    where: isSuperAdmin(user)
      ? { id: matchId }
      : { id: matchId, championship: { ownerId: user.id } },
    select: { id: true },
  });
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });

  const match = await getManagedMatch(ctx.params.id, session.user);
  if (!match) return NextResponse.json({ error: "Meciul nu a fost găsit sau nu ai acces" }, { status: 404 });

  const promoCode = await prisma.ticketPromoCode.findFirst({
    where: { matchId: match.id, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ promoCode });
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });

  const match = await getManagedMatch(ctx.params.id, session.user);
  if (!match) return NextResponse.json({ error: "Meciul nu a fost găsit sau nu ai acces" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const code = normalizeCode(body.code) || `VIP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const maxRedemptions = Math.min(100, Math.max(1, Number.parseInt(body.maxRedemptions, 10) || 5));

  if (code.length < 4 || code.length > 32) {
    return NextResponse.json({ error: "Codul trebuie să aibă între 4 și 32 de caractere." }, { status: 400 });
  }

  await prisma.ticketPromoCode.updateMany({
    where: { matchId: match.id, isActive: true },
    data: { isActive: false },
  });

  const promoCode = await prisma.ticketPromoCode.create({
    data: { matchId: match.id, code, maxRedemptions },
  });

  return NextResponse.json({ ok: true, promoCode });
}
