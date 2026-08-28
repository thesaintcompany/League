import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ─── Romanian name pools ─── */
const FIRST_NAMES = [
  "Alexandru", "Andrei", "Mihai", "Ionuț", "Cristian", "Daniel", "Marian",
  "Florin", "Valentin", "George", "Adrian", "Cosmin", "Bogdan", "Răzvan",
  "Dragoș", "Gabriel", "Lucian", "Sebastian", "Vlad", "Robert", "Ștefan",
  "Claudiu", "Ciprian", "Laurențiu", "Ovidiu", "Sorin", "Nicușor", "Darius",
  "Eduard", "Alin", "Cătălin", "Petrișor", "Vasile", "Tudor", "Rareș",
  "Denis", "Silviu", "Liviu", "Marius", "Paul", "Dorin", "Eugen", "Emil",
  "Octavian", "Tiberiu", "Flavius", "Iulian", "Marcel", "Victor", "Nicu",
];

const LAST_NAMES = [
  "Popescu", "Ionescu", "Popa", "Stan", "Dumitru", "Stoica", "Gheorghe",
  "Dinu", "Marin", "Dumitrescu", "Nicolae", "Constantin", "Moldovan",
  "Matei", "Barbu", "Crișan", "Radu", "Florea", "Neagu", "Voicu",
  "Rusu", "Lazar", "Toma", "Oprea", "Tudor", "Giurgiu", "Enache",
  "Lungu", "Munteanu", "Ciobanu", "Vasile", "Preda", "Drăgan", "Bogdan",
  "Sandu", "Petrescu", "Tănase", "Mazilu", "Iacob", "Mureșan",
];

const POSITIONS = [
  "Portar", "Fundaș Central", "Fundaș Dreapta", "Fundaș Stânga",
  "Mijlocaș Central", "Mijlocaș Defensiv", "Mijlocaș Ofensiv",
  "Extremă Dreapta", "Extremă Stânga", "Atacant", "Vârf",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ─── GET: Return stats about existing players ─── */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["super_admin", "superadmin"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const totalPlayers = await prisma.player.count();

    // Fake players are identified by having an email ending with @fakeplayer.local
    const fakePlayersCount = await prisma.player.count({
      where: { email: { endsWith: "@fakeplayer.local" } },
    });

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        shortName: true,
        color: true,
        _count: { select: { players: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      totalPlayers,
      fakePlayersCount,
      teams: teams.map((t) => ({
        id: t.id,
        name: t.name,
        shortName: t.shortName,
        color: t.color,
        playersCount: t._count.players,
      })),
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json({ error: "Eroare la citirea datelor" }, { status: 500 });
  }
}

/* ─── POST: Generate fake players ─── */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["super_admin", "superadmin"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const body = await req.json();
    const count = Math.min(Math.max(Number(body.count) || 10, 1), 100);
    const teamId = body.teamId as string | undefined;
    const withAccounts = body.withAccounts !== false;

    // Determine target teams
    let targetTeams: { id: string; name: string }[] = [];
    if (teamId && teamId !== "all_teams") {
      const team = await prisma.team.findUnique({ where: { id: teamId }, select: { id: true, name: true } });
      if (team) targetTeams = [team];
    }

    if (targetTeams.length === 0) {
      targetTeams = await prisma.team.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
    }

    if (targetTeams.length === 0) {
      return NextResponse.json({ error: "Nu exista echipe in platforma. Creeaza un campionat mai intai." }, { status: 400 });
    }

    // Track used jersey numbers per team to avoid duplicates
    const usedNumbers: Record<string, Set<number>> = {};
    for (const t of targetTeams) {
      const existing = await prisma.player.findMany({
        where: { teamId: t.id },
        select: { number: true },
      });
      usedNumbers[t.id] = new Set(existing.filter((p) => p.number !== null).map((p) => p.number as number));
    }

    const playersCreated: any[] = [];
    const playerImages = [1, 2, 3, 4, 5, 6];

    for (let i = 0; i < count; i++) {
      const firstName = randomFrom(FIRST_NAMES);
      const lastName = randomFrom(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const team = randomFrom(targetTeams);
      const position = randomFrom(POSITIONS);
      const imageIdx = randomFrom(playerImages);

      // Generate unique jersey number for this team
      let number = randomInt(1, 99);
      const teamNumbers = usedNumbers[team.id] || new Set();
      let attempts = 0;
      while (teamNumbers.has(number) && attempts < 100) {
        number = randomInt(1, 99);
        attempts++;
      }
      teamNumbers.add(number);
      usedNumbers[team.id] = teamNumbers;

      const emailSlug = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[ăâîșț]/g, (c) => {
        const map: Record<string, string> = { "ă": "a", "â": "a", "î": "i", "ș": "s", "ț": "t" };
        return map[c] || c;
      });
      const email = `${emailSlug}.${randomInt(100, 999)}@fakeplayer.local`;

      const goals = randomInt(0, 15);
      const assists = randomInt(0, 10);
      const yellowCards = randomInt(0, 5);
      const redCards = randomInt(0, 1);
      const matchesCount = randomInt(goals > 0 ? goals : 1, 20);
      const rating = parseFloat((Math.random() * 3 + 6).toFixed(1)); // 6.0 - 9.0

      const player = await prisma.player.create({
        data: {
          name,
          email,
          number,
          position,
          status: "active",
          isStarter: Math.random() > 0.3,
          goals,
          assists,
          matchesCount,
          yellowCards,
          redCards,
          rating,
          image: `/images/players/player-${imageIdx}.jpg`,
          teamId: team.id,
        },
      });

      playersCreated.push(player);
    }

    return NextResponse.json({
      message: `${playersCreated.length} jucatori au fost generati cu succes si salvati in baza de date!`,
      count: playersCreated.length,
      teams: targetTeams.map((t) => t.name),
    });
  } catch (error) {
    console.error("Error generating players:", error);
    return NextResponse.json({ error: "Eroare la generarea jucatorilor" }, { status: 500 });
  }
}

/* ─── DELETE: Remove all fake-generated players ─── */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["super_admin", "superadmin"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const result = await prisma.player.deleteMany({
      where: { email: { endsWith: "@fakeplayer.local" } },
    });

    return NextResponse.json({
      message: `${result.count} jucatori generati au fost stersi din baza de date.`,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Error deleting fake players:", error);
    return NextResponse.json({ error: "Eroare la stergerea jucatorilor" }, { status: 500 });
  }
}
