import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const url = new URL(req.url);
  const matchId = url.pathname.split("/").filter(Boolean)[3];
  const body = await req.json().catch(() => ({}));
  const { action } = body; // "accept" | "decline"

  if (!matchId) {
    return NextResponse.json({ error: "ID meci necunoscut." }, { status: 400 });
  }

  if (!action || (action !== "accept" && action !== "decline")) {
    return NextResponse.json({ error: "Acțiune invalidă. Folosește 'accept' sau 'decline'." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    return NextResponse.json({ error: "Meciul nu a fost găsit." }, { status: 404 });
  }

  const updates: any = {};
  let message = "";

  if (action === "accept") {
    updates.refereeConfirmed = true;
    updates.refereeConfirmedAt = new Date();
    updates.refereeDeclined = false;
    message = "Ai confirmat prezența la meci. Organizatorul a fost notificat.";
  } else {
    updates.refereeDeclined = true;
    updates.refereeConfirmed = false;
    updates.refereeConfirmedAt = null;
    message = "Ai refuzat meciul. Organizatorul a fost notificat.";
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: updates,
  });

  return NextResponse.json({
    ok: true,
    match: updated,
    message,
  });
}
