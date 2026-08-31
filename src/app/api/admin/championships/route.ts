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
    const format = searchParams.get("format");

    const whereClause: any = {};

    if (sport && sport !== "all") {
      whereClause.sport = { contains: sport };
    }

    if (status && status !== "all") {
      if (status === "archived") {
        whereClause.OR = [{ isArchived: true }, { status: "archived" }];
      } else if (status === "cancelled") {
        whereClause.OR = [{ isCancelled: true }, { status: "cancelled" }];
      } else {
        whereClause.status = status;
      }
    }

    if (format && format !== "all") {
      whereClause.format = format;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { county: { contains: search } },
        { city: { contains: search } },
        { shareCode: { contains: search } },
        { owner: { name: { contains: search } } },
        { owner: { email: { contains: search } } },
      ];
    }

    const championships = await prisma.championship.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
        teams: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
            status: true,
            isArchived: true,
            _count: {
              select: {
                players: true,
              },
            },
          },
        },
        _count: {
          select: {
            teams: true,
            matches: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      championships,
      totalCount: championships.length,
    });
  } catch (err: any) {
    console.error("Admin Championships GET Error:", err);
    return NextResponse.json(
      { error: "Eroare la preluarea campionatelor: " + (err.message || "Eroare server") },
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
      sport = "fotbal",
      format = "round_robin",
      season = "2026-2027",
      startDate,
      endDate,
      description,
      scope = "national",
      county,
      city,
      logoUrl,
      silentDice = false,
      refereeEnabled = true,
      singleVenueEnabled = false,
      defaultVenue,
      ownerId,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Numele campionatului este obligatoriu." }, { status: 400 });
    }

    // Resolve owner
    let targetOwnerId = ownerId;
    if (!targetOwnerId) {
      targetOwnerId = currentUser.id;
    }

    // Verify owner exists
    const ownerExists = await prisma.user.findUnique({ where: { id: targetOwnerId } });
    if (!ownerExists) {
      targetOwnerId = currentUser.id;
    }

    const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "LP";
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const shareCode = `${prefix}-${rand}`;

    const newChamp = await prisma.championship.create({
      data: {
        name: name.trim(),
        sport: sport.toLowerCase(),
        format,
        season,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
        scope,
        county: county || null,
        city: city || null,
        logoUrl: logoUrl || null,
        silentDice: Boolean(silentDice),
        refereeEnabled: Boolean(refereeEnabled),
        singleVenueEnabled: Boolean(singleVenueEnabled),
        defaultVenue: defaultVenue || null,
        shareCode,
        status: "active",
        isArchived: false,
        isCancelled: false,
        ownerId: targetOwnerId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { teams: true, matches: true } },
      },
    });

    await logAuditAction({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role || "super_admin",
      action: "championship_create_superadmin",
      status: "success",
      details: `SuperAdmin a creat campionatul "${newChamp.name}" (${newChamp.shareCode})`,
      ...clientInfo,
    });

    return NextResponse.json({
      message: "Campionatul a fost creat cu succes!",
      championship: newChamp,
    });
  } catch (err: any) {
    console.error("Admin Championship POST Error:", err);
    return NextResponse.json(
      { error: "Eroare la crearea campionatului: " + (err.message || "Eroare server") },
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
    const { championshipId, action } = body;

    if (!championshipId) {
      return NextResponse.json({ error: "ID-ul campionatului este obligatoriu." }, { status: 400 });
    }

    const existing = await prisma.championship.findUnique({
      where: { id: championshipId },
      include: { owner: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Campionatul nu a fost găsit." }, { status: 404 });
    }

    let updatedChamp;

    if (action === "archive") {
      const newArchived = body.isArchived !== undefined ? Boolean(body.isArchived) : !existing.isArchived;
      updatedChamp = await prisma.championship.update({
        where: { id: championshipId },
        data: {
          isArchived: newArchived,
          status: newArchived ? "archived" : "active",
        },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: newArchived ? "championship_archive" : "championship_unarchive",
        status: "success",
        details: `SuperAdmin a ${newArchived ? "arhivat" : "dezarhivat"} campionatul "${existing.name}"`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: newArchived ? "Campionatul a fost arhivat." : "Campionatul a fost dezarhivat și reactivat.",
        championship: updatedChamp,
      });
    }

    if (action === "cancel") {
      const cancellationReason = body.cancellationReason || "Anulat din motive administrative de către SuperAdministrator";
      updatedChamp = await prisma.championship.update({
        where: { id: championshipId },
        data: {
          isCancelled: true,
          status: "cancelled",
          cancellationReason,
        },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: "championship_cancel",
        status: "success",
        details: `SuperAdmin a anulat campionatul "${existing.name}" (Motiv: ${cancellationReason})`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: "Campionatul a fost anulat.",
        championship: updatedChamp,
      });
    }

    if (action === "activate") {
      updatedChamp = await prisma.championship.update({
        where: { id: championshipId },
        data: {
          status: "active",
          isArchived: false,
          isCancelled: false,
          cancellationReason: null,
        },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: "championship_activate",
        status: "success",
        details: `SuperAdmin a reactivat campionatul "${existing.name}"`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: "Campionatul a fost reactivat cu succes!",
        championship: updatedChamp,
      });
    }

    if (action === "reset_dice") {
      updatedChamp = await prisma.championship.update({
        where: { id: championshipId },
        data: {
          diceRollCount: 0,
        },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: "championship_reset_dice",
        status: "success",
        details: `SuperAdmin a resetat numărul de aruncări de zaruri pentru "${existing.name}"`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: "Numărul de aruncări cu zarurile a fost resetat la 0.",
        championship: updatedChamp,
      });
    }

    if (action === "clear_bracket") {
      updatedChamp = await prisma.championship.update({
        where: { id: championshipId },
        data: {
          isBracketPublished: false,
          diceRollCount: 0,
        },
      });

      await prisma.match.deleteMany({
        where: {
          championshipId,
          stage: { in: ["quarter_final", "semi_final", "final", "knockout"] },
          status: "scheduled",
        },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: "championship_clear_bracket",
        status: "success",
        details: `SuperAdmin a resetat tabloul eliminatoriu pentru "${existing.name}"`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: "Tabloul eliminatoriu a fost resetat.",
        championship: updatedChamp,
      });
    }

    if (action === "transfer_owner") {
      const { newOwnerId, newOwnerEmail } = body;
      let targetUser = null;
      if (newOwnerId) {
        targetUser = await prisma.user.findUnique({ where: { id: newOwnerId } });
      } else if (newOwnerEmail) {
        targetUser = await prisma.user.findUnique({ where: { email: newOwnerEmail.toLowerCase().trim() } });
      }

      if (!targetUser) {
        return NextResponse.json({ error: "Utilizatorul destinatar nu a fost găsit." }, { status: 404 });
      }

      updatedChamp = await prisma.championship.update({
        where: { id: championshipId },
        data: {
          ownerId: targetUser.id,
        },
        include: { owner: true },
      });

      await logAuditAction({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userRole: currentUser.role || "super_admin",
        action: "championship_transfer_owner",
        status: "success",
        details: `SuperAdmin a transferat proprietatea campionatului "${existing.name}" către ${targetUser.email}`,
        ...clientInfo,
      });

      return NextResponse.json({
        message: `Proprietatea campionatului a fost transferată către ${targetUser.name || targetUser.email}.`,
        championship: updatedChamp,
      });
    }

    // Default: General Edit
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.sport !== undefined) updateData.sport = body.sport.toLowerCase();
    if (body.format !== undefined) updateData.format = body.format;
    if (body.season !== undefined) updateData.season = body.season;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.scope !== undefined) updateData.scope = body.scope;
    if (body.county !== undefined) updateData.county = body.county;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isArchived !== undefined) updateData.isArchived = Boolean(body.isArchived);
    if (body.isCancelled !== undefined) updateData.isCancelled = Boolean(body.isCancelled);
    if (body.cancellationReason !== undefined) updateData.cancellationReason = body.cancellationReason;
    if (body.silentDice !== undefined) updateData.silentDice = Boolean(body.silentDice);
    if (body.refereeEnabled !== undefined) updateData.refereeEnabled = Boolean(body.refereeEnabled);
    if (body.singleVenueEnabled !== undefined) updateData.singleVenueEnabled = Boolean(body.singleVenueEnabled);
    if (body.defaultVenue !== undefined) updateData.defaultVenue = body.defaultVenue;
    if (body.shareCode !== undefined && body.shareCode) updateData.shareCode = body.shareCode.trim().toUpperCase();

    if (body.ownerId !== undefined && body.ownerId) {
      const ownerCheck = await prisma.user.findUnique({ where: { id: body.ownerId } });
      if (ownerCheck) {
        updateData.ownerId = body.ownerId;
      }
    }

    updatedChamp = await prisma.championship.update({
      where: { id: championshipId },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { teams: true, matches: true } },
      },
    });

    await logAuditAction({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role || "super_admin",
      action: "championship_edit_superadmin",
      status: "success",
      details: `SuperAdmin a editat datele campionatului "${updatedChamp.name}"`,
      ...clientInfo,
    });

    return NextResponse.json({
      message: "Campionatul a fost actualizat cu succes!",
      championship: updatedChamp,
    });
  } catch (err: any) {
    console.error("Admin Championship PATCH Error:", err);
    return NextResponse.json(
      { error: "Eroare la actualizarea campionatului: " + (err.message || "Eroare server") },
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
    let championshipId = searchParams.get("championshipId");

    if (!championshipId) {
      const body = await req.json().catch(() => ({}));
      championshipId = body.championshipId;
    }

    if (!championshipId) {
      return NextResponse.json({ error: "ID-ul campionatului este obligatoriu." }, { status: 400 });
    }

    const champ = await prisma.championship.findUnique({
      where: { id: championshipId },
      include: {
        teams: true,
        matches: true,
      },
    });

    if (!champ) {
      return NextResponse.json({ error: "Campionatul nu a fost găsit." }, { status: 404 });
    }

    // Delete matches
    await prisma.match.deleteMany({ where: { championshipId } });

    // Delete team invitations & external invites
    await prisma.teamInvitation.deleteMany({ where: { championshipId } });
    await prisma.externalInvite.deleteMany({ where: { championshipId } });

    // Delete teams enrolled
    await prisma.team.deleteMany({ where: { championshipId } });

    // Delete championship
    await prisma.championship.delete({ where: { id: championshipId } });

    await logAuditAction({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role || "super_admin",
      action: "championship_delete_superadmin",
      status: "success",
      details: `SuperAdmin a șters definitiv campionatul "${champ.name}" (${champ.sport}, ${champ.teams.length} echipe, ${champ.matches.length} meciuri)`,
      ...clientInfo,
    });

    return NextResponse.json({
      message: `Campionatul "${champ.name}" și toate datele asociate au fost eliminate complet.`,
      deletedId: championshipId,
    });
  } catch (err: any) {
    console.error("Admin Championship DELETE Error:", err);
    return NextResponse.json(
      { error: "Eroare la ștergerea campionatului: " + (err.message || "Eroare server") },
      { status: 500 }
    );
  }
}
