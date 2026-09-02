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
  sport: z.string().optional(),
  surface: z.string().max(50).optional(),
  capacity: z.number().int().min(0).optional(),
  floodlights: z.boolean().optional(),
  pricePerHour: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().optional().nullable(),
  galleryImages: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  resetToDefaults: z.boolean().optional(),
});

import { isArenaAdmin, isSuperAdmin } from "@/lib/permissions";

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
  if (!isArenaAdmin(user)) {
    return NextResponse.json(
      { error: "Acces interzis: Doar administratorul de arenă sau SuperAdmin pot edita arena." },
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

  // Arena demo: protejată. Doar SuperAdmin poate reseta la valorile implicite.
  const isSuperUser = user.role === "super_admin" || user.role === "superadmin";
  if (parsed.data.resetToDefaults && !isSuperUser) {
    return NextResponse.json(
      { error: "Acces interzis: Doar SuperAdmin poate reseta arene demo." },
      { status: 403 }
    );
  }

  if (parsed.data.resetToDefaults) {
    const existing = await prisma.venue.findUnique({ where: { id: ctx.params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Arena nu a fost găsită" }, { status: 404 });
    }
    if (!existing.isDemo) {
      return NextResponse.json(
        { error: "Resetarea la valorile implicate este permisă doar pentru arene demo." },
        { status: 400 }
      );
    }

    const updated = await prisma.venue.update({
      where: { id: ctx.params.id },
      data: {
        name: existing.name,
        location: existing.location,
        address: null,
        specs: null,
        sport: "fotbal",
        surface: "Sintetic",
        capacity: 100,
        floodlights: true,
        pricePerHour: null,
        isActive: true,
        imageUrl: null,
        galleryImages: null,
        amenities: null,
        announcements: null,
        tickerText: null,
        tickerActive: false,
        tickerSpeed: 20,
        isDemo: true,
      },
    });
    return NextResponse.json({ venue: updated, reset: true });
  }

  const updateData: any = { ...parsed.data };
  if (updateData.galleryImages !== undefined) {
    updateData.galleryImages = updateData.galleryImages
      ? (typeof updateData.galleryImages === "string"
          ? updateData.galleryImages
          : JSON.stringify(updateData.galleryImages))
      : null;
  }

  const updated = await prisma.venue.update({
    where: { id: ctx.params.id },
    data: updateData,
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
  if (!isSuperAdmin(user) && !isArenaAdmin(user)) {
    return NextResponse.json(
      { error: "Acces interzis: Doar SuperAdmin sau Admin Arenă pot șterge arene." },
      { status: 403 }
    );
  }

  // Arena demo: protejată 100% — nu poate fi ștearsă decât de către SuperAdmin ( și cu confirmare explicită )
  const existing = await prisma.venue.findUnique({ where: { id: ctx.params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Arena nu a fost găsită" }, { status: 404 });
  }

  if (existing.isDemo && !isSuperAdmin(user)) {
    return NextResponse.json(
      { error: "Acces interzis: Arena demo este protejată de ștergere. Doar SuperAdmin poate șterge arene demo." },
      { status: 403 }
    );
  }

  await prisma.venue.delete({
    where: { id: ctx.params.id },
  });

  return NextResponse.json({ ok: true });
}
