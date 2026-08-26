import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

const DEMO_CHAMPIONSHIP_NAMES = [
  "Premier Elite Championship",
  "Liga 1 Pro România",
  "Cupa României",
  "Ligue Pro Turneu Demonstrativ",
];

const DEMO_EMAILS = [
  "arbitru@leaguehub.local",
  "jucator@leaguehub.local",
  "arena@leaguehub.local",
  "lider@leaguehub.local",
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: "Acces interzis. Doar SuperAdmin are acces." }, { status: 403 });
  }

  try {
    const [demoChamps, totalChamps, totalVenues, allUsers, totalMatches, totalPlayers] = await Promise.all([
      prisma.championship.count({
        where: { name: { in: DEMO_CHAMPIONSHIP_NAMES } },
      }),
      prisma.championship.count(),
      prisma.venue.count(),
      prisma.user.findMany({ select: { id: true, email: true } }),
      prisma.match.count(),
      prisma.player.count(),
    ]);

    const realUsers = allUsers.filter(
      (u) => !u.email.endsWith("@leaguehub.local") && !u.email.endsWith("@league.local")
    );
    const demoUsers = allUsers.filter(
      (u) => u.email.endsWith("@leaguehub.local") || u.email.endsWith("@league.local")
    );

    const isDemoActive = demoChamps > 0;

    return NextResponse.json({
      isDemoActive,
      demoChampionshipsCount: demoChamps,
      totalChampionshipsCount: totalChamps,
      totalVenuesCount: totalVenues,
      realUsersCount: realUsers.length,
      demoUsersCount: demoUsers.length,
      totalMatchesCount: totalMatches,
      totalPlayersCount: totalPlayers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: "Acces interzis. Doar SuperAdmin are acces." }, { status: 403 });
  }

  try {
    const { action } = await req.json();

    if (action === "deactivate") {
      // 1. Delete Demo Matches
      await prisma.match.deleteMany({
        where: {
          OR: [
            { championship: { name: { in: DEMO_CHAMPIONSHIP_NAMES } } },
            { championship: { owner: { email: "admin@leaguehub.local" } } },
          ],
        },
      });

      // 2. Delete Demo Teams & Players
      await prisma.player.deleteMany({
        where: {
          team: {
            championship: {
              OR: [
                { name: { in: DEMO_CHAMPIONSHIP_NAMES } },
                { owner: { email: "admin@leaguehub.local" } },
              ],
            },
          },
        },
      });

      await prisma.team.deleteMany({
        where: {
          championship: {
            OR: [
              { name: { in: DEMO_CHAMPIONSHIP_NAMES } },
              { owner: { email: "admin@leaguehub.local" } },
            ],
          },
        },
      });

      // 3. Delete Demo Championships
      await prisma.championship.deleteMany({
        where: {
          OR: [
            { name: { in: DEMO_CHAMPIONSHIP_NAMES } },
            { owner: { email: "admin@leaguehub.local" } },
          ],
        },
      });

      // 4. Delete Placeholder demo referee accounts (keep admin@leaguehub.local and real registered users)
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              "arbitru@leaguehub.local",
              "jucator@leaguehub.local",
              "arena@leaguehub.local",
              "lider@leaguehub.local",
            ],
          },
        },
      });

      // Note: ARENAS (Venue) ARE NEVER TOUCHED!
      return NextResponse.json({
        success: true,
        message: "Datele demo au fost dezactivate cu succes! Arenele și utilizatorii reali au fost păstrați intact.",
      });
    }

    if (action === "activate") {
      // Find or get admin user
      let admin = await prisma.user.findFirst({
        where: { email: "admin@leaguehub.local" },
      });

      if (!admin) {
        admin = await prisma.user.create({
          data: {
            email: "admin@leaguehub.local",
            name: "M. Oliver - SuperAdmin",
            role: "organizer",
            passwordHash: "$2a$10$pt.uEyiSK9nqI.wmjVTzN.v0wp6SaXMXpA4M/o8vCt3trXV80I7CO",
          },
        });
      }

      // 1. Create or restore demo championship
      let champ = await prisma.championship.findFirst({
        where: { name: "Premier Elite Championship" },
      });

      if (!champ) {
        champ = await prisma.championship.create({
          data: {
            name: "Premier Elite Championship",
            sport: "fotbal",
            format: "knockout",
            season: "2025-2026",
            startDate: new Date(),
            scope: "national",
            county: "București",
            city: "București",
            shareCode: "LP-Z2R5V9",
            isBracketPublished: true,
            description: "Turneul Național de Elită cu 8 echipe calificate prin tragere la sorți cu zaruri.",
            ownerId: admin.id,
          },
        });
      }

      // 2. Create 8 Demo Teams if not existing
      const demoTeamsData = [
        { name: "FCSB București", shortName: "FCSB", color: "#1e40af" },
        { name: "CFR 1907 Cluj", shortName: "CFR", color: "#991b1b" },
        { name: "Universitatea Craiova", shortName: "UCRA", color: "#0284c7" },
        { name: "Rapid București", shortName: "RAP", color: "#831843" },
        { name: "Farul Constanța", shortName: "FAR", color: "#0369a1" },
        { name: "Dinamo București", shortName: "DIN", color: "#dc2626" },
        { name: "Politehnica Timișoara", shortName: "POLI", color: "#7c3aed" },
        { name: "Oțelul Galați", shortName: "OTE", color: "#b91c1c" },
      ];

      const createdTeams = [];
      for (const t of demoTeamsData) {
        let team = await prisma.team.findFirst({
          where: { name: t.name, championshipId: champ.id },
        });
        if (!team) {
          team = await prisma.team.create({
            data: {
              name: t.name,
              shortName: t.shortName,
              color: t.color,
              championshipId: champ.id,
            },
          });
        }
        createdTeams.push(team);
      }

      // 3. Create Sample Bracket Matches
      const matchCount = await prisma.match.count({
        where: { championshipId: champ.id },
      });

      if (matchCount === 0 && createdTeams.length === 8) {
        // Quarter Finals (Round 1)
        const q1 = await prisma.match.create({
          data: {
            championshipId: champ.id,
            round: 1,
            stage: "quarter_final",
            homeTeamId: createdTeams[0].id,
            awayTeamId: createdTeams[1].id,
            homeScore: 3,
            awayScore: 1,
            status: "finished",
            venue: "Arena Națională",
            referee: "Ovidiu Hațegan",
            ticketPrice: 35,
            notes: "Zaruri: 6-2",
            scheduledAt: new Date(Date.now() - 86400000 * 4),
          },
        });

        const q2 = await prisma.match.create({
          data: {
            championshipId: champ.id,
            round: 1,
            stage: "quarter_final",
            homeTeamId: createdTeams[2].id,
            awayTeamId: createdTeams[3].id,
            homeScore: 2,
            awayScore: 2,
            status: "finished",
            venue: "Stadionul Ion Oblemenco",
            referee: "Istvan Kovacs",
            ticketPrice: 30,
            notes: "Zaruri: 5-3 (pen)",
            scheduledAt: new Date(Date.now() - 86400000 * 3),
          },
        });

        const q3 = await prisma.match.create({
          data: {
            championshipId: champ.id,
            round: 1,
            stage: "quarter_final",
            homeTeamId: createdTeams[4].id,
            awayTeamId: createdTeams[5].id,
            homeScore: 1,
            awayScore: 0,
            status: "finished",
            venue: "Stadionul Steaua (Ghencea)",
            referee: "Radu Petrescu",
            ticketPrice: 30,
            notes: "Zaruri: 4-1",
            scheduledAt: new Date(Date.now() - 86400000 * 2),
          },
        });

        const q4 = await prisma.match.create({
          data: {
            championshipId: champ.id,
            round: 1,
            stage: "quarter_final",
            homeTeamId: createdTeams[6].id,
            awayTeamId: createdTeams[7].id,
            homeScore: 3,
            awayScore: 2,
            status: "finished",
            venue: "Stadionul Dan Păltinișanu",
            referee: "Horațiu Feșnic",
            ticketPrice: 25,
            notes: "Zaruri: 6-5",
            scheduledAt: new Date(Date.now() - 86400000 * 1),
          },
        });

        // Semi Finals (Round 2)
        await prisma.match.create({
          data: {
            championshipId: champ.id,
            round: 2,
            stage: "semi_final",
            homeTeamId: createdTeams[0].id,
            awayTeamId: createdTeams[2].id,
            homeScore: 2,
            awayScore: 1,
            status: "finished",
            venue: "Arena Națională",
            referee: "Istvan Kovacs",
            ticketPrice: 45,
            notes: "Zaruri: 5-4",
            scheduledAt: new Date(Date.now() - 86400000 * 1),
          },
        });

        await prisma.match.create({
          data: {
            championshipId: champ.id,
            round: 2,
            stage: "semi_final",
            homeTeamId: createdTeams[4].id,
            awayTeamId: createdTeams[6].id,
            status: "scheduled",
            venue: "Stadionul Steaua (Ghencea)",
            referee: "Ovidiu Hațegan",
            ticketPrice: 40,
            scheduledAt: new Date(Date.now() + 86400000 * 2),
          },
        });

        // Grand Final (Round 3)
        await prisma.match.create({
          data: {
            championshipId: champ.id,
            round: 3,
            stage: "final",
            homeTeamId: createdTeams[0].id,
            awayTeamId: createdTeams[4].id,
            status: "scheduled",
            venue: "Arena Națională",
            referee: "Istvan Kovacs",
            ticketPrice: 60,
            scheduledAt: new Date(Date.now() + 86400000 * 5),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Datele demonstrative au fost activate cu succes! Campionatul, echipele și meciurile demonstrative sunt live.",
      });
    }

    return NextResponse.json({ error: "Acțiune invalidă. Folosește 'activate' sau 'deactivate'." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
