import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const championship = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
  });

  if (!championship) {
    return NextResponse.json({ error: "Championship not found" }, { status: 404 });
  }

  const body = await req.json();
  const isBracketPublished = typeof body.isBracketPublished === "boolean"
    ? body.isBracketPublished
    : !championship.isBracketPublished;

  const updated = await prisma.championship.update({
    where: { id: championship.id },
    data: { isBracketPublished },
  });

  return NextResponse.json({
    ok: true,
    isBracketPublished: updated.isBracketPublished,
    message: updated.isBracketPublished
      ? "Harta Campionatului este acum PUBLICĂ și vizibilă pentru toată lumea!"
      : "Harta Campionatului a fost trecută pe mod PRIVAT (doar organizatorul o poate vedea).",
  });
}
