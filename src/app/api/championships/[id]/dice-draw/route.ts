import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const championship = await prisma.championship.findUnique({
    where: { id: ctx.params.id },
    include: { teams: true },
  });

  if (!championship) {
    return NextResponse.json({ error: "Campionatul nu a fost găsit" }, { status: 404 });
  }

  // Only organizer or championship owner can roll dice
  const isOrganizer = user.role === "organizer" || championship.ownerId === user.id;
  if (!isOrganizer) {
    return NextResponse.json(
      { error: "Acces interzis: Doar organizatorul poate declanșa tragerea la sorți cu zaruri." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const teamIds: string[] = body.teamIds || championship.teams.map((t) => t.id);

  if (teamIds.length < 2) {
    return NextResponse.json(
      { error: "Ai nevoie de cel puțin 2 echipe pentru tragerea la sorți cu zaruri." },
      { status: 400 }
    );
  }

  // Query real registered referees & venues from database for dynamic random distribution
  const dbReferees = await prisma.user.findMany({
    where: { role: "referee" },
    select: { name: true, refereeBadge: true },
  });

  const dbVenues = await prisma.venue.findMany({
    select: { name: true },
  });

  const refereesList = dbReferees.length > 0
    ? dbReferees.map((r) => r.name || "Arbitru Oficial")
    : body.referees || ["Cristian Balaj - Arbitru  ", "István Kovács - Arbitru UEFA"];

  const venuesList = dbVenues.length > 0
    ? dbVenues.map((v) => v.name)
    : body.venues || ["Arena Națională", "Cluj Arena", "Stadionul Steaua Ghencea"];

  // Shuffle teams randomly (Fisher-Yates Dice algorithm)
  const shuffledTeams = [...teamIds];
  for (let i = shuffledTeams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
  }

  // Shuffle referees randomly so they are fairly distributed across matches
  const shuffledReferees = [...refereesList];
  for (let i = shuffledReferees.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledReferees[i], shuffledReferees[j]] = [shuffledReferees[j], shuffledReferees[i]];
  }

  // Delete existing unplayed matches if requested
  if (body.clearExisting) {
    await prisma.match.deleteMany({
      where: {
        championshipId: championship.id,
        status: "scheduled",
      },
    });
  }

  // Generate Knockout pairing matches
  const createdMatches = [];
  const now = Date.now();

  for (let i = 0; i < shuffledTeams.length - 1; i += 2) {
    const homeId = shuffledTeams[i];
    const awayId = shuffledTeams[i + 1];
    if (!homeId || !awayId) continue;

    const matchIdx = Math.floor(i / 2);
    const assignedVenue = venuesList[matchIdx % venuesList.length];
    const assignedReferee = shuffledReferees[matchIdx % shuffledReferees.length];

    const match = await prisma.match.create({
      data: {
        championshipId: championship.id,
        homeTeamId: homeId,
        awayTeamId: awayId,
        scheduledAt: new Date(now + matchIdx * 86400000 + 3600000),
        round: 1,
        stage: "quarter_final",
        bracketIndex: matchIdx,
        status: "scheduled",
        venue: assignedVenue,
        referee: assignedReferee,
        notes: `Generat prin Tragere la Sorți cu Zaruri 🎲 (Seed #${matchIdx + 1})`,
      },
    });
    createdMatches.push(match);
  }

  return NextResponse.json({
    ok: true,
    message: `Au fost generate ${createdMatches.length} meciuri, iar arbitrii și arenele au fost distribuite aleatoriu!`,
    matches: createdMatches,
  });
}
