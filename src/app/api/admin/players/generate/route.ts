import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";
import bcrypt from "bcryptjs";

const ROMANIAN_FIRST_NAMES = [
  "Andrei", "Alexandru", "Mihai", "Cristian", "Denis", "Gabriel", "Ștefan",
  "Vlad", "Radu", "Răzvan", "Bogdan", "Cosmin", "Sorin", "Marian", "Florin",
  "Lucian", "Dragoș", "George", "Adrian", "Ionuț", "Darius", "Eduard",
  "Robert", "Tudor", "Rareș", "Valentin", "Victor", "Cătălin", "Daniel", "Paul"
];

const ROMANIAN_LAST_NAMES = [
  "Popescu", "Ionescu", "Radu", "Dumitrescu", "Marin", "Neagu", "Munteanu",
  "Stanciu", "Ilie", "Dobre", "Tudor", "Enache", "Petrescu", "Gheorghiu",
  "Vasile", "Stoica", "Voinea", "Oprea", "Constantin", "Barbu", "Florea",
  "Cristea", "Nistor", "Diaconu", "Balan", "Mocanu", "Lupu", "Ciobanu", "Stan", "Gheorghe"
];

const POSITIONS = [
  "Portar",
  "Fundaș Central",
  "Fundaș Stânga",
  "Fundaș Dreapta",
  "Mijlocaș Defensiv",
  "Mijlocaș Central",
  "Mijlocaș Ofensiv",
  "Extremă Stânga",
  "Extremă Dreapta",
  "Atacant Central"
];

