import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string; teamId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const champ = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
  });
  if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const team = await prisma.team.findFirst({
    where: { id: ctx.params.teamId, championshipId: champ.id },
  });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.team.delete({ where: { id: team.id } });
  return NextResponse.json({ ok: true });
}
