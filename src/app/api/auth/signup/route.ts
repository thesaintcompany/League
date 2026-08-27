import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // If this signup carries an invite offer token, force the player role and
    // wire the user into the team/championship.
    let invite: any = null;
    if (parsed.data.inviteToken) {
      invite = await prisma.externalInvite.findUnique({
        where: { accountOfferToken: parsed.data.inviteToken },
        include: { team: true, championship: true },
      });
      if (!invite) {
        return NextResponse.json({ error: "Invitație invalidă sau expirată" }, { status: 400 });
      }
      if (invite.accountOfferExpires && new Date(invite.accountOfferExpires) < new Date()) {
        return NextResponse.json({ error: "Oferta de cont a expirat (48h)" }, { status: 410 });
      }
      // Email must match the invite email
      if (invite.inviteeEmail.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ error: "Acest cont nu corespunde invitației primite" }, { status: 403 });
      }
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfIp = req.headers.get("cf-connecting-ip");
    const clientIp = (forwarded ? forwarded.split(",")[0].trim() : realIp || cfIp || "127.0.0.1");

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const roleToCreate = invite ? "player" : parsed.data.role;
    const user = await prisma.user.create({
      data: {
        name: invite ? (invite.inviteeName || parsed.data.name) : parsed.data.name,
        email,
        passwordHash,
        role: roleToCreate,
        signupIp: clientIp,
      },
      select: { id: true, email: true, name: true, signupIp: true },
    });

    // If invited, wire the user into the team + championship
    if (invite) {
      await prisma.externalInvite.update({
        where: { id: invite.id },
        data: {
          stage: "account_created",
          inviterId: invite.inviterId,
        },
      });

      // Upsert a Player record linked to this user & team
      const existingPlayer = await prisma.player.findFirst({
        where: { teamId: invite.teamId, email: email },
      });
      const playerData = {
        name: invite.inviteeName || user.name || email.split("@")[0],
        email,
        status: "active" as const,
        teamId: invite.teamId,
        isStarter: false,
      };
      if (existingPlayer) {
        await prisma.player.update({
          where: { id: existingPlayer.id },
          data: { ...playerData, invitationToken: undefined },
        });
      } else {
        await prisma.player.create({ data: { ...playerData, invitationToken: invite.token } });
      }

      return NextResponse.json({
        user,
        teamId: invite.teamId,
        championshipId: invite.championshipId,
        message: "Cont creat cu succes! Ești acum jucător al echipei.",
      }, { status: 201 });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error("signup error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
