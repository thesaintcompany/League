import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateVenueSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  location: z.string().min(2).max(120).optional(),
  address: z.string().max(200).optional().nullable(),
  specs: z.string().max(500).optional().nullable(),
  sport: z.enum(["fotbal", "baschet", "volei", "multifunctional"]).optional(),
  surface: z.string().max(50).optional(),
  capacity: z.number().int().min(0).optional(),
  floodlights: z.boolean().optional(),
  pricePerHour: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().optional().nullable(),
});

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const venue = await prisma.venue.findUnique({
    where: { id: ctx.params.id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  if (!venue) {
    return NextResponse.json({ error: "Arena nu a fost găsită" }, { status: 404 });
  }

  return NextResponse.json({ venue });
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const isOrganizer = user.role === "organizer" || user.role === "arena_owner" || !user.role;
  if (!isOrganizer) {
    return NextResponse.json(
      { error: "Acces interzis: Doar administratorul principal sau proprietarul arenei pot edita arena." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = updateVenueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.venue.update({
    where: { id: ctx.params.id },
    data: parsed.data,
  });

  return NextResponse.json({ venue: updated });
}

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const isOrganizer = user.role === "organizer" || !user.role;
  if (!isOrganizer) {
    return NextResponse.json(
      { error: "Acces interzis: Doar administratorul principal poate șterge arene." },
      { status: 403 }
    );
  }

  await prisma.venue.delete({
    where: { id: ctx.params.id },
  });

  return NextResponse.json({ ok: true });
}
