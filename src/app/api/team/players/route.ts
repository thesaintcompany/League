import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  if (normalizedEmail) {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, image: true, phone: true, position: true, jerseyNumber: true },
    });
    if (existingUser) {
      matchedUserId = existingUser.id;
    }
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, name: true, logoUrl: true, championship: { select: { name: true } } },
  });

  const invitationToken = crypto.randomBytes(20).toString("hex");

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
      image: image?.trim() || null,
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
        },
      },
    },
  });

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
