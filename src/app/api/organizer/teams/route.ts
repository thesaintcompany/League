import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOrganizer } from "@/lib/permissions";
import { isIndividualSport } from "@/lib/constants";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const isSuperAdmin = user.role === "super_admin" || user.role === "superadmin";
  const canAccess = isOrganizer(user) || isSuperAdmin;

  if (!canAccess) {
    return NextResponse.json({ error: "Acces interzis: Doar organizatorii au acces la această pagină." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const selectedChampId = searchParams.get("championshipId");

  // Fetch organizer championships
  const championships = await prisma.championship.findMany({
    where: isSuperAdmin ? {} : { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      sport: true,
      season: true,
      scope: true,
      county: true,
      city: true,
      logoUrl: true,
      isBracketPublished: true,
      diceRollCount: true,
    },
  });

  if (championships.length === 0) {
    return NextResponse.json({ championships: [], teams: [], availableRegisteredTeams: [] });
  }

  const activeChampId = selectedChampId || championships[0].id;

  // Fetch teams enrolled in active championship
  const teams = await prisma.team.findMany({
    where: { championshipId: activeChampId },
    include: {
      manager: { select: { id: true, name: true, email: true, phone: true } },
      _count: { select: { players: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch all registered teams across system that are NOT YET in active championship
  const existingTeamNames = new Set(teams.map((t) => t.name.toLowerCase()));
  const allTeamsInSystem = await prisma.team.findMany({
    where: { championshipId: { not: activeChampId } },
    include: {
      manager: { select: { id: true, name: true, email: true } },
      championship: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const availableRegisteredTeams = allTeamsInSystem.filter(
    (t) => !existingTeamNames.has(t.name.toLowerCase())
  );

  return NextResponse.json({
    activeChampionshipId: activeChampId,
    championships,
    teams,
    availableRegisteredTeams,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const isSuperAdmin = user.role === "super_admin" || user.role === "superadmin";
  if (!isOrganizer(user) && !isSuperAdmin) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, championshipId, name, managerEmail, shortName, color, existingTeamId } = body;

    if (!championshipId) {
      return NextResponse.json({ error: "Selectează un campionat" }, { status: 400 });
    }

    const champ = await prisma.championship.findUnique({
      where: { id: championshipId },
    });

    if (!champ) {
      return NextResponse.json({ error: "Campionatul nu există" }, { status: 404 });
    }

    if (!isSuperAdmin && champ.ownerId !== user.id) {
      return NextResponse.json({ error: "Nu ai dreptul de a modifica acest campionat" }, { status: 403 });
    }

    if (action === "enroll_existing") {
      if (!existingTeamId) {
        return NextResponse.json({ error: "Selectează o echipă din sistem" }, { status: 400 });
      }

      const sourceTeam = await prisma.team.findUnique({
        where: { id: existingTeamId },
      });

      if (!sourceTeam) {
        return NextResponse.json({ error: "Echipa selectată nu a fost găsită" }, { status: 404 });
      }

      const newTeam = await prisma.team.create({
        data: {
          name: sourceTeam.name,
          shortName: sourceTeam.shortName || sourceTeam.name.substring(0, 3).toUpperCase(),
          color: sourceTeam.color || "#84cc16",
          logoUrl: sourceTeam.logoUrl,
          managerId: sourceTeam.managerId,
          managerEmail: sourceTeam.managerEmail,
          championshipId,
        },
      });

      return NextResponse.json({ ok: true, team: newTeam, message: `Echipa "${newTeam.name}" a fost înscrisă în campionat!` });
    }

    // Action: invite_new
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Numele echipei este obligatoriu" }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = managerEmail?.trim() || null;
    const computedShortName = (shortName?.trim() || cleanName.substring(0, 3)).toUpperCase();

    // Check if manager email matches existing registered user
    let matchedManagerId: string | null = null;
    if (cleanEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingUser) {
        matchedManagerId = existingUser.id;
      }
    }

    const createdTeam = await prisma.team.create({
      data: {
        name: cleanName,
        shortName: computedShortName,
        color: color || "#84cc16",
        managerEmail: cleanEmail,
        managerId: matchedManagerId,
        championshipId,
      },
    });

    const isIndividual = isIndividualSport(champ.sport);
    const inviteRole = isIndividual ? "player" : "team_leader";
    const inviteLink = `https://sp.tscquantum.ro/signup?role=${inviteRole}&championshipId=${championshipId}&teamId=${createdTeam.id}&email=${encodeURIComponent(cleanEmail || "")}`;

    return NextResponse.json({
      ok: true,
      team: createdTeam,
      inviteLink,
      message: isIndividual
        ? `Competitorul / Jucătorul "${createdTeam.name}" a fost adăugat. Invitația este pregătită!`
        : `Echipa "${createdTeam.name}" a fost adăugată. Invitația este pregătită!`,
    });
  } catch (err: any) {
    console.error("Error in organizer teams API:", err);
    return NextResponse.json({ error: err.message || "Eroare la procesare" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ error: "ID echipă lipsă" }, { status: 400 });
  }

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { championship: { select: { ownerId: true } } },
    });

    if (!team) {
      return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
    }

    const isSuperAdmin = user.role === "super_admin" || user.role === "superadmin";
    if (!isSuperAdmin && team.championship.ownerId !== user.id) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    await prisma.team.delete({ where: { id: teamId } });

    return NextResponse.json({ ok: true, message: `Echipa "${team.name}" a fost eliminată.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Eroare la eliminare" }, { status: 500 });
  }
}
