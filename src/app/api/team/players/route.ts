import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const { teamId, name, number, position, isStarter, email, image, goals, assists, rating, yellowCards, redCards, suspensions } = body;

  if (!teamId || !name) {
    return NextResponse.json({ error: "Numele și echipa sunt obligatorii" }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, name: true, logoUrl: true, championship: { select: { name: true } } },
  });

  const player = await prisma.player.create({
    data: {
      teamId,
      name: name.trim(),
      email: email?.trim() || null,
      number: number ? Number(number) : null,
      position: position?.trim() || "Mijlocaș",
      isStarter: typeof isStarter === "boolean" ? isStarter : true,
      status: "active",
      image: image || null,
      rating: rating ? Number(rating) : 8.5,
      goals: goals ? Number(goals) : 0,
      assists: assists ? Number(assists) : 0,
      yellowCards: yellowCards ? Number(yellowCards) : 0,
      redCards: redCards ? Number(redCards) : 0,
      suspensions: suspensions ? Number(suspensions) : 0,
    },
  });

  // Notify player if they have an email or user profile on platform
  if (email || name) {
    await createNotification({
      userEmail: email?.trim() || null,
      type: "team_joined",
      title: "Ai fost adăugat în lot!",
      message: `Ai fost adăugat în lotul echipei ${team?.name || "Echipă"} ca ${isStarter ? "Titular (Primul 11)" : "Rezervă"} pentru ${team?.championship?.name || "competiție"}.`,
      teamId,
      teamName: team?.name || null,
      teamLogo: team?.logoUrl || null,
      link: "/profile",
    });
  }

  return NextResponse.json({ ok: true, player }, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, number, position, isStarter, status } = body;

  if (!id) {
    return NextResponse.json({ error: "ID jucător lipsă" }, { status: 400 });
  }

  const updated = await prisma.player.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(number !== undefined && { number: number === null ? null : Number(number) }),
      ...(position !== undefined && { position: position.trim() }),
      ...(isStarter !== undefined && { isStarter: Boolean(isStarter) }),
      ...(status !== undefined && { status }),
    },
  });

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

  // Find player details before deletion so we can notify them
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
    // Send notification to player about removal from team
    await createNotification({
      userEmail: player.email || null,
      type: "team_removed",
      title: "Eliminare din Lot",
      message: `Ai fost eliminat din lotul echipei ${player.team?.name || "Echipă"}.`,
      teamId: player.teamId,
      teamName: player.team?.name || null,
      teamLogo: player.team?.logoUrl || null,
      link: "/profile",
    });

    await prisma.player.delete({
      where: { id },
    });
  }

  return NextResponse.json({ ok: true });
}
