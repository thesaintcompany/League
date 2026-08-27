import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTeamLeader } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isTeamLeader(user)) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const invitations = await prisma.teamInvitation.findMany({
    where: { inviteeEmail: user.email, status: "pending" },
    include: {
      championship: {
        select: { id: true, name: true, sport: true, season: true, scope: true, county: true, city: true },
      },
      team: {
        select: { id: true, name: true, shortName: true, color: true },
      },
      inviter: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as any[];

  return NextResponse.json({ invitations });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isTeamLeader(user)) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { invitationId, action } = body;

    if (!invitationId || !action) {
      return NextResponse.json({ error: "ID-ul invitației și acțiunea sunt obligatorii" }, { status: 400 });
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: true },
    });

    if (!invitation || invitation.inviteeEmail !== user.email) {
      return NextResponse.json({ error: "Invitația nu a fost găsită" }, { status: 404 });
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Invitația a fost deja procesată" }, { status: 400 });
    }

    if (action === "accept") {
      const updatedInvitation = await prisma.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: "accepted",
          respondedAt: new Date(),
        },
      });

      await prisma.team.update({
        where: { id: invitation.teamId },
        data: {
          managerId: user.id,
          managerEmail: user.email,
        },
      });

      return NextResponse.json({ ok: true, invitation: updatedInvitation, message: "Invitația a fost acceptată!" });
    }

    if (action === "reject") {
      const updatedInvitation = await prisma.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: "rejected",
          respondedAt: new Date(),
        },
      });

      return NextResponse.json({ ok: true, invitation: updatedInvitation, message: "Invitația a fost refuzată." });
    }

    return NextResponse.json({ error: "Acțiune invalidă" }, { status: 400 });
  } catch (err: any) {
    console.error("Error handling team invitation:", err);
    return NextResponse.json({ error: err.message || "Eroare la procesarea invitației." }, { status: 500 });
  }
}