const PLAYER_IMAGES = [
  "/images/players/player-1.jpg",
  "/images/players/player-2.jpg",
  "/images/players/player-3.jpg",
  "/images/players/player-4.jpg",
  "/images/players/player-5.jpg",
  "/images/players/player-6.jpg",
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const [totalPlayers, fakePlayersCount, teams, championships] = await Promise.all([
    prisma.player.count(),
    prisma.player.count({
      where: {
        OR: [
          { email: { contains: "fake_player" } },
          { email: { contains: "demo_player" } },
          { email: { contains: "@player.league.local" } },
        ],
      },
    }),
    prisma.team.findMany({
      select: { id: true, name: true, sport: true, championship: { select: { id: true, name: true } } },
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
    prisma.championship.findMany({
      select: { id: true, name: true, sport: true, county: true },
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    totalPlayers,
    fakePlayersCount,
    teams,
    championships,
    availablePhotosCount: PLAYER_IMAGES.length,
    photos: PLAYER_IMAGES,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const count = Math.min(100, Math.max(1, parseInt(body.count) || 10));
    const targetTeamId = body.teamId;
    const withAccounts = Boolean(body.withAccounts ?? true);
    const sport = body.sport || "fotbal";

    // 1. Get or create target team(s)
    let availableTeams: any[] = [];
    if (targetTeamId && targetTeamId !== "all_teams") {
      const specificTeam = await prisma.team.findUnique({ where: { id: targetTeamId } });
      if (specificTeam) availableTeams = [specificTeam];
    }

    if (availableTeams.length === 0) {
      availableTeams = await prisma.team.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
      });
    }

    // If still no teams exist in DB, create a default championship & team for the players
    if (availableTeams.length === 0) {
      let adminUser = await prisma.user.findFirst({
        where: { role: { in: ["super_admin", "superadmin", "organizer"] } },
      });
      if (!adminUser) {
        adminUser = await prisma.user.findFirst();
      }

      if (adminUser) {
        const defaultChamp = await prisma.championship.create({
          data: {
            name: "Liga Națională Pro Demo",
            sport: "Fotbal",
            format: "liga",
            scope: "national",
            county: "București",
            city: "București",
            startDate: new Date(),
            ownerId: adminUser.id,
          },
        });

        const defaultTeam = await prisma.team.create({
          data: {
            name: "FC Stelele Sportive Pro",
            shortName: "SSP",
            color: "#10b981",
            sport: "fotbal",
            championshipId: defaultChamp.id,
            managerId: adminUser.id,
          },
        });

        availableTeams = [defaultTeam];
      }
    }

    if (availableTeams.length === 0) {
      return NextResponse.json({ error: "Nu există nicio echipă sau campionat disponibil pentru atribuirea jucătorilor." }, { status: 400 });
    }

    const defaultPasswordHash = await bcrypt.hash("Player123!", 10);
    const createdPlayers = [];
    const timestamp = Date.now();

    for (let i = 0; i < count; i++) {
      const firstName = ROMANIAN_FIRST_NAMES[Math.floor(Math.random() * ROMANIAN_FIRST_NAMES.length)];
      const lastName = ROMANIAN_LAST_NAMES[Math.floor(Math.random() * ROMANIAN_LAST_NAMES.length)];
      const fullName = `${firstName} ${lastName}`;
      const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
      const jerseyNumber = Math.floor(Math.random() * 98) + 1;
      const photoUrl = PLAYER_IMAGES[i % PLAYER_IMAGES.length];
      const assignedTeam = availableTeams[i % availableTeams.length];
      const uniqueSuffix = `${timestamp}_${i + 1}`;
      const fakeEmail = `player_${firstName.toLowerCase()}.${lastName.toLowerCase()}_${uniqueSuffix}@player.league.local`;

      // Realistic Athletic Performance Stats
      const matchesCount = Math.floor(Math.random() * 16) + 3;
      const isAttacker = position.includes("Atacant") || position.includes("Extremă") || position.includes("Ofensiv");
      const goals = isAttacker ? Math.floor(Math.random() * 18) + 2 : Math.floor(Math.random() * 4);
      const assists = Math.floor(Math.random() * 10);
      const rating = Number((7.8 + Math.random() * 2.0).toFixed(1));

      // 1. Create Player Record
      const newPlayer = await prisma.player.create({
        data: {
          name: fullName,
          email: fakeEmail,
          number: jerseyNumber,
          position: position,
          goals: goals,
          assists: assists,
          matchesCount: matchesCount,
          rating: rating,
          image: photoUrl,
          teamId: assignedTeam.id,
          status: "active",
          isStarter: Math.random() > 0.3,
        },
      });

      // 2. Optionally create User Account (as if player registered themselves)
      if (withAccounts) {
        await prisma.user.create({
          data: {
            name: fullName,
            email: fakeEmail,
            passwordHash: defaultPasswordHash,
            role: "player",
            image: photoUrl,
            phone: `+40 7${Math.floor(Math.random() * 89 + 10)} ${Math.floor(Math.random() * 899 + 100)} ${Math.floor(Math.random() * 899 + 100)}`,
            primarySport: sport,
            position: position,
            jerseyNumber: jerseyNumber,
            preferredFoot: Math.random() > 0.7 ? "Stâng" : Math.random() > 0.5 ? "Ambele" : "Drept",
            heightCm: Math.floor(Math.random() * 20) + 175,
            weightKg: Math.floor(Math.random() * 18) + 70,
            signupIp: `86.120.${Math.floor(Math.random() * 250 + 1)}.${Math.floor(Math.random() * 250 + 1)}`,
            memberCardNumber: `LP-CARD-${Math.floor(Math.random() * 899999 + 100000)}`,
            isActive: true,
          },
        }).catch(() => {});
      }

      createdPlayers.push({
        id: newPlayer.id,
        name: fullName,
        position,
        number: jerseyNumber,
        goals,
        image: photoUrl,
        teamName: assignedTeam.name,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Au fost generați cu succes ${createdPlayers.length} jucători cu poze atletice HD și fișe de joc complete!`,
      players: createdPlayers,
      count: createdPlayers.length,
    });
  } catch (error: any) {
    console.error("Error generating fake players:", error);
    return NextResponse.json({ error: error.message || "Eroare la generarea jucătorilor." }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  try {
    // Delete players with fake/demo markers
    const deletedPlayers = await prisma.player.deleteMany({
      where: {
        OR: [
          { email: { contains: "fake_player" } },
          { email: { contains: "demo_player" } },
          { email: { contains: "@player.league.local" } },
        ],
      },
    });

    // Delete corresponding fake user accounts
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: "fake_player" } },
          { email: { contains: "demo_player" } },
          { email: { contains: "@player.league.local" } },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: `Au fost eliminați ${deletedPlayers.count} jucători generați și ${deletedUsers.count} conturi asociate.`,
      deletedPlayersCount: deletedPlayers.count,
      deletedUsersCount: deletedUsers.count,
    });
  } catch (error: any) {
    console.error("Error deleting fake players:", error);
    return NextResponse.json({ error: error.message || "Eroare la ștergerea jucătorilor generați." }, { status: 500 });
  }
}
