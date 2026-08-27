import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@leaguehub.local";
  const password = "superadmin12345";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Super Admin", passwordHash, role: "super_admin" },
  });

  // Clean any existing demo championship
  await prisma.championship.deleteMany({ where: { ownerId: user.id, name: "Liga Demo 2026" } });

  const champ = await prisma.championship.create({
    data: {
      ownerId: user.id,
      name: "Liga Națională 2026",
      sport: "Fotbal",
      format: "round_robin",
      season: "2025-2026",
      startDate: new Date(),
      description: "Campionat național cu echipe și meciuri programate.",
    },
  });

  const teams = await Promise.all([
    prisma.team.create({ data: { championshipId: champ.id, name: "FC Steaua", shortName: "STE", color: "#dc2626" } }),
    prisma.team.create({ data: { championshipId: champ.id, name: "Dinamo", shortName: "DIN", color: "#1e3a8a" } }),
    prisma.team.create({ data: { championshipId: champ.id, name: "Rapid", shortName: "RAP", color: "#fbbf24" } }),
    prisma.team.create({ data: { championshipId: champ.id, name: "CFR", shortName: "CFR", color: "#7c2d12" } }),
  ]);

  // Round-robin: 6 meciuri
  const pairings = [
    [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
  ];

  const now = Date.now();
  for (let i = 0; i < pairings.length; i++) {
    const [a, b] = pairings[i];
    const finished = i < 2;
    await prisma.match.create({
      data: {
        championshipId: champ.id,
        homeTeamId: teams[a].id,
        awayTeamId: teams[b].id,
        scheduledAt: new Date(now + i * 86400000),
        round: 1,
        status: finished ? "finished" : "scheduled",
        homeScore: finished ? (i === 0 ? 2 : 1) : null,
        awayScore: finished ? (i === 0 ? 1 : 1) : null,
      },
    });
  }

  console.log("Seed completed. Login:", email, "/", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
