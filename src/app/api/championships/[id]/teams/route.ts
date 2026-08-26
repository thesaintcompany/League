import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { isTeamLeader, isOrganizer, isSuperAdmin } from "@/lib/permissions";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  shortName: z.string().max(5).optional().nullable(),
  color: z.string().max(7).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const user = session.user as any;
  const champ = await prisma.championship.findUnique({
    where: { id: ctx.params.id },
  });
  if (!champ) return NextResponse.json({ error: "Campionatul nu a fost găsit" }, { status: 404 });

  const isChampOwner = champ.ownerId === user.id;
  const canManage = isTeamLeader(user) || isOrganizer(user);

  if (!isChampOwner && !canManage) {
    return NextResponse.json(
      { error: "Acces interzis: Doar managerul de echipă sau organizatorul poate genera echipe." },
      { status: 403 }
    );
  }

  // Enforce MAX 1 TEAM per manager constraint
  if (isTeamLeader(user) && !isSuperAdmin(user) && !isChampOwner) {
    const existingTeamsCount = await prisma.team.count({
      where: { managerId: user.id },
    });
    if (existingTeamsCount >= 1) {
      return NextResponse.json(
        { error: "Puteți genera / crea maxim o singură echipă per manager (1 echipă per user)." },
        { status: 400 }
      );
    }
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
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
      managerId: user.id,
    },
  });

  return NextResponse.json({ team }, { status: 201 });
}
