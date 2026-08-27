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

  const settings = await prisma.systemSetting.findUnique({ where: { id: "default" } });
  const teamCount = await prisma.team.count({ where: { managerId: user.id } });
  const managedTeams = await prisma.team.findMany({
    where: { managerId: user.id },
    select: { id: true, name: true, shortName: true, color: true, subscriptionActive: true, subscriptionExpiresAt: true },
  });

  return NextResponse.json({
    teamCount,
    managedTeams,
    teamSubscriptionPrice: settings?.teamSubscriptionPrice ?? 60.0,
    freeTeamLimit: 1,
  });
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
    const { name, shortName, color, description, paymentMethod, paymentConfirmed } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Numele echipei este obligatoriu" }, { status: 400 });
    }

    const settings = await prisma.systemSetting.findUnique({ where: { id: "default" } });
    const teamCount = await prisma.team.count({ where: { managerId: user.id } });
    const freeTeamLimit = 1;
    const subscriptionPrice = settings?.teamSubscriptionPrice ?? 60.0;

    if (teamCount >= freeTeamLimit && !paymentConfirmed) {
      return NextResponse.json({
        error: "payment_required",
        message: `Ai atins limita gratuită de ${freeTeamLimit} echipă. Crearea unei echipe suplimentare costă ${subscriptionPrice} EUR / an.`,
        price: subscriptionPrice,
        teamCount,
        freeTeamLimit,
      });
    }

    const computedShortName = (shortName?.trim() || name.trim().substring(0, 3)).toUpperCase();
    const computedColor = color || "#84cc16";

    const defaultChamp = await prisma.championship.findFirst();
    if (!defaultChamp) {
      return NextResponse.json({ error: "Nu există niciun campionat în sistem. Contactează administratorul." }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        shortName: computedShortName,
        color: computedColor,
        description: description?.trim() || null,
        championshipId: defaultChamp.id,
        managerId: user.id,
        managerEmail: user.email,
        subscriptionActive: teamCount >= freeTeamLimit,
        subscriptionStartAt: teamCount >= freeTeamLimit ? now : null,
        subscriptionExpiresAt: teamCount >= freeTeamLimit ? expiresAt : null,
      },
      include: {
        championship: true,
        players: true,
      },
    });

    return NextResponse.json({
      ok: true,
      team,
      message: teamCount >= freeTeamLimit
        ? `Echipa "${team.name}" a fost creată cu abonament activ până la ${expiresAt.toLocaleDateString("ro-RO")}.`
        : `Echipa "${team.name}" a fost creată gratuit!`,
    });
  } catch (err: any) {
    console.error("Error creating team:", err);
    return NextResponse.json({ error: err.message || "Eroare la crearea echipei." }, { status: 500 });
  }
}
