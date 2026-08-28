import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { awardManagerXp } from "@/lib/managerXp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const body = await req.json();
    const { teamId, latitude, longitude, venueName, presentPlayers, notes, matchId } = body;

    if (!teamId) {
      return NextResponse.json({ error: "ID echipă lipsă" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { championship: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
    }

    const checkInTime = new Date();
    const attendanceData = {
      checkedAt: checkInTime.toISOString(),
      managerName: session.user.name || "Manager",
      managerEmail: session.user.email || "",
      venueName: venueName || team.homeArena || "Stadion Oficial",
      latitude: latitude || null,
      longitude: longitude || null,
      matchId: matchId || null,
      notes: notes || "",
      totalPresent: Array.isArray(presentPlayers) ? presentPlayers.filter((p: any) => p.present).length : 0,
      totalRoster: Array.isArray(presentPlayers) ? presentPlayers.length : 0,
      players: presentPlayers || [],
    };

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: {
        lastCheckInAt: checkInTime,
        checkInVenue: venueName || team.homeArena || "Stadion Oficial",
        checkInLatitude: typeof latitude === "number" ? latitude : null,
        checkInLongitude: typeof longitude === "number" ? longitude : null,
        checkInVerified: true,
        attendanceReport: JSON.stringify(attendanceData),
      },
    });

    // Notify team / manager
    await createNotification({
      userId: (session.user as any).id,
      userEmail: session.user.email,
      type: "system",
      title: "Check-in la Stadion Confirmat!",
      message: `Check-in GPS validat la ${venueName || team.homeArena || "teren"}. Raport de prezență generat (${attendanceData.totalPresent} sportivi prezenți). Bifă albastră activată!`,
      teamId: team.id,
      teamName: team.name,
      link: `/teams/${team.id}`,
    });

    // Award +5 XP for Stadium Check-in
    await awardManagerXp((session.user as any).id, "check_in", {
      teamName: team.name,
      matchId: matchId || undefined,
    });

    return NextResponse.json({
      ok: true,
      team: updated,
      attendanceReport: attendanceData,
      message: "Check-in la stadion realizat cu succes! Echipa a primit bifa albastră de verificare.",
    });
  } catch (error: any) {
    console.error("Error in team check-in:", error);
    return NextResponse.json({ error: "Eroare la procesarea check-in-ului" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json({ error: "ID echipă lipsă" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        lastCheckInAt: true,
        checkInVenue: true,
        checkInLatitude: true,
        checkInLongitude: true,
        checkInVerified: true,
        attendanceReport: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
    }

    let report = null;
    if (team.attendanceReport) {
      try {
        report = JSON.parse(team.attendanceReport);
      } catch {
        // parse error fallback
      }
    }

    return NextResponse.json({
      ok: true,
      team,
      attendanceReport: report,
    });
  } catch (error: any) {
    console.error("Error fetching check-in:", error);
    return NextResponse.json({ error: "Eroare la obținerea datelor de check-in" }, { status: 500 });
  }
}
