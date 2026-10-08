import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

import { canEditPlayerProfile, isTeamLeader } from "@/lib/permissions";

const profileSchema = z.object({
  targetUserId: z.string().optional(),
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(30).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  image: z.string().optional().nullable(), // Poză portret față
  coverPhotoUrl: z.string().optional().nullable(), // Poză în picioare / full-body
  primarySport: z.string().max(50).optional().nullable(),
  position: z.string().max(50).optional().nullable(),
  jerseyNumber: z.number().int().min(1).max(99).optional().nullable(),
  preferredFoot: z.string().max(20).optional().nullable(),
  heightCm: z.number().int().min(100).max(230).optional().nullable(),
  weightKg: z.number().int().min(30).max(150).optional().nullable(),
  instagramUrl: z.string().max(100).optional().nullable(),
  twitterUrl: z.string().max(100).optional().nullable(),
  facebookUrl: z.string().max(100).optional().nullable(),
  refereeBadge: z.string().max(50).optional().nullable(),
  experienceYears: z.number().int().min(0).max(50).optional().nullable(),
  coachingLicense: z.string().max(100).optional().nullable(),
  companyName: z.string().max(150).optional().nullable(),
  companyCui: z.string().max(50).optional().nullable(),
  billingAddress: z.string().max(300).optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      primarySport: true,
      image: true,
      coverPhotoUrl: true,
      phone: true,
      bio: true,
      position: true,
      jerseyNumber: true,
      preferredFoot: true,
      heightCm: true,
      weightKg: true,
      instagramUrl: true,
      twitterUrl: true,
      facebookUrl: true,
      refereeBadge: true,
      experienceYears: true,
      managerXp: true,
      managerBadge: true,
      coachingLicense: true,
      companyName: true,
      companyCui: true,
      billingAddress: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const sessionUser = session.user as any;
  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const targetUserId = parsed.data.targetUserId || sessionUser.id;
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 });
  }

  // Permission check
  let isEditable = canEditPlayerProfile(sessionUser, targetUser.id);
  if (!isEditable && isTeamLeader(sessionUser)) {
    const managedTeam = await prisma.team.findFirst({
      where: { managerId: sessionUser.id },
      include: { players: true },
    });
    if (managedTeam) {
      const isPlayerInTeam = managedTeam.players.some(
        (p) => p.email === targetUser.email || (targetUser.name && p.name.toLowerCase() === targetUser.name.toLowerCase())
      );
      if (isPlayerInTeam) isEditable = true;
    }
  }

  if (!isEditable) {
    return NextResponse.json(
      { error: "Acces interzis: Doar jucătorul însuși și managerul de echipă pot edita acest profil." },
      { status: 403 }
    );
  }

  const { targetUserId: _, ...updateData } = parsed.data;

  const updatedUser = await prisma.user.update({
    where: { id: targetUser.id },
    data: updateData,
  });

  // Sync with player records in team roster
  try {
    await prisma.player.updateMany({
      where: {
        OR: [
          { userId: targetUser.id },
          ...(targetUser.email ? [{ email: targetUser.email }] : []),
        ],
      },
      data: {
        ...(updateData.image !== undefined && { image: updateData.image }),
        ...(updateData.coverPhotoUrl !== undefined && { secondaryImage: updateData.coverPhotoUrl }),
        ...(updateData.position !== undefined && { position: updateData.position }),
        ...(updateData.jerseyNumber !== undefined && { number: updateData.jerseyNumber }),
        ...(updateData.preferredFoot !== undefined && { preferredFoot: updateData.preferredFoot }),
        ...(updateData.phone !== undefined && { phone: updateData.phone }),
        ...(updateData.heightCm !== undefined && { heightCm: updateData.heightCm }),
        ...(updateData.weightKg !== undefined && { weightKg: updateData.weightKg }),
        ...(updateData.bio !== undefined && { bio: updateData.bio }),
      },
    });
  } catch {
    // ignore sync errors
  }

  return NextResponse.json({ user: updatedUser });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const sessionUser = session.user as any;
  const body = await req.json();

  if (body.action === "change_password") {
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Parola curentă și noua parolă sunt obligatorii" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Noua parolă trebuie să aibă minim 6 caractere" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "Contul nu are parolă setată" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Parola curentă este incorectă" }, { status: 401 });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({ success: true, message: "Parola a fost schimbată cu succes" });
  }

  return NextResponse.json({ error: "Acțiune invalidă" }, { status: 400 });
}
