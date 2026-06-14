import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const champ = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
    include: {
      teams: {
        include: { players: true },
        orderBy: { name: "asc" },
      },
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ championship: champ });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const champ = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
  });
  if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.championship.delete({ where: { id: champ.id } });
  return NextResponse.json({ ok: true });
}
