import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  shortName: z.string().max(5).optional().nullable(),
  color: z.string().max(7).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const champ = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
  });
  if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const team = await prisma.team.create({
    data: {
      championshipId: champ.id,
      name: parsed.data.name,
      shortName: parsed.data.shortName ?? null,
      color: parsed.data.color ?? null,
      logoUrl: parsed.data.logoUrl ?? null,
    },
  });

  return NextResponse.json({ team }, { status: 201 });
}
