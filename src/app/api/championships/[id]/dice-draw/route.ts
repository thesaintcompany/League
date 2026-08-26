import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { isOrganizer } from "@/lib/permissions";

export async function GET(
  req: Request,
  ctx: { params: { id: string } }
) {
  const championship = await prisma.championship.findUnique({
    where: { id: ctx.params.id },
    select: {
      id: true,
      name: true,
      isBracketPublished: true,
      diceRollCount: true,
    },
  });

  if (!championship) {
    return NextResponse.json({ error: "Campionatul nu a fost găsit" }, { status: 404 });
  }

  const rollCount = championship.diceRollCount || 0;
  const isPublished = Boolean(championship.isBracketPublished);
  const rollsLeft = isPublished ? 0 : Math.max(0, 3 - rollCount);
  const isLocked = isPublished || rollCount >= 3;

  return NextResponse.json({
    ok: true,
    isBracketPublished: isPublished,
    diceRollCount: rollCount,
    rollsLeft,
    isLocked,
    maxRolls: 3,
    lockReason: isPublished
      ? "Harta meciurilor este publicată oficial"
      : rollCount >= 3
      ? "A fost atinsă limita maximă de 3 aruncări"
      : null,
  });
}

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

  // Only organizer, super_admin, or championship owner can roll dice
  const canRoll = isOrganizer(user) || championship.ownerId === user.id;
  if (!canRoll) {
    return NextResponse.json(
      { error: "Acces interzis: Doar organizatorul poate declanșa tragerea la sorți cu zaruri." },
      { status: 403 }
    );
  }

  // RULE 1: If bracket / mindmap is already published, NO DICE ROLLS ALLOWED
  if (championship.isBracketPublished) {
    return NextResponse.json(
      {
        error:
          "Harta meciurilor este deja publicată oficial. Nu se mai pot arunca zarurile pentru un campionat cu harta publicată!",
        isLocked: true,
        reason: "Harta este deja publică",
      },
      { status: 400 }
    );
  }

  // RULE 2: Maximum 3 dice rolls allowed before publishing
  const currentRolls = championship.diceRollCount || 0;
  if (currentRolls >= 3) {
    return NextResponse.json(
      {
        error:
          "Ai atins numărul maxim de 3 trageri la sorți cu zaruri. Harta a fost blocată definitiv!",
        isLocked: true,
        diceRollCount: currentRolls,
        rollsLeft: 0,
      },
      { status: 400 }
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
    where: { isActive: true },
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

  const isInstant = Boolean(body.instant || body.disableAnnouncements);

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
        notes: isInstant
          ? `Generat prin Tragere la Sorți Instantă ⚡ (Anunțuri Zaruri Dezactivate • Seed #${matchIdx + 1})`
          : `Generat prin Tragere la Sorți cu Zaruri 🎲 (Aruncarea #${currentRolls + 1}/3 - Seed #${matchIdx + 1})`,
      },
    });
    createdMatches.push(match);
  }

  // Increment dice roll count
  const nextRollCount = currentRolls + 1;
  await prisma.championship.update({
    where: { id: championship.id },
    data: {
      diceRollCount: nextRollCount,
    },
  });

  const rollsRemaining = Math.max(0, 3 - nextRollCount);

  return NextResponse.json({
    ok: true,
    diceRollCount: nextRollCount,
    rollsLeft: rollsRemaining,
    isLocked: nextRollCount >= 3,
    isInstant,
    announcementsDisabled: isInstant,
    message: isInstant
      ? `⚡ Tragere la sorți instantă efectuată cu succes! Anunțurile automate cu zaruri au fost DEZACTIVATE (${nextRollCount}/3 aruncări utilizate).`
      : `Tragere la sorți cu zaruri efectuată cu succes! (${nextRollCount}/3 aruncări utilizate • Mai ai ${rollsRemaining} ${rollsRemaining === 1 ? "aruncare" : "aruncări"} disponibile).`,
    matches: createdMatches,
  });
}
