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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const championship = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
    include: { teams: true },
  });

  if (!championship) {
    return NextResponse.json({ error: "Championship not found" }, { status: 404 });
  }

  const body = await req.json();
  const teamIds: string[] = body.teamIds || championship.teams.map((t) => t.id);
  const venues: string[] = body.venues || ["Arena Națională", "Baza Sportivă Sud"];
  const referees: string[] = body.referees || ["Cristian Balaj - Arbitru FIFA"];

  if (teamIds.length < 2) {
    return NextResponse.json(
      { error: "Ai nevoie de cel puțin 2 echipe pentru tragerea la sorți cu zaruri." },
      { status: 400 }
    );
  }

  // Shuffle teams randomly (Dice roll algorithm)
  const shuffled = [...teamIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
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

  // Generate Knockout or Round-Robin matches
  const createdMatches = [];
  const now = Date.now();

  // Create pairing matches
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    const homeId = shuffled[i];
    const awayId = shuffled[i + 1];
    if (!homeId || !awayId) continue;

    const matchIdx = Math.floor(i / 2);
    const assignedVenue = venues[matchIdx % venues.length];
    const assignedReferee = referees[matchIdx % referees.length];

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
    message: `Au fost generate ${createdMatches.length} meciuri prin tragerea la sorți cu zaruri!`,
    matches: createdMatches,
  });
}
