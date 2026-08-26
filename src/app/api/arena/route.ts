import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;
  const userEmail = session.user.email ? session.user.email.trim().toLowerCase() : null;

  let dbUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  if (!dbUser && userEmail) {
    dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
  }

  const validOwnerId = dbUser?.id || null;

  // Find venue owned by this user
  let venue = validOwnerId ? await prisma.venue.findFirst({
    where: { ownerId: validOwnerId },
  }) : null;

  if (!venue && userId) {
    venue = await prisma.venue.findFirst({
      where: { ownerId: userId },
    });
  }

  // If none exists yet, create or assign default venue for demo arena owner
  if (!venue) {
    if (userRole === "arena_owner" || userRole === "organizer" || userRole === "super_admin") {
      venue = await prisma.venue.create({
        data: {
          ownerId: validOwnerId,
          name: "Arena Sportivă Centrală",
          location: "Timișoara",
          address: "Calea Șagului nr. 175, Timișoara",
          specs: "Teren sintetic profesional 55mm, nocturnă LED, vestiare moderne",
          sport: "fotbal",
          surface: "Sintetic",
          capacity: 350,
          floodlights: true,
          pricePerHour: 180,
          imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
          tickerText: "Rezervări disponibile pentru weekend! Contactează recepția arenei pentru detalii și promoții.",
          tickerActive: true,
          tickerSpeed: 18,
        },
      });
    }
  }

  return NextResponse.json({ venue });
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email ? session.user.email.trim().toLowerCase() : null;
    const body = await req.json();

    let dbUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!dbUser && userEmail) {
      dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    const validOwnerId = dbUser?.id || userId || null;
    const targetVenueId = body.venueId || body.id || null;

    let venue = targetVenueId
      ? await prisma.venue.findUnique({
          where: { id: targetVenueId },
        })
      : null;

    if (!venue && validOwnerId) {
      venue = await prisma.venue.findFirst({
        where: { ownerId: validOwnerId },
      });
    }

    if (!venue && userId) {
      venue = await prisma.venue.findFirst({
        where: { ownerId: userId },
      });
    }

    const oldName = venue?.name;
    const newName = body.name && body.name.trim() ? body.name.trim() : (venue?.name || "Arena Mea");

    if (!venue) {
      // If not found, create new venue for this owner
      venue = await prisma.venue.create({
        data: {
          ownerId: validOwnerId,
          name: newName,
          location: body.location && body.location.trim() ? body.location.trim() : "Timișoara",
          address: body.address ? body.address.trim() : null,
          specs: body.specs ? body.specs.trim() : null,
          amenities: body.amenities ? (typeof body.amenities === "string" ? body.amenities : JSON.stringify(body.amenities)) : null,
          sport: body.sport || "fotbal",
          surface: body.surface || "Sintetic",
          capacity: body.capacity !== undefined && body.capacity !== null && body.capacity !== "" ? parseInt(body.capacity) : 100,
          floodlights: body.floodlights !== undefined ? Boolean(body.floodlights) : true,
          pricePerHour: body.pricePerHour !== undefined && body.pricePerHour !== null && body.pricePerHour !== "" ? parseInt(body.pricePerHour) : null,
          imageUrl: body.imageUrl || null,
          galleryImages: body.galleryImages ? (typeof body.galleryImages === "string" ? body.galleryImages : JSON.stringify(body.galleryImages)) : null,
          ads: body.ads ? (typeof body.ads === "string" ? body.ads : JSON.stringify(body.ads)) : null,
          announcements: body.announcements ? (typeof body.announcements === "string" ? body.announcements : JSON.stringify(body.announcements)) : null,
          tickerText: body.tickerText || null,
          tickerActive: Boolean(body.tickerActive),
          tickerSpeed: body.tickerSpeed ? parseInt(body.tickerSpeed) : 20,
          calendarSyncUrl: body.calendarSyncUrl || null,
        },
      });
    } else {
      venue = await prisma.venue.update({
        where: { id: venue.id },
        data: {
          name: newName,
          location: body.location !== undefined ? body.location.trim() : venue.location,
          address: body.address !== undefined ? (body.address ? body.address.trim() : null) : venue.address,
          specs: body.specs !== undefined ? (body.specs ? body.specs.trim() : null) : venue.specs,
          amenities: body.amenities !== undefined ? (typeof body.amenities === "string" ? body.amenities : JSON.stringify(body.amenities)) : venue.amenities,
          sport: body.sport !== undefined ? body.sport : venue.sport,
          surface: body.surface !== undefined ? body.surface : venue.surface,
          capacity: body.capacity !== undefined ? parseInt(body.capacity) : venue.capacity,
          floodlights: body.floodlights !== undefined ? Boolean(body.floodlights) : venue.floodlights,
          pricePerHour: body.pricePerHour !== undefined ? (body.pricePerHour ? parseInt(body.pricePerHour) : null) : venue.pricePerHour,
          imageUrl: body.imageUrl !== undefined ? body.imageUrl : venue.imageUrl,
          galleryImages: body.galleryImages !== undefined ? (typeof body.galleryImages === "string" ? body.galleryImages : JSON.stringify(body.galleryImages)) : venue.galleryImages,
          ads: body.ads !== undefined ? (typeof body.ads === "string" ? body.ads : JSON.stringify(body.ads)) : venue.ads,
          announcements: body.announcements !== undefined ? (typeof body.announcements === "string" ? body.announcements : JSON.stringify(body.announcements)) : venue.announcements,
          tickerText: body.tickerText !== undefined ? body.tickerText : venue.tickerText,
          tickerActive: body.tickerActive !== undefined ? Boolean(body.tickerActive) : venue.tickerActive,
          tickerSpeed: body.tickerSpeed !== undefined ? parseInt(body.tickerSpeed) : venue.tickerSpeed,
          calendarSyncUrl: body.calendarSyncUrl !== undefined ? body.calendarSyncUrl : venue.calendarSyncUrl,
          ...(validOwnerId && !venue.ownerId ? { ownerId: validOwnerId } : {}),
        },
      });

      // Update associated match venue string if the venue name was modified
      if (oldName && oldName !== newName) {
        await prisma.match.updateMany({
          where: { venue: oldName },
          data: { venue: newName },
        });
      }
    }

    return NextResponse.json({ venue, success: true });
  } catch (error: any) {
    console.error("Arena save error:", error);
    return NextResponse.json(
      { error: `Salvarea arenei a eșuat: ${error?.message || "eroare necunoscută"}` },
      { status: 500 }
    );
  }
}

