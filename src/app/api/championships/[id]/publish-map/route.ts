import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateShareCode(id: string) {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `LP-${clean || Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export async function POST(
  req: Request,
  ctx: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const championship = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
  });

  if (!championship) {
    return NextResponse.json({ error: "Campionatul nu a fost găsit" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const isBracketPublished =
    typeof body.isBracketPublished === "boolean"
      ? body.isBracketPublished
      : !championship.isBracketPublished;

  const shareCode = championship.shareCode || generateShareCode(championship.id);

  const updated = await prisma.championship.update({
    where: { id: championship.id },
    data: {
      isBracketPublished,
      shareCode,
    },
  });

  return NextResponse.json({
    ok: true,
    isBracketPublished: updated.isBracketPublished,
    shareCode: updated.shareCode,
    shareUrl: `/brackets?id=${updated.id}`,
    codeUrl: `/brackets?code=${updated.shareCode}`,
    message: updated.isBracketPublished
      ? `Tabloul campionatului "${updated.name}" este acum PUBLIC (Cod: ${updated.shareCode})!`
      : `Tabloul campionatului a fost trecut pe mod PRIVAT.`,
  });
}
