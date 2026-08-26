import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isSuper = isSuperAdmin(session.user);
  const champ = await prisma.championship.findFirst({
    where: isSuper ? { id: ctx.params.id } : { id: ctx.params.id, ownerId: (session.user as any).id },
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

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isSuper = isSuperAdmin(session.user);
  const champ = await prisma.championship.findFirst({
    where: isSuper ? { id: ctx.params.id } : { id: ctx.params.id, ownerId: (session.user as any).id },
  });

  if (!champ) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  try {
    const body = await req.json();
    const { logoUrl, name, description, county, city, scope, isBracketPublished, silentDice, refereeEnabled, singleVenueEnabled, defaultVenue } = body;

    const dataToUpdate: any = {};
    if (logoUrl !== undefined) dataToUpdate.logoUrl = logoUrl ? logoUrl.trim() : null;
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (description !== undefined) dataToUpdate.description = description;
    if (county !== undefined) dataToUpdate.county = county;
    if (city !== undefined) dataToUpdate.city = city;
    if (scope !== undefined) dataToUpdate.scope = scope;
    if (isBracketPublished !== undefined) dataToUpdate.isBracketPublished = Boolean(isBracketPublished);
    if (silentDice !== undefined) dataToUpdate.silentDice = Boolean(silentDice);
    if (refereeEnabled !== undefined) dataToUpdate.refereeEnabled = Boolean(refereeEnabled);
    if (singleVenueEnabled !== undefined) dataToUpdate.singleVenueEnabled = Boolean(singleVenueEnabled);
    if (defaultVenue !== undefined) dataToUpdate.defaultVenue = defaultVenue ? defaultVenue.trim() : null;

    const updated = await prisma.championship.update({
      where: { id: champ.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ ok: true, championship: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Eroare la actualizarea campionatului" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isSuper = isSuperAdmin(session.user);
  const champ = await prisma.championship.findFirst({
    where: isSuper ? { id: ctx.params.id } : { id: ctx.params.id, ownerId: (session.user as any).id },
  });
  if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.championship.delete({ where: { id: champ.id } });
  return NextResponse.json({ ok: true });
}

