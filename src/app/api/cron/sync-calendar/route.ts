import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseICSDate(d: string): Date {
  const clean = d.replace(/[\r\n]/g, "").trim();
  if (clean.includes("T")) {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    const h = clean.substring(9, 11);
    const min = clean.substring(11, 13);
    const s = clean.substring(13, 15);
    const isUtc = clean.endsWith("Z");
    return new Date(`${y}-${m}-${day}T${h}:${min}:${s}${isUtc ? "Z" : ""}`);
  } else {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    return new Date(`${y}-${m}-${day}T00:00:00Z`);
  }
}

function parseICS(icsData: string) {
  const events = [];
  const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi;
  let match;
  while ((match = veventRegex.exec(icsData)) !== null) {
    const eventBlock = match[1];

    const dtstartMatch = eventBlock.match(/DTSTART(?:;[^:]+)?:(.*)/i);
    const dtendMatch = eventBlock.match(/DTEND(?:;[^:]+)?:(.*)/i);
    const summaryMatch = eventBlock.match(/SUMMARY:(.*)/i);

    if (dtstartMatch && dtendMatch) {
      try {
        const startTime = parseICSDate(dtstartMatch[1]);
        const endTime = parseICSDate(dtendMatch[1]);
        const title = summaryMatch ? summaryMatch[1].trim() : "Ocupat Extern";
        
        // Basic validation
        if (!isNaN(startTime.getTime()) && !isNaN(endTime.getTime())) {
          events.push({ title, startTime, endTime });
        }
      } catch (e) {
        // Ignore malformed dates
      }
    }
  }
  return events;
}

export async function GET(request: Request) {
  try {
    // 1. Fetch all venues that have an ICS sync URL
    const venues = await prisma.venue.findMany({
      where: {
        calendarSyncUrl: {
          not: null,
          notIn: [""],
        },
      },
    });

    let syncCount = 0;
    let errorCount = 0;

    for (const venue of venues) {
      if (!venue.calendarSyncUrl) continue;

      try {
        // 2. Fetch the ICS data
        const res = await fetch(venue.calendarSyncUrl, {
          headers: {
            "User-Agent": "LeagueHub Calendar Sync/1.0",
          },
        });

        if (!res.ok) {
          errorCount++;
          continue;
        }

        const icsData = await res.text();

        // 3. Parse the events
        const externalEvents = parseICS(icsData);

        // Filter events that are in the future or within the last 2 days
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const validEvents = externalEvents.filter((ev) => ev.endTime >= cutoffDate);

        // 4. Update the DB: 
        // Best approach is to delete all existing blocked slots for this venue
        // and re-insert them, as it's a full sync and we don't have stable IDs.
        await prisma.venueBlockedSlot.deleteMany({
          where: { venueId: venue.id },
        });

        if (validEvents.length > 0) {
          await prisma.venueBlockedSlot.createMany({
            data: validEvents.map((ev) => ({
              venueId: venue.id,
              title: ev.title.substring(0, 100), // Ensure it fits if there's a limit, though schema uses String
              startTime: ev.startTime,
              endTime: ev.endTime,
            })),
          });
        }
        
        syncCount++;
      } catch (err) {
        console.error(`Failed to sync calendar for venue ${venue.id}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronizare completă. Succes: ${syncCount}. Erori: ${errorCount}.`,
      syncedVenues: syncCount,
    });
  } catch (error: any) {
    console.error("Cron Calendar Sync Error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la rularea cron job-ului." },
      { status: 500 }
    );
  }
}
