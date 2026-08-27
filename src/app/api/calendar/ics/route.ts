import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, "");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  const venueId = searchParams.get("venueId");
  const refereeName = searchParams.get("referee");

  try {
    let events: Array<{
      id: string;
      title: string;
      description: string;
      location: string;
      startDate: Date;
      endDate: Date;
    }> = [];

    if (matchId) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { homeTeam: true, awayTeam: true, championship: true },
      });

      if (match) {
        const start = new Date(match.scheduledAt);
        const end = new Date(start.getTime() + 90 * 60 * 1000); // 90 mins match
        events.push({
          id: match.id,
          title: `Meci: ${match.homeTeam.name} vs ${match.awayTeam.name}`,
          description: `Meci din ${match.championship.name} (${match.stage || "Etapă"}). Arbitru: ${match.referee || "Nedesemnat"}.`,
          location: match.venue || "Bază Sportivă Omologată",
          startDate: start,
          endDate: end,
        });
      }
    } else if (venueId) {
      const venue = await prisma.venue.findUnique({ where: { id: venueId } });
      if (venue) {
        const matches = await prisma.match.findMany({
          where: { venue: venue.name },
          include: { homeTeam: true, awayTeam: true, championship: true },
          take: 50,
          orderBy: { scheduledAt: "asc" },
        });

        events = matches.map((m) => {
          const start = new Date(m.scheduledAt);
          const end = new Date(start.getTime() + 90 * 60 * 1000);
          return {
            id: m.id,
            title: `[Rezervare Arenă] ${m.homeTeam.name} vs ${m.awayTeam.name}`,
            description: `Turneu: ${m.championship.name}. Suprafață: ${venue.surface}.`,
            location: venue.address || venue.name,
            startDate: start,
            endDate: end,
          };
        });
      }
    } else if (refereeName) {
      const matches = await prisma.match.findMany({
        where: { referee: refereeName },
        include: { homeTeam: true, awayTeam: true, championship: true },
        take: 50,
        orderBy: { scheduledAt: "asc" },
      });

      events = matches.map((m) => {
        const start = new Date(m.scheduledAt);
        const end = new Date(start.getTime() + 90 * 60 * 1000);
        return {
          id: m.id,
          title: `[Delegare Arbitraj] ${m.homeTeam.name} vs ${m.awayTeam.name}`,
          description: `Delegare meci   în ${m.championship.name}. Arenă: ${m.venue || "TBD"}.`,
          location: m.venue || "TBD",
          startDate: start,
          endDate: end,
        };
      });
    }

    if (events.length === 0 && !matchId && !venueId && !refereeName) {
      // Fallback sample event only for the generic calendar endpoint.
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      events.push({
        id: "sample-event",
        title: "Eveniment Ligue Pro",
        description: "Calendar   meciuri și delegări Ligue Pro",
        location: "România",
        startDate: now,
        endDate: end,
      });
    }

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ligue Pro Romania//Calendar Generator//RO",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    for (const ev of events) {
      icsLines.push(
        "BEGIN:VEVENT",
        `UID:${ev.id}@liguepro.ro`,
        `DTSTAMP:${formatDateToICS(new Date())}`,
        `DTSTART:${formatDateToICS(ev.startDate)}`,
        `DTEND:${formatDateToICS(ev.endDate)}`,
        `SUMMARY:${ev.title}`,
        `DESCRIPTION:${ev.description}`,
        `LOCATION:${ev.location}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    }

    icsLines.push("END:VCALENDAR");

    const icsContent = icsLines.join("\r\n");

    return new NextResponse(icsContent, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="ligue-pro-calendar.ics"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Eroare la generarea fișierului ICS" }, { status: 500 });
  }
}
