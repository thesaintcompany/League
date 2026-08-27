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

  // Find team managed by this user or fallback to first available team
  let team = await prisma.team.findFirst({
    where: { managerId: userId },
    include: {
      championship: true,
      players: {
        orderBy: [{ isStarter: "desc" }, { number: "asc" }],
      },
      homeMatches: {
        include: { awayTeam: true, championship: true },
        orderBy: { scheduledAt: "asc" },
      },
      awayMatches: {
        include: { homeTeam: true, championship: true },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  if (!team) {
    // If no team explicitly assigned yet, assign the first team or create a default team
    team = await prisma.team.findFirst({
      include: {
        championship: true,
        players: {
          orderBy: [{ isStarter: "desc" }, { number: "asc" }],
        },
        homeMatches: {
          include: { awayTeam: true, championship: true },
          orderBy: { scheduledAt: "asc" },
        },
        awayMatches: {
          include: { homeTeam: true, championship: true },
          orderBy: { scheduledAt: "asc" },
        },
      },
    });

    if (team) {
      // Connect this user as manager
      await prisma.team.update({
        where: { id: team.id },
        data: { managerId: userId },
      });
    }
  }

  return NextResponse.json({ team });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();

  let team = await prisma.team.findFirst({
    where: { managerId: userId },
  });

  if (!team && body.teamId) {
    team = await prisma.team.findUnique({
      where: { id: body.teamId },
    });
  }

  if (!team) {
    return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
  }

  const updated = await prisma.team.update({
    where: { id: team.id },
    data: {
      managerId: userId,
      name: body.name !== undefined ? body.name : team.name,
      shortName: body.shortName !== undefined ? body.shortName : team.shortName,
      color: body.color !== undefined ? body.color : team.color,
      description: body.description !== undefined ? body.description : team.description,
      headCoach: body.headCoach !== undefined ? body.headCoach : team.headCoach,
      assistantCoach: body.assistantCoach !== undefined ? body.assistantCoach : team.assistantCoach,
      medic: body.medic !== undefined ? body.medic : team.medic,
      fitnessCoach: body.fitnessCoach !== undefined ? body.fitnessCoach : team.fitnessCoach,
      formation: body.formation !== undefined ? body.formation : team.formation,
      homeArena: body.homeArena !== undefined ? body.homeArena : team.homeArena,
    },
  });

  return NextResponse.json({ ok: true, team: updated });
}
