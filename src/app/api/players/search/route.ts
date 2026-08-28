import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const currentTeamId = searchParams.get("teamId") || "";

    // 1. Search Users in the platform
    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { position: { contains: q } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        jerseyNumber: true,
        image: true,
        role: true,
        primarySport: true,
        managedTeams: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
          take: 1,
        },
      },
      take: 20,
      orderBy: { name: "asc" },
    });

    // 2. Search Player records with their associated Teams
    const players = await prisma.player.findMany({
      where: {
        ...(currentTeamId ? { teamId: { not: currentTeamId } } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { position: { contains: q } },
                { team: { name: { contains: q } } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        number: true,
        position: true,
        image: true,
        goals: true,
        assists: true,
        rating: true,
        yellowCards: true,
        redCards: true,
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
            color: true,
            championship: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      take: 30,
      orderBy: { name: "asc" },
    });

    // Deduplicate by name & email
    const seen = new Set<string>();
    const results: Array<{
      id: string;
      name: string;
      email: string | null;
      number: number | null;
      position: string | null;
      image: string | null;
      teamName?: string | null;
      championshipName?: string | null;
      teamLogo?: string | null;
      teamColor?: string | null;
      source: "user" | "player";
      stats?: {
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
      };
    }> = [];

    for (const p of players) {
      const key = `${(p.name || "").toLowerCase()}_${(p.email || "").toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          id: p.id,
          name: p.name,
          email: p.email,
          number: p.number,
          position: p.position || "Jucător",
          image: p.image,
          teamName: p.team?.name || null,
          championshipName: p.team?.championship?.name || null,
          teamLogo: p.team?.logoUrl || null,
          teamColor: p.team?.color || null,
          source: "player",
          stats: {
            goals: p.goals,
            assists: p.assists,
            yellowCards: p.yellowCards,
            redCards: p.redCards,
          },
        });
      }
    }

    for (const u of users) {
      if (!u.name) continue;
      const key = `${u.name.toLowerCase()}_${(u.email || "").toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          id: u.id,
          name: u.name,
          email: u.email,
          number: u.jerseyNumber,
          position: u.position || "Jucător",
          image: u.image,
          teamName: u.managedTeams[0]?.name || null,
          teamLogo: u.managedTeams[0]?.logoUrl || null,
          source: "user",
        });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    console.error("Error searching platform players:", error);
    return NextResponse.json({ error: "Eroare la căutare jucători" }, { status: 500 });
  }
}
