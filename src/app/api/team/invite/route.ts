import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import crypto from "crypto";

function tok(n = 32): string {
  return crypto.randomBytes(n).toString("hex");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const { playerId, teamId, championshipId, email, name, number, position, image, phone, sport } = body;

  if (!teamId && !playerId) {
    return NextResponse.json({ error: "ID-ul echipei sau jucătorului este obligatoriu" }, { status: 400 });
  }

  let targetPlayer: any = null;
  if (playerId) {
    targetPlayer = await prisma.player.findUnique({
      where: { id: playerId },
      include: { team: true },
    });
  }

  const effectiveTeamId = teamId || targetPlayer?.teamId;
  const effectiveEmail = (email || targetPlayer?.email || "").trim().toLowerCase();
  const effectiveName = (name || targetPlayer?.name || "").trim();

  if (!effectiveTeamId || !effectiveEmail) {
    return NextResponse.json(
      { error: "Email-ul jucătorului și echipa sunt obligatorii pentru generarea invitației" },
      { status: 400 }
    );
  }

  // Fetch team + championship to obtain sport + championshipId if missing
  const team = await prisma.team.findUnique({
    where: { id: effectiveTeamId },
    select: { id: true, championshipId: true, name: true, sport: true },
  });
  if (!team) {
    return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
  }
  const champId = championshipId || team.championshipId;
  const sportVal = sport || team.sport || "fotbal";

  // Prevent duplicate external invites in flight for the same email+team
  const existing = await prisma.externalInvite.findFirst({
    where: { inviteeEmail: effectiveEmail, teamId: effectiveTeamId, stage: { in: ["pending", "info_collected", "confirmed"] } },
  });

  let invite: any;
  if (existing) {
    invite = existing;
  } else {
    const acceptToken = tok(24);
    invite = await prisma.externalInvite.create({
      data: {
        token: tok(24),
        acceptToken,
        teamId: effectiveTeamId,
        championshipId: champId,
        inviterId: (session.user as any).id || "unknown",
        sport: sportVal,
        inviteeEmail: effectiveEmail,
        inviteeName: effectiveName || undefined,
        stage: "pending",
      },
    });
  }

  // Update or create the Player profile with the invite token and preset attributes
  let playerRecord: any = targetPlayer;
  if (playerRecord) {
    playerRecord = await prisma.player.update({
      where: { id: playerRecord.id },
      data: {
        email: effectiveEmail,
        invitationToken: invite.token,
        status: playerRecord.userId ? "active" : "invited",
        ...(image && !playerRecord.image ? { image } : {}),
        ...(phone && !playerRecord.phone ? { phone } : {}),
        ...(number !== undefined && number !== null && number !== "" ? { number: Number(number) } : {}),
        ...(position ? { position } : {}),
      },
    });
  } else {
    const existingPlayer = await prisma.player.findFirst({
      where: { teamId: effectiveTeamId, email: effectiveEmail },
    });
    if (existingPlayer) {
      playerRecord = await prisma.player.update({
        where: { id: existingPlayer.id },
        data: {
          invitationToken: invite.token,
          status: existingPlayer.userId ? "active" : "invited",
          ...(image && !existingPlayer.image ? { image } : {}),
          ...(phone && !existingPlayer.phone ? { phone } : {}),
          ...(number !== undefined && number !== null && number !== "" ? { number: Number(number) } : {}),
          ...(position ? { position } : {}),
        },
      });
    } else {
      playerRecord = await prisma.player.create({
        data: {
          teamId: effectiveTeamId,
          name: effectiveName || effectiveEmail.split("@")[0],
          email: effectiveEmail,
          phone: phone || null,
          image: image || null,
          number: number !== undefined && number !== null && number !== "" ? Number(number) : null,
          position: position?.trim() || "Mijlocaș",
          status: "invited",
          invitationToken: invite.token,
          isStarter: false,
        },
      });
    }
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://ligue.ro";
  const acceptLink = `${base}/invite/accept?token=${encodeURIComponent(invite.acceptToken)}`;
  const directSignupLink = `${base}/signup?inviteToken=${encodeURIComponent(invite.acceptToken)}&email=${encodeURIComponent(effectiveEmail)}`;

  // Create in-app notification for player
  await createNotification({
    userEmail: effectiveEmail,
    type: "team_invite",
    title: "Invitație în Echipă & Profil Pregătit!",
    message: `Liderul echipei ${team.name} (${session.user.name || "Manager"}) ți-a pregătit profilul de joc și te-a invitat în echipă!`,
    link: acceptLink,
    teamId: team.id,
    teamName: team.name,
    metadata: {
      acceptLink,
      directSignupLink,
      sport: sportVal,
      playerId: playerRecord?.id,
    },
  });

  return NextResponse.json({
    ok: true,
    inviteId: invite.id,
    inviteToken: invite.token,
    acceptToken: invite.acceptToken,
    acceptLink,
    directSignupLink,
    player: playerRecord,
    message: `Invitația pentru profilul lui ${playerRecord?.name || "jucător"} a fost generată cu succes!`,
  });
}
