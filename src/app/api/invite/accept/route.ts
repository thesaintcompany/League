import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || searchParams.get("offer") || searchParams.get("invite");
    if (!token) {
      return NextResponse.json({ error: "Token lipsă" }, { status: 400 });
    }

    const invite = await prisma.externalInvite.findFirst({
      where: {
        OR: [
          { acceptToken: token },
          { accountOfferToken: token },
          { token: token },
        ],
      },
      include: { team: true, championship: true },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invitația nu a fost găsită" }, { status: 404 });
    }

    // Find pre-configured player profile
    const player = await prisma.player.findFirst({
      where: {
        teamId: invite.teamId,
        email: invite.inviteeEmail,
      },
    });

    return NextResponse.json({
      ok: true,
      name: invite.inviteeName || player?.name || "",
      email: invite.inviteeEmail || player?.email || "",
      teamName: invite.team?.name || "",
      teamLogo: invite.team?.logoUrl || null,
      championshipName: invite.championship?.name || "",
      sport: invite.championship?.sport || invite.sport || "fotbal",
      role: "player",
      inviteToken: invite.accountOfferToken || invite.token || invite.acceptToken,
      player: player
        ? {
            id: player.id,
            name: player.name,
            number: player.number,
            position: player.position,
            image: player.image,
            preferredFoot: player.preferredFoot,
            phone: player.phone,
          }
        : null,
    });
  } catch (e) {
    console.error("GET invite error", e);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, name, email } = body;
    if (!token || !name || !email) {
      return NextResponse.json({ error: "Token, nume și email sunt obligatorii" }, { status: 400 });
    }

    const invite = await prisma.externalInvite.findUnique({
      where: { acceptToken: token as string },
      include: { team: true, championship: true, inviter: true },
    });
    if (!invite) return NextResponse.json({ error: "Invitația nu a fost găsită" }, { status: 404 });
    if (invite.stage !== "pending") {
      return NextResponse.json({ error: "Invitația a fost deja procesată" }, { status: 409 });
    }

    const offerToken = crypto.randomBytes(24).toString("hex");
    const offerExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    await prisma.externalInvite.update({
      where: { id: invite.id },
      data: {
        stage: "info_collected",
        inviteeName: name.trim(),
        inviteeEmail: email.trim().toLowerCase(),
        accountOfferToken: offerToken,
        accountOfferExpires: offerExpires,
      },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://ligue.ro";
    const offerLink = `${base}/invite/accept?offer=${offerToken}`;
    const cardLink = `${base}/invite/card?token=${offerToken}`;
    const directSignupLink = `${base}/signup?inviteToken=${offerToken}&email=${encodeURIComponent(email.trim().toLowerCase())}`;
    const sport = invite.championship?.sport || invite.sport || "campionat";

    // 1) Confirmation email (info collected)
    await sendEmail({
      to: email.trim().toLowerCase(),
      subject: "Invitație primită — confirmare preliminară",
      html: `<p>Bună ${name},</p><p>Prenumele tău și emailul au fost înregistrați pentru <strong>${invite.team.name}</strong> (${sport}) în cadrul campionatului <strong>${invite.championship?.name || ""}</strong>.</p><p>Profilul tău de jucător este gata pregătit! Pentru a-ți activa contul:</p><p><a href="${directSignupLink}">Activează Contul Direct</a></p>`,
      text: `Invitație primită pentru ${invite.team.name} (${sport}). Link activare: ${directSignupLink}`,
    });

    // 2) Offer email (optional, with card-link)
    await sendEmail({
      to: email.trim().toLowerCase(),
      subject: "Oferta ta de cont — doar o parolă",
      html: `<p>După confirmare, poți crea contul tău scriind o singură parolă. Link-ul este valabil 48h.</p><p><a href="${directSignupLink}">Finalizează Înregistrarea</a></p><p>Card/membru: ${cardLink}</p>`,
      text: `Oferta de cont: ${directSignupLink}. Card/membru: ${cardLink}`,
    });

    // Notify the inviter
    if (invite.inviter.email) {
      await sendEmail({
        to: invite.inviter.email,
        subject: `Confirmare: ${name} a acceptat invitația`,
        html: `<p>${name} &lt;${email}&gt; a confirmat preliminar participarea la echipa ${invite.team.name}.</p>`,
        text: `${name} a confirmat participarea.`,
      });
    }

    return NextResponse.json({
      ok: true,
      inviteId: invite.id,
      teamName: invite.team.name,
      sport: invite.sport,
      championshipName: invite.championship?.name,
      offerToken,
      offerLink,
      directSignupLink,
      message: `Confirmarea primită! Link-ul de activare a fost generat.`,
    });
  } catch (e) {
    console.error("invite accept error", e);
    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  }
}
