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

  // Find venue owned by this user
  let venue = await prisma.venue.findFirst({
    where: { ownerId: userId },
  });

  // If none exists yet, create or assign default venue for demo arena owner
  if (!venue) {
    if (userRole === "arena_owner" || userRole === "organizer") {
      venue = await prisma.venue.findFirst({
        where: { name: { contains: "Vasport" } },
      });

      if (venue) {
        venue = await prisma.venue.update({
          where: { id: venue.id },
          data: { ownerId: userId },
        });
      } else {
        venue = await prisma.venue.create({
          data: {
            ownerId: userId,
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
            tickerText: "🔥 Rezervări disponibile pentru weekend! Contactează recepția arenei la 0722 000 111 pentru detalii și promoții.",
            tickerActive: true,
            tickerSpeed: 18,
          },
        });
      }
    }
  }

  return NextResponse.json({ venue });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();

  let venue = await prisma.venue.findFirst({
    where: { ownerId: userId },
  });

  if (!venue) {
    // If not found, create new venue for this owner
    venue = await prisma.venue.create({
      data: {
        ownerId: userId,
        name: body.name || "Arena Mea",
        location: body.location || "Timișoara",
        address: body.address || null,
        specs: body.specs || null,
        amenities: body.amenities ? JSON.stringify(body.amenities) : null,
        sport: body.sport || "fotbal",
        surface: body.surface || "Sintetic",
        capacity: body.capacity ? parseInt(body.capacity) : 100,
        floodlights: body.floodlights !== undefined ? Boolean(body.floodlights) : true,
        pricePerHour: body.pricePerHour ? parseInt(body.pricePerHour) : null,
        imageUrl: body.imageUrl || null,
        ads: body.ads ? JSON.stringify(body.ads) : null,
        announcements: body.announcements ? JSON.stringify(body.announcements) : null,
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
        name: body.name !== undefined ? body.name : venue.name,
        location: body.location !== undefined ? body.location : venue.location,
        address: body.address !== undefined ? body.address : venue.address,
        specs: body.specs !== undefined ? body.specs : venue.specs,
        amenities: body.amenities !== undefined ? JSON.stringify(body.amenities) : venue.amenities,
        sport: body.sport !== undefined ? body.sport : venue.sport,
        surface: body.surface !== undefined ? body.surface : venue.surface,
        capacity: body.capacity !== undefined ? parseInt(body.capacity) : venue.capacity,
        floodlights: body.floodlights !== undefined ? Boolean(body.floodlights) : venue.floodlights,
        pricePerHour: body.pricePerHour !== undefined ? (body.pricePerHour ? parseInt(body.pricePerHour) : null) : venue.pricePerHour,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : venue.imageUrl,
        ads: body.ads !== undefined ? JSON.stringify(body.ads) : venue.ads,
        announcements: body.announcements !== undefined ? JSON.stringify(body.announcements) : venue.announcements,
        tickerText: body.tickerText !== undefined ? body.tickerText : venue.tickerText,
        tickerActive: body.tickerActive !== undefined ? Boolean(body.tickerActive) : venue.tickerActive,
        tickerSpeed: body.tickerSpeed !== undefined ? parseInt(body.tickerSpeed) : venue.tickerSpeed,
        calendarSyncUrl: body.calendarSyncUrl !== undefined ? body.calendarSyncUrl : venue.calendarSyncUrl,
      },
    });
  }

  return NextResponse.json({ venue, success: true });
}
