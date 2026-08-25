import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["organizer", "referee", "player", "arena_owner", "team_leader", "observer"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const isOrganizer = user.role === "organizer" || !user.role;
  if (!isOrganizer) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      image: true,
      refereeBadge: true,
      createdAt: true,
      _count: {
        select: {
          championships: true,
          venues: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const isOrganizer = user.role === "organizer" || !user.role;
  if (!isOrganizer) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
  });

  return NextResponse.json({ user: updated });
}
