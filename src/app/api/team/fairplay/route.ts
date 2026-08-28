import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardManagerXp } from "@/lib/managerXp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const body = await req.json();
    const {
      teamId,
      matchId,
      fairPlayRating, // 1 - 5
      parentConductRating, // 1 - 5
      refereeRating, // 1 - 5
      comments,
      homeScore,
      awayScore,
    } = body;

    if (!teamId) {
      return NextResponse.json({ error: "ID echipă lipsă" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
    }

    const ratingVal = Number(fairPlayRating) || 5;
    const currentScore = team.fairPlayScore || 5.0;
    const currentCount = team.fairPlayReportsCount || 0;
    const newCount = currentCount + 1;
    const newAvgScore = ((currentScore * currentCount) + ratingVal) / newCount;

    await prisma.team.update({
      where: { id: teamId },
      data: {
        fairPlayScore: parseFloat(newAvgScore.toFixed(2)),
        fairPlayReportsCount: newCount,
      },
    });

    // Update match scores if provided
    let scoreAwarded = false;
    if (matchId && homeScore !== undefined && awayScore !== undefined) {
      await prisma.match.update({
        where: { id: matchId },
        data: {
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
          status: "finished",
        },
      });

      // Award +20 XP for uploading match score
      await awardManagerXp((session.user as any).id, "score_uploaded", {
        teamName: team.name,
        matchId,
      });
      scoreAwarded = true;
    }

    // Award +50 XP for completing the Fair-Play & Referee Report
    const xpResult = await awardManagerXp((session.user as any).id, "fair_play_report", {
      teamName: team.name,
      matchId: matchId || undefined,
      notes: comments || undefined,
    });

    return NextResponse.json({
      ok: true,
      message: `Raportul Fair-Play a fost înregistrat cu succes! Ai primit +50 XP${scoreAwarded ? " și +20 XP pentru scor" : ""}!`,
      xpResult,
      fairPlayScore: newAvgScore,
    });
  } catch (error: any) {
    console.error("Error submitting fair play report:", error);
    return NextResponse.json({ error: "Eroare la trimiterea raportului" }, { status: 500 });
  }
}
