import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/championships/[id]/standings
// Compute standings from finished matches.
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const champ = await prisma.championship.findFirst({
    where: { id: ctx.params.id, ownerId: (session.user as any).id },
    include: {
      teams: true,
      matches: { where: { status: "finished" } },
    },
  });
  if (!champ) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stats = new Map<string, {
    teamId: string;
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    points: number;
  }>();

  for (const t of champ.teams) {
    stats.set(t.id, {
      teamId: t.id,
      name: t.name,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
    });
  }

  for (const m of champ.matches) {
    if (m.homeScore == null || m.awayScore == null) continue;
    const h = stats.get(m.homeTeamId);
    const a = stats.get(m.awayTeamId);
    if (!h || !a) continue;
    h.played += 1; a.played += 1;
    h.gf += m.homeScore; h.ga += m.awayScore;
    a.gf += m.awayScore; a.ga += m.homeScore;
    if (m.homeScore > m.awayScore) {
      h.won += 1; h.points += 3;
      a.lost += 1;
    } else if (m.homeScore < m.awayScore) {
      a.won += 1; a.points += 3;
      h.lost += 1;
    } else {
      h.drawn += 1; a.drawn += 1;
      h.points += 1; a.points += 1;
    }
  }

  const standings = Array.from(stats.values()).sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    const xgd = x.gf - x.ga;
    const ygd = y.gf - y.ga;
    if (ygd !== xgd) return ygd - xgd;
    return y.gf - x.gf;
  });

  return NextResponse.json({ standings });
}
