import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = session.user as any;

  // Find team managed by this user
  const team = await prisma.team.findFirst({
    where: { managerId: user.id },
    include: {
      championship: true,
      players: {
        include: {
          user: {
            select: { id: true, email: true, image: true, coverPhotoUrl: true },
          },
        },
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
    return NextResponse.json({ team: null });
  }

  const formattedPlayers = (team.players || []).map((p: any) => ({
    ...p,
    image: p.image || p.user?.image || p.user?.coverPhotoUrl || null,
  }));

  return NextResponse.json({ team: { ...team, players: formattedPlayers } });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = session.user as any;
  const isSuper = isSuperAdmin(user);
  const body = await req.json();

  const targetTeamId = body.teamId;
  let team = null;

  if (targetTeamId) {
    team = await prisma.team.findUnique({ where: { id: targetTeamId } });
  } else {
    team = await prisma.team.findFirst({ where: { managerId: user.id } });
  }

  if (!team) {
    return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
  }

  // Authorization check: only the team manager or super admin can edit
  if (team.managerId !== user.id && !isSuper) {
    return NextResponse.json(
      { error: "Acces interzis: Nu aveți permisiunea de a edita această echipă." },
      { status: 403 }
    );
  }

  const updated = await prisma.team.update({
    where: { id: team.id },
    data: {
      name: body.name !== undefined ? body.name : team.name,
      shortName: body.shortName !== undefined ? body.shortName : team.shortName,
      color: body.color !== undefined ? body.color : team.color,
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : team.logoUrl,
      coverPhotoUrl: body.coverPhotoUrl !== undefined ? body.coverPhotoUrl : team.coverPhotoUrl,
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
