import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  number: z.number().int().min(0).max(999).optional().nullable(),
  position: z.string().max(40).optional().nullable(),
});

export async function POST(
  req: Request,
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

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const player = await prisma.player.create({
    data: {
      teamId: team.id,
      name: parsed.data.name,
      number: parsed.data.number ?? null,
      position: parsed.data.position ?? null,
    },
  });

  return NextResponse.json({ player }, { status: 201 });
}
