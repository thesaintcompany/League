import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";
import { createNotification } from "@/lib/notifications";
import { awardManagerXp } from "@/lib/managerXp";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const {
    teamId,
    name,
    number,
    position,
    isStarter,
    email,
    phone,
    image,
    secondaryImage,
    preferredFoot,
    birthDate,
    heightCm,
    weightKg,
    bio,
    goals,
    assists,
    rating,
    yellowCards,
    redCards,
    suspensions,
    status,
  } = body;

  if (!teamId || !name) {
    return NextResponse.json({ error: "Numele și echipa sunt obligatorii" }, { status: 400 });
  }

  const normalizedEmail = email ? email.trim().toLowerCase() : null;

  // Check if a platform user already exists with this email
  let matchedUserId: string | null = null;
  let existingUser: any = null;
  if (normalizedEmail) {
    existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, image: true, coverPhotoUrl: true, phone: true, position: true, jerseyNumber: true },
    });
    if (existingUser) {
      matchedUserId = existingUser.id;
    }
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, name: true, logoUrl: true, managerId: true, championship: { select: { name: true } } },
  });

  if (!team) {
    return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
  }

  const currentUser = session.user as any;
  if (team.managerId !== currentUser.id && !isSuperAdmin(currentUser)) {
    return NextResponse.json(
      { error: "Acces interzis: Doar managerul echipei sau SuperAdmin pot adăuga jucători." },
      { status: 403 }
    );
  }

  const invitationToken = crypto.randomBytes(20).toString("hex");

  // Check if player already exists in this team by email, userId, or name to prevent duplicates
  const existingPlayer = await prisma.player.findFirst({
    where: {
      teamId,
      OR: [
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(matchedUserId ? [{ userId: matchedUserId }] : []),
        { name: name.trim() },
      ],
    },
  });

  if (existingPlayer) {
    const updated = await prisma.player.update({
      where: { id: existingPlayer.id },
      data: {
        name: name.trim(),
        ...(normalizedEmail && { email: normalizedEmail }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(number !== undefined && number !== null && number !== "" && { number: Number(number) }),
        ...(position !== undefined && { position: position?.trim() || "Mijlocaș" }),
        ...(typeof isStarter === "boolean" && { isStarter }),
        ...(status && { status }),
        ...(image ? { image: image.trim() } : (existingUser?.image && !existingPlayer.image ? { image: existingUser.image } : {})),
        ...(secondaryImage ? { secondaryImage: secondaryImage.trim() } : (existingUser?.coverPhotoUrl && !existingPlayer.secondaryImage ? { secondaryImage: existingUser.coverPhotoUrl } : {})),
        ...(preferredFoot && { preferredFoot: preferredFoot.trim() }),
        ...(birthDate && { birthDate: birthDate.trim() }),
        ...(heightCm && { heightCm: Number(heightCm) }),
        ...(weightKg && { weightKg: Number(weightKg) }),
        ...(bio && { bio: bio.trim() }),
        ...(matchedUserId && { userId: matchedUserId }),
      },
    });

    if (matchedUserId && (image || secondaryImage)) {
      try {
        await prisma.user.update({
          where: { id: matchedUserId },
          data: {
            ...(image && { image: image.trim() }),
            ...(secondaryImage && { coverPhotoUrl: secondaryImage.trim() }),
          },
        });
      } catch {}
    }

    return NextResponse.json({ ok: true, player: updated, updated: true }, { status: 200 });
  }

  const player = await prisma.player.create({
    data: {
      teamId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      number: number !== undefined && number !== null && number !== "" ? Number(number) : null,
      position: position?.trim() || "Mijlocaș",
      isStarter: typeof isStarter === "boolean" ? isStarter : true,
      status: status || (matchedUserId ? "active" : "active"),
      image: image?.trim() || existingUser?.image || null,
      secondaryImage: secondaryImage?.trim() || existingUser?.coverPhotoUrl || null,
      preferredFoot: preferredFoot?.trim() || null,
      birthDate: birthDate?.trim() || null,
      heightCm: heightCm ? Number(heightCm) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      bio: bio?.trim() || null,
      rating: rating ? Number(rating) : 8.5,
      goals: goals ? Number(goals) : 0,
      assists: assists ? Number(assists) : 0,
      yellowCards: yellowCards ? Number(yellowCards) : 0,
      redCards: redCards ? Number(redCards) : 0,
      suspensions: suspensions ? Number(suspensions) : 0,
      userId: matchedUserId,
      invitationToken,
    },
  });

  if (matchedUserId && (image || secondaryImage)) {
    try {
      await prisma.user.update({
        where: { id: matchedUserId },
        data: {
          ...(image && { image: image.trim() }),
          ...(secondaryImage && { coverPhotoUrl: secondaryImage.trim() }),
        },
      });
    } catch {}
  }

  // Notify player if they have an email or user profile on platform
  if (normalizedEmail) {
    await createNotification({
      userEmail: normalizedEmail,
      type: "team_joined",
      title: "Ai fost adăugat în lot!",
      message: `Ai fost adăugat în lotul echipei ${team?.name || "Echipă"} ca ${player.isStarter ? "Titular (Primul 11)" : "Rezervă"} pentru ${team?.championship?.name || "competiție"}.`,
      teamId,
      teamName: team?.name || null,
      teamLogo: team?.logoUrl || null,
      link: "/profile",
    });
  }

  // Award +10 XP if team roster reached 11+ players
  const totalTeamPlayers = await prisma.player.count({ where: { teamId } });
  if (totalTeamPlayers >= 11 && (session.user as any)?.id) {
    await awardManagerXp((session.user as any).id, "roster_completed", { teamName: team?.name });
  }

  return NextResponse.json({ ok: true, player }, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const {
    id,
    name,
    number,
    position,
    isStarter,
    email,
    phone,
    image,
    preferredFoot,
    birthDate,
    heightCm,
    weightKg,
    bio,
    status,
    rating,
    goals,
    assists,
    yellowCards,
    redCards,
    suspensions,
  } = body;

  if (!id) {
    return NextResponse.json({ error: "ID jucător lipsă" }, { status: 400 });
  }

  const existingPlayer = await prisma.player.findUnique({
    where: { id },
    include: { team: true },
  });

  if (!existingPlayer) {
    return NextResponse.json({ error: "Jucătorul nu a fost găsit" }, { status: 404 });
  }

  const currentUser = session.user as any;
  const isSuper = isSuperAdmin(currentUser);
  const isManager = existingPlayer.team.managerId === currentUser.id;
  const isSelf = existingPlayer.userId && existingPlayer.userId === currentUser.id;

  if (!isManager && !isSuper && !isSelf) {
    return NextResponse.json(
      { error: "Acces interzis: Nu aveți permisiunea de a modifica datele acestui jucător." },
      { status: 403 }
    );
  }

  const normalizedEmail = email !== undefined ? (email ? email.trim().toLowerCase() : null) : existingPlayer.email;

  // Check if a platform user matches
  let matchedUserId = existingPlayer.userId;
  if (normalizedEmail && !matchedUserId) {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (user) matchedUserId = user.id;
  }

  const updated = await prisma.player.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(number !== undefined && { number: number === null || number === "" ? null : Number(number) }),
      ...(position !== undefined && { position: position ? position.trim() : null }),
      ...(isStarter !== undefined && { isStarter: Boolean(isStarter) }),
      ...(email !== undefined && { email: normalizedEmail }),
      ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
      ...(image !== undefined && { image: image ? image.trim() : null }),
      ...(body.secondaryImage !== undefined && { secondaryImage: body.secondaryImage ? body.secondaryImage.trim() : null }),
      ...(preferredFoot !== undefined && { preferredFoot: preferredFoot ? preferredFoot.trim() : null }),
      ...(birthDate !== undefined && { birthDate: birthDate ? birthDate.trim() : null }),
      ...(heightCm !== undefined && { heightCm: heightCm ? Number(heightCm) : null }),
      ...(weightKg !== undefined && { weightKg: weightKg ? Number(weightKg) : null }),
      ...(bio !== undefined && { bio: bio ? bio.trim() : null }),
      ...(status !== undefined && { status }),
      ...(rating !== undefined && { rating: Number(rating) }),
      ...(goals !== undefined && { goals: Number(goals) }),
      ...(assists !== undefined && { assists: Number(assists) }),
      ...(yellowCards !== undefined && { yellowCards: Number(yellowCards) }),
      ...(redCards !== undefined && { redCards: Number(redCards) }),
      ...(suspensions !== undefined && { suspensions: Number(suspensions) }),
      ...(matchedUserId !== existingPlayer.userId && { userId: matchedUserId }),
    },
  });

  // If user account is linked, also update user's profile info if empty or manager requested sync
  if (matchedUserId) {
    try {
      await prisma.user.update({
        where: { id: matchedUserId },
        data: {
          ...(image && { image: image.trim() }),
          ...(body.secondaryImage && { coverPhotoUrl: body.secondaryImage.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(position && { position: position.trim() }),
          ...(number !== undefined && number !== null && number !== "" && { jerseyNumber: Number(number) }),
          ...(preferredFoot && { preferredFoot: preferredFoot.trim() }),
          ...(heightCm && { heightCm: Number(heightCm) }),
          ...(weightKg && { weightKg: Number(weightKg) }),
          ...(bio && { bio: bio.trim() }),
        },
      });
    } catch {
      // ignore user update error
    }
  }

  return NextResponse.json({ ok: true, player: updated });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID lipsă" }, { status: 400 });
  }

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          managerId: true,
        },
      },
    },
  });

  if (!player) {
    return NextResponse.json({ error: "Jucătorul nu a fost găsit" }, { status: 404 });
  }

  const currentUser = session.user as any;
  if (player.team.managerId !== currentUser.id && !isSuperAdmin(currentUser)) {
    return NextResponse.json(
      { error: "Acces interzis: Doar managerul echipei sau SuperAdmin pot elimina jucători din lot." },
      { status: 403 }
    );
  }

  if (player) {
    if (player.email) {
      await createNotification({
        userEmail: player.email,
        type: "team_removed",
        title: "Eliminare din Lot",
        message: `Ai fost eliminat din lotul echipei ${player.team?.name || "Echipă"}.`,
        teamId: player.teamId,
        teamName: player.team?.name || null,
        teamLogo: player.team?.logoUrl || null,
        link: "/profile",
      });
    }

    await prisma.player.delete({
      where: { id },
    });
  }

  return NextResponse.json({ ok: true });
}
