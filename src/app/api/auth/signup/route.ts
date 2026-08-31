import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(120),
  password: z.string().min(8).max(120),
  role: z.enum(["organizer", "referee", "player", "arena_owner", "team_leader"]).default("organizer"),
  inviteToken: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Date invalide", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Emailul este deja utilizat pe platformă" }, { status: 409 });
    }

    // Check for external invite if inviteToken is passed
    let invite: any = null;
    if (parsed.data.inviteToken) {
      invite = await prisma.externalInvite.findFirst({
        where: {
          OR: [
            { accountOfferToken: parsed.data.inviteToken },
            { acceptToken: parsed.data.inviteToken },
            { token: parsed.data.inviteToken },
          ],
        },
        include: { team: true, championship: true },
      });
      if (invite && invite.accountOfferExpires && new Date(invite.accountOfferExpires) < new Date()) {
        return NextResponse.json({ error: "Oferta de cont a expirat (48h)" }, { status: 410 });
      }
    }

    // Find any pre-set Player profiles created by Team Managers for this email
    const preconfiguredPlayers = await prisma.player.findMany({
      where: { email },
      include: { team: { include: { championship: true } } },
      orderBy: { createdAt: "desc" },
    });

    const primaryPreset = preconfiguredPlayers[0];

    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfIp = req.headers.get("cf-connecting-ip");
    const clientIp = (forwarded ? forwarded.split(",")[0].trim() : realIp || cfIp || "127.0.0.1");

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const roleToCreate = (invite || preconfiguredPlayers.length > 0) ? "player" : parsed.data.role;

    // Create user with pre-set player metadata if available
    const user = await prisma.user.create({
      data: {
        name: primaryPreset?.name || invite?.inviteeName || parsed.data.name,
        email,
        passwordHash,
        role: roleToCreate,
        signupIp: clientIp,
        image: primaryPreset?.image || null,
        phone: primaryPreset?.phone || null,
        position: primaryPreset?.position || null,
        jerseyNumber: primaryPreset?.number || null,
        preferredFoot: primaryPreset?.preferredFoot || null,
        heightCm: primaryPreset?.heightCm || null,
        weightKg: primaryPreset?.weightKg || null,
        bio: primaryPreset?.bio || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        position: true,
        jerseyNumber: true,
        phone: true,
        preferredFoot: true,
        signupIp: true,
      },
    });

    await logAuditAction({
      userId: user.id,
      userEmail: email,
      userName: user.name,
      userRole: roleToCreate,
      action: "AUTH_SIGNUP",
      details: `Înregistrare cont nou cu rolul "${roleToCreate}". IP: ${clientIp}${primaryPreset ? ` (Asociat automat la profilul pre-setat al echipei ${primaryPreset.team?.name})` : ""}`,
      ipAddress: clientIp,
      entityType: "user",
      entityId: user.id,
    });

    // Link all preconfigured player records to this newly registered user
    if (preconfiguredPlayers.length > 0) {
      await prisma.player.updateMany({
        where: { email },
        data: {
          userId: user.id,
          status: "active",
        },
      });
    }

    // If invite object exists, update invite stage
    if (invite) {
      await prisma.externalInvite.update({
        where: { id: invite.id },
        data: {
          stage: "account_created",
          inviterId: invite.inviterId,
        },
      });

      // Ensure player record exists for invite team
      const existingPlayer = preconfiguredPlayers.find((p) => p.teamId === invite.teamId);
      if (!existingPlayer) {
        await prisma.player.create({
          data: {
            name: invite.inviteeName || user.name || email.split("@")[0],
            email,
            status: "active",
            teamId: invite.teamId,
            userId: user.id,
            isStarter: false,
          },
        });
      }

      return NextResponse.json(
        {
          user,
          teamId: invite.teamId,
          championshipId: invite.championshipId,
          message: `Cont creat cu succes! Ești acum jucător activ în echipa ${invite.team?.name || ""}.`,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        user,
        message: primaryPreset
          ? `Cont creat cu succes! Profilul tău a fost pre-configurat automat de liderul echipei ${primaryPreset.team?.name}.`
          : "Cont creat cu succes!",
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("signup error", e);
    return NextResponse.json({ error: "Eroare internă de server" }, { status: 500 });
  }
}
