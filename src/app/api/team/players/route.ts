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
  const { teamId, name, number, position, isStarter, email } = body;

  if (!teamId || !name) {
    return NextResponse.json({ error: "Numele și echipa sunt obligatorii" }, { status: 400 });
  }

  const player = await prisma.player.create({
    data: {
      teamId,
      name: name.trim(),
      email: email?.trim() || null,
      number: number ? Number(number) : null,
      position: position?.trim() || "Mijlocaș",
      isStarter: typeof isStarter === "boolean" ? isStarter : true,
      status: "active",
      rating: 8.5,
      goals: 0,
      assists: 0,
    },
  });

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

  await prisma.player.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
