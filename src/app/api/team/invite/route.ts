import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const { teamId, email, name, number, position } = body;

  if (!teamId || !email) {
    return NextResponse.json({ error: "Email-ul și ID-ul echipei sunt obligatorii" }, { status: 400 });
  }

  const inviteToken = "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  // Create player with status "invited"
  const player = await prisma.player.create({
    data: {
      teamId,
      name: name?.trim() || email.split("@")[0],
      email: email.trim().toLowerCase(),
      number: number ? Number(number) : null,
      position: position?.trim() || "Mijlocaș",
      status: "invited",
      invitationToken: inviteToken,
      isStarter: false,
    },
  });

  const inviteLink = `https://sp.buu.ro/signup?invite=${inviteToken}&team=${teamId}&email=${encodeURIComponent(email)}`;

  return NextResponse.json({
    ok: true,
    player,
    inviteToken,
    inviteLink,
    message: `Invitația a fost generată și trimisă cu succes către ${email}!`,
  });
}
