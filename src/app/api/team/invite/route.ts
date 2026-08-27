import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  const { teamId, championshipId, email, name, number, position, sport } = body;

  if (!teamId || !email) {
    return NextResponse.json({ error: "Email-ul și ID-ul echipei sunt obligatorii" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = (name || "").trim();

  // Fetch team + championship to obtain sport + championshipId if missing
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, championshipId: true, name: true, sport: true },
  });
  if (!team) {
    return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
  }
  const champId = championshipId || team.championshipId;
  const sportVal = sport || team.sport || "fotbal";

  // Prevent duplicate external invites in flight for the same email+team
  const existing = await prisma.externalInvite.findFirst({
    where: { inviteeEmail: normalizedEmail, teamId, stage: { in: ["pending", "info_collected", "confirmed"] } },
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
        teamId,
        championshipId: champId,
        inviterId: (session.user as any).id || "unknown",
        sport: sportVal,
        inviteeEmail: normalizedEmail,
        inviteeName: normalizedName || undefined,
        stage: "pending",
      },
    });
  }

  // Also keep the legacy Player invite in sync (status: invited) so UI lists still show the invitee
  try {
    const existingPlayer = await prisma.player.findFirst({
      where: { teamId, email: normalizedEmail, status: "invited" },
    });
    if (!existingPlayer) {
      await prisma.player.create({
        data: {
          teamId,
          name: existing ? (existing.inviteeName || normalizedName || normalizedEmail.split("@")[0]) : (normalizedName || normalizedEmail.split("@")[0]),
          email: normalizedEmail,
          number: number ? Number(number) : null,
          position: position?.trim() || "Mijlocaș",
          status: "invited",
          invitationToken: invite.token,
          isStarter: false,
        },
      });
    }
  } catch {
    // tolerate if player exists; the ExternalInvite is the source of truth for the no-account flow
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://sp.buu.ro";
  const acceptLink = `${base}/invite/accept?token=${encodeURIComponent(invite.acceptToken)}`;

  return NextResponse.json({
    ok: true,
    inviteId: invite.id,
    inviteToken: invite.token,
    acceptToken: invite.acceptToken,
    acceptLink,
    message: `Invitația a fost generată și trimisă cu succes către ${normalizedEmail}!`,
  });
}
