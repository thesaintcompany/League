import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, cardNumber, playerPhotoBase64 } = body;
    if (!token || !cardNumber) {
      return NextResponse.json({ error: "Token și numărul cardului sunt obligatorii" }, { status: 400 });
    }

    // Resolve invite by accountOfferToken (valid 48h)
    const invite = await prisma.externalInvite.findUnique({
      where: { accountOfferToken: token },
    });
    if (!invite) return NextResponse.json({ error: "Invitație invalidă" }, { status: 404 });
    if (!invite.accountOfferExpires || new Date(invite.accountOfferExpires) < new Date()) {
      return NextResponse.json({ error: "Oferta a expirat" }, { status: 410 });
    }

    // Find the user who created the account from this invite
    const user = await prisma.user.findUnique({
      where: { email: invite.inviteeEmail.toLowerCase() },
    });
    if (!user) return NextResponse.json({ error: "Contul nu a fost creat încă" }, { status: 404 });

    const data: any = {
      memberCardNumber: cardNumber.trim(),
      memberCardExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
    if (playerPhotoBase64) {
      data.image = playerPhotoBase64;
      data.memberCardUrl = playerPhotoBase64;
    }

    await prisma.user.update({
      where: { id: user.id },
      data,
    });

    // Also attach to Player record if present
    await prisma.player.updateMany({
      where: { teamId: invite.teamId, email: user.email },
      data: { image: playerPhotoBase64 || undefined },
    });

    await prisma.externalInvite.update({
      where: { id: invite.id },
      data: {
        stage: "card_done",
        cardToken: crypto.randomBytes(16).toString("hex"),
        cardTokenExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ ok: true, message: "Cardul de membru și poza au fost salvate." });
  } catch (e) {
    console.error("card save error", e);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
