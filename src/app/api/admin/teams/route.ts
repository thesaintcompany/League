import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";
import { logAuditAction, extractClientInfo } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const sport = searchParams.get("sport");
    const status = searchParams.get("status");
    const championshipId = searchParams.get("championshipId");

    const whereClause: any = {};

    if (sport && sport !== "all") {
      whereClause.sport = { contains: sport };
    }

    if (championshipId && championshipId !== "all") {
      whereClause.championshipId = championshipId;
    }

    if (status && status !== "all") {
      if (status === "archived") {
        whereClause.OR = [{ isArchived: true }, { status: "archived" }];
      } else {
        whereClause.status = status;
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { shortName: { contains: search } },
        { homeArena: { contains: search } },
        { managerEmail: { contains: search } },
        { manager: { name: { contains: search } } },
        { manager: { email: { contains: search } } },
        { championship: { name: { contains: search } } },
      ];
    }

    const teams = await prisma.team.findMany({
      where: whereClause,
      include: {
        championship: {
          select: {
            id: true,
            name: true,
            sport: true,
            season: true,
            status: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        players: {
          select: {
            id: true,
            name: true,
            number: true,
            position: true,
            status: true,
            goals: true,
            assists: true,
            yellowCards: true,
            redCards: true,
          },
          orderBy: [{ isStarter: "desc" }, { number: "asc" }],
        },
        _count: {
          select: {
            players: true,
            homeMatches: true,
            awayMatches: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      teams,
      totalCount: teams.length,
    });
  } catch (err: any) {
    console.error("Admin Teams GET Error:", err);
    return NextResponse.json(
      { error: "Eroare la preluarea echipelor: " + (err.message || "Eroare server") },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const clientInfo = extractClientInfo(req);

  try {
    const body = await req.json();
    const {
      name,
      shortName,
      color = "#84cc16",
      logoUrl,
      coverPhotoUrl,
      championshipId,
      managerEmail,
      headCoach,
      assistantCoach,
      medic,
      fitnessCoach,
      formation = "4-3-3",
      homeArena,
      sport = "fotbal",
      description,
      sponsors,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Numele echipei este obligatoriu." }, { status: 400 });
    }

    if (!championshipId) {
      return NextResponse.json({ error: "Selectarea unui campionat este obligatorie." }, { status: 400 });
    }

    const champ = await prisma.championship.findUnique({ where: { id: championshipId } });
    if (!champ) {
      return NextResponse.json({ error: "Campionatul specificat nu există." }, { status: 404 });
    }

    let managerId: string | null = null;
    if (managerEmail) {
      const userManager = await prisma.user.findUnique({
        where: { email: managerEmail.toLowerCase().trim() },
      });
      if (userManager) {
        managerId = userManager.id;
      }
    }

    const code =
      shortName?.trim().toUpperCase().slice(0, 3) ||
      name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() ||
      "FCB";

    const newTeam = await prisma.team.create({
      data: {
        name: name.trim(),
        shortName: code,
        color,
        logoUrl: logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
        coverPhotoUrl: coverPhotoUrl || null,
        championshipId,
        managerId,
        managerEmail: managerEmail ? managerEmail.toLowerCase().trim() : null,
        headCoach: headCoach || null,
        assistantCoach: assistantCoach || null,
        medic: medic || null,
        fitnessCoach: fitnessCoach || null,
        formation,
        homeArena: homeArena || null,
        sport: sport || champ.sport || "fotbal",
        description: description || null,
        sponsors: sponsors ? (typeof sponsors === "string" ? sponsors : JSON.stringify(sponsors)) : null,
        status: "active",
        isArchived: false,
      },
      include: {
        championship: { select: { id: true, name: true, sport: true } },
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { players: true, homeMatches: true, awayMatches: true } },
      },
    });

    await logAuditAction({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role || "super_admin",
      action: "team_create_superadmin",
      status: "success",
      details: `SuperAdmin a creat echipa "${newTeam.name}" (${newTeam.shortName}) în campionatul "${champ.name}"`,
      ...clientInfo,
    });

    return NextResponse.json({
      message: "Echipa a fost creată cu succes!",
      team: newTeam,
    });
  } catch (err: any) {
    console.error("Admin Teams POST Error:", err);
    return NextResponse.json(
      { error: "Eroare la crearea echipei: " + (err.message || "Eroare server") },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const clientInfo = extractClientInfo(req);

  try {
    const body = await req.json();
    const { teamId, action } = body;

    if (!teamId) {
      return NextResponse.json({ error: "ID-ul echipei este obligatoriu." }, { status: 400 });
    }

    const existing = await prisma.team.findUnique({
      where: { id: teamId },
      include: { championship: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Echipa nu a fost găsită." }, { status: 404 });
    }

    let updatedTeam;

    if (action === "archive") {
      const newArchived = body.isArchived !== undefined ? Boolean(body.isArchived) : !existing.isArchived;
      updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          isArchived: newArchived,
          status: newArchived ? "archived" : "active",
        },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: newArchived ? "team_archive" : "team_unarchive",
        status: "success",
        details: `SuperAdmin a ${newArchived ? "arhivat" : "dezarhivat"} echipa "${existing.name}"`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: newArchived ? "Echipa a fost marcată ca arhivată." : "Echipa a fost dezarhivată și reactivată.",
        team: updatedTeam,
      });
    }

    if (action === "suspend") {
      updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          status: "suspended",
        },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: "team_suspend",
        status: "success",
        details: `SuperAdmin a suspendat echipa "${existing.name}"`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: "Echipa a fost suspendată.",
        team: updatedTeam,
      });
    }

    if (action === "activate") {
      updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          status: "active",
          isArchived: false,
        },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: "team_activate",
        status: "success",
        details: `SuperAdmin a reactivat echipa "${existing.name}"`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: "Echipa a fost reactivată.",
        team: updatedTeam,
      });
    }

    if (action === "change_championship") {
      const { newChampionshipId } = body;
      if (!newChampionshipId) {
        return NextResponse.json({ error: "Noul ID de campionat este obligatoriu." }, { status: 400 });
      }

      const targetChamp = await prisma.championship.findUnique({ where: { id: newChampionshipId } });
      if (!targetChamp) {
        return NextResponse.json({ error: "Campionatul destinație nu există." }, { status: 404 });
      }

      updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          championshipId: targetChamp.id,
          sport: targetChamp.sport,
        },
        include: { championship: true },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: "team_change_championship",
        status: "success",
        details: `SuperAdmin a mutat echipa "${existing.name}" din "${existing.championship.name}" în "${targetChamp.name}"`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: `Echipa "${existing.name}" a fost mutată cu succes în campionatul "${targetChamp.name}".`,
        team: updatedTeam,
      });
    }

    // Default: General Edit
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.shortName !== undefined) updateData.shortName = body.shortName.trim().toUpperCase();
    if (body.color !== undefined) updateData.color = body.color;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
    if (body.coverPhotoUrl !== undefined) updateData.coverPhotoUrl = body.coverPhotoUrl;
    if (body.sport !== undefined) updateData.sport = body.sport.toLowerCase();
    if (body.headCoach !== undefined) updateData.headCoach = body.headCoach;
    if (body.assistantCoach !== undefined) updateData.assistantCoach = body.assistantCoach;
    if (body.medic !== undefined) updateData.medic = body.medic;
    if (body.fitnessCoach !== undefined) updateData.fitnessCoach = body.fitnessCoach;
    if (body.formation !== undefined) updateData.formation = body.formation;
    if (body.homeArena !== undefined) updateData.homeArena = body.homeArena;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.fairPlayScore !== undefined) updateData.fairPlayScore = parseFloat(body.fairPlayScore) || 5.0;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isArchived !== undefined) updateData.isArchived = Boolean(body.isArchived);
    if (body.subscriptionActive !== undefined) updateData.subscriptionActive = Boolean(body.subscriptionActive);

    if (body.sponsors !== undefined) {
      updateData.sponsors = typeof body.sponsors === "string" ? body.sponsors : JSON.stringify(body.sponsors);
    }

    if (body.championshipId !== undefined && body.championshipId !== existing.championshipId) {
      const champCheck = await prisma.championship.findUnique({ where: { id: body.championshipId } });
      if (champCheck) {
        updateData.championshipId = body.championshipId;
      }
    }

    if (body.managerEmail !== undefined) {
      const emailClean = body.managerEmail ? body.managerEmail.toLowerCase().trim() : null;
      updateData.managerEmail = emailClean;
      if (emailClean) {
        const u = await prisma.user.findUnique({ where: { email: emailClean } });
        updateData.managerId = u ? u.id : null;
      } else {
        updateData.managerId = null;
      }
    }

    updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
      include: {
        championship: { select: { id: true, name: true, sport: true } },
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { players: true, homeMatches: true, awayMatches: true } },
      },
    });

    await logAuditAction({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role || "super_admin",
      action: "team_edit_superadmin",
      status: "success",
      details: `SuperAdmin a actualizat datele echipei "${updatedTeam.name}"`,
      ...clientInfo,
    });

    return NextResponse.json({
      message: "Datele echipei au fost actualizate cu succes!",
      team: updatedTeam,
    });
  } catch (err: any) {
    console.error("Admin Teams PATCH Error:", err);
    return NextResponse.json(
      { error: "Eroare la actualizarea echipei: " + (err.message || "Eroare server") },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const clientInfo = extractClientInfo(req);

  try {
    const { searchParams } = new URL(req.url);
    let teamId = searchParams.get("teamId");

    if (!teamId) {
      const body = await req.json().catch(() => ({}));
      teamId = body.teamId;
    }

    if (!teamId) {
      return NextResponse.json({ error: "ID-ul echipei este obligatoriu." }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        championship: true,
        _count: { select: { players: true, homeMatches: true, awayMatches: true } },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Echipa nu a fost găsită." }, { status: 404 });
    }

    // 1. Delete players belonging to this team
    await prisma.player.deleteMany({ where: { teamId } });

    // 2. Delete team invitations & invites
    await prisma.teamInvitation.deleteMany({ where: { teamId } });
    await prisma.externalInvite.deleteMany({ where: { teamId } });
    await prisma.teamNews.deleteMany({ where: { teamId } });

    // 3. Delete matches where team played if any scheduled
    await prisma.match.deleteMany({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
    });

    // 4. Delete team
    await prisma.team.delete({ where: { id: teamId } });

    await logAuditAction({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role || "super_admin",
      action: "team_delete_superadmin",
      status: "success",
      details: `SuperAdmin a șters definitiv echipa "${team.name}" din campionatul "${team.championship.name}"`,
      ...clientInfo,
    });

    return NextResponse.json({
      message: `Echipa "${team.name}" a fost ștearsă din platformă.`,
      deletedId: teamId,
    });
  } catch (err: any) {
    console.error("Admin Team DELETE Error:", err);
    return NextResponse.json(
      { error: "Eroare la ștergerea echipei: " + (err.message || "Eroare server") },
      { status: 500 }
    );
  }
}
