// Production bootstrap. Run via `npm run start` or Docker CMD.
// Zero-config: works even when no environment variables are set.
// Idempotent: safe to run on every container start.

const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const cwd = process.cwd();

// ---- Provide safe defaults for any missing env vars ----
const defaultDbPath = path.join(cwd, "data", "league.db");
const defaultDbUrl = "file:" + defaultDbPath.replace(/\\/g, "/");

process.env.DATABASE_URL = process.env.DATABASE_URL || defaultDbUrl;
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
process.env.NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "dev-secret-change-me-please-this-is-not-secure-change-in-production-min-32";
process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

console.log("[bootstrap] DATABASE_URL=" + process.env.DATABASE_URL);
console.log("[bootstrap] NEXTAUTH_URL=" + process.env.NEXTAUTH_URL);

// Ensure directory exists if SQLite
if (process.env.DATABASE_URL.startsWith("file:")) {
  let rawPath = process.env.DATABASE_URL.replace(/^file:/, "");
  if (!path.isAbsolute(rawPath)) {
    rawPath = path.resolve(cwd, rawPath);
  }
  const dbDir = path.dirname(rawPath);
  if (dbDir && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log("[bootstrap] ensured db directory: " + dbDir);
  }
}

// ---- 1. Sync DB schema ----
console.log("[bootstrap] Running prisma db push...");
try {
  const prismaCliPath = path.join(cwd, "node_modules", "prisma", "build", "index.js");
  if (fs.existsSync(prismaCliPath)) {
    execSync(`node "${prismaCliPath}" db push --skip-generate --accept-data-loss=false`, {
      stdio: "inherit",
      env: process.env,
    });
  } else {
    execSync("npx prisma db push --skip-generate --accept-data-loss=false", {
      stdio: "inherit",
      env: process.env,
    });
  }
} catch (e) {
  console.error("[bootstrap] prisma db push failed:", e.message);
  process.exit(1);
}

// ---- 2. Seed users + demo data (always safe, idempotent) ----
let PrismaClient;
try {
  PrismaClient = require("@prisma/client").PrismaClient;
} catch (e) {
  console.error("[bootstrap] PrismaClient not found, skipping seed:", e.message);
  process.exit(0);
}

let bcrypt = null;
try {
  bcrypt = require("bcryptjs");
} catch {
  // bcryptjs not available, pre-computed hashes will be used
}

const DEFAULT_HASHES = {
  Admin12345: "$2a$10$pt.uEyiSK9nqI.wmjVTzN.v0wp6SaXMXpA4M/o8vCt3trXV80I7CO",
  demo12345: "$2a$10$dENLUmMASeSpb4yXvMbdtOCHVittyfQ4m6WEZPZlip0NXmo.F0JH.",
};

async function hashPassword(password) {
  if (DEFAULT_HASHES[password]) {
    return DEFAULT_HASHES[password];
  }
  if (bcrypt && bcrypt.hash) {
    return await bcrypt.hash(password, 10);
  }
  return DEFAULT_HASHES.Admin12345;
}

const prisma = new PrismaClient();

const SEEDS = [
  {
    email: (process.env.ADMIN_EMAIL || "admin@leaguehub.local").toLowerCase(),
    name: process.env.ADMIN_NAME || "M. Oliver - Organizator",
    password: process.env.ADMIN_PASSWORD || "Admin12345",
    role: "organizer",
  },
  {
    email: "arbitru@leaguehub.local",
    name: "Cristian Balaj - Arbitru FIFA",
    password: "demo12345",
    role: "referee",
    refereeBadge: "FIFA Pro Elite",
    experienceYears: 14,
  },
  {
    email: "kovacs@leaguehub.local",
    name: "István Kovács - Arbitru UEFA",
    password: "demo12345",
    role: "referee",
    refereeBadge: "FIFA Pro Elite",
    experienceYears: 12,
  },
  {
    email: "jucator@leaguehub.local",
    name: "Radu Drăgușin - Fotbalist",
    password: "demo12345",
    role: "player",
    position: "Fundaș Central",
    jerseyNumber: 3,
    preferredFoot: "Drept",
  },
  {
    email: "florin.tanase@leaguehub.local",
    name: "Florin Tănase - Fotbalist",
    password: "demo12345",
    role: "player",
    position: "Mijlocaș Ofensiv",
    jerseyNumber: 10,
    preferredFoot: "Drept",
  },
  {
    email: "arena@leaguehub.local",
    name: "Baza Sportivă Sud - Arenă",
    password: "demo12345",
    role: "arena_owner",
  },
  {
    email: "lider@leaguehub.local",
    name: "Dan Petrescu - Lider Echipă",
    password: "demo12345",
    role: "team_leader",
  },
];

async function ensureUser(userData) {
  if (!userData.email) return null;
  const existing = await prisma.user.findUnique({ where: { email: userData.email } });
  const passwordHash = await hashPassword(userData.password);
  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: userData.name,
        passwordHash,
        role: userData.role || "organizer",
        position: userData.position,
        jerseyNumber: userData.jerseyNumber,
        preferredFoot: userData.preferredFoot,
        refereeBadge: userData.refereeBadge,
        experienceYears: userData.experienceYears,
      },
    });
    return updated;
  }
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      passwordHash,
      role: userData.role || "organizer",
      position: userData.position,
      jerseyNumber: userData.jerseyNumber,
      preferredFoot: userData.preferredFoot,
      refereeBadge: userData.refereeBadge,
      experienceYears: userData.experienceYears,
    },
  });
  console.log(`[seed] created user ${userData.email} (${userData.role})`);
  return user;
}

async function ensureVenues(arenaOwnerId) {
  const count = await prisma.venue.count();
  if (count > 0) return;

  await prisma.venue.createMany({
    data: [
      {
        name: "Arena Națională",
        location: "Bulevardul Basarabia 37-39, București",
        surface: "Gazon Natural Hibrid",
        capacity: 55634,
        floodlights: true,
        pricePerHour: 1500,
        ownerId: arenaOwnerId,
      },
      {
        name: "Stadionul Steaua Ghencea",
        location: "Bulevardul Ghencea 45, București",
        surface: "Gazon Natural Pro",
        capacity: 31254,
        floodlights: true,
        pricePerHour: 1200,
        ownerId: arenaOwnerId,
      },
      {
        name: "Cluj Arena",
        location: "Aleea Stadionului 2, Cluj-Napoca",
        surface: "Gazon Natural",
        capacity: 30201,
        floodlights: true,
        pricePerHour: 950,
        ownerId: arenaOwnerId,
      },
      {
        name: "Complexul Sportiv Craiova",
        location: "Bulevardul Ilie Balaci 8, Craiova",
        surface: "Gazon Mixt",
        capacity: 30983,
        floodlights: true,
        pricePerHour: 900,
        ownerId: arenaOwnerId,
      },
    ],
  });
  console.log("[seed] created demo venues");
}

async function ensureDemoChampionship(ownerId) {
  const existing = await prisma.championship.findFirst({
    where: { ownerId, name: "Liga Pro România 2026" },
  });
  if (existing) {
    return existing;
  }

  const champ = await prisma.championship.create({
    data: {
      ownerId,
      name: "Liga Pro România 2026",
      sport: "Fotbal",
      format: "round_robin",
      season: "2025-2026",
      startDate: new Date(),
      isBracketPublished: true,
      description: "Campionat demonstrativ complet: 8 cluburi de elită, meciuri de campionat și faze eliminatorii cu zaruri 🎲, arbitraj live și rapoarte oficiale PDF.",
    },
  });

  // 8 Elite Teams
  const teamsData = [
    { name: "FCSB București", shortName: "FCS", color: "#dc2626" },
    { name: "CFR 1907 Cluj", shortName: "CFR", color: "#7c2d12" },
    { name: "Universitatea Craiova", shortName: "UCV", color: "#2563eb" },
    { name: "Rapid București", shortName: "RAP", color: "#991b1b" },
    { name: "Farul Constanța", shortName: "FAR", color: "#0284c7" },
    { name: "Dinamo București", shortName: "DIN", color: "#b91c1c" },
    { name: "Oțelul Galați", shortName: "OTE", color: "#ea580c" },
    { name: "Sepsi OSK", shortName: "SEP", color: "#15803d" },
  ];

  const createdTeams = [];
  for (const t of teamsData) {
    const team = await prisma.team.create({
      data: {
        championshipId: champ.id,
        name: t.name,
        shortName: t.shortName,
        color: t.color,
      },
    });

    // Add 3 sample players for each team
    await prisma.player.createMany({
      data: [
        { teamId: team.id, name: `Portar ${t.shortName}`, number: 1, position: "Portar" },
        { teamId: team.id, name: `Fundaș ${t.shortName}`, number: 4, position: "Fundaș" },
        { teamId: team.id, name: `Atacant ${t.shortName}`, number: 9, position: "Atacant" },
      ],
    });

    createdTeams.push(team);
  }

  const venuesList = ["Arena Națională", "Stadionul Steaua Ghencea", "Cluj Arena", "Complexul Sportiv Craiova"];
  const refereesList = ["Cristian Balaj - Arbitru FIFA", "István Kovács - Arbitru UEFA"];

  // Create Quarter Finals (bracket 0, 1, 2, 3)
  const quarterPairings = [
    { home: 0, away: 1, hScore: 2, aScore: 1, finished: true, stage: "quarter_final", bIdx: 0, round: 1 },
    { home: 2, away: 3, hScore: 3, aScore: 2, finished: true, stage: "quarter_final", bIdx: 1, round: 1 },
    { home: 4, away: 5, hScore: null, aScore: null, finished: false, stage: "quarter_final", bIdx: 2, round: 1 },
    { home: 6, away: 7, hScore: null, aScore: null, finished: false, stage: "quarter_final", bIdx: 3, round: 1 },
  ];

  const now = Date.now();

  for (let i = 0; i < quarterPairings.length; i++) {
    const p = quarterPairings[i];
    const homeT = createdTeams[p.home];
    const awayT = createdTeams[p.away];

    const matchEvents = p.finished
      ? JSON.stringify([
          { minute: 14, type: "goal", team: homeT.name, player: `Atacant ${homeT.shortName}`, note: "Șut din interiorul careului" },
          { minute: 38, type: "yellow_card", team: awayT.name, player: `Fundaș ${awayT.shortName}`, note: "Fault tactic" },
          { minute: 55, type: "goal", team: awayT.name, player: `Atacant ${awayT.shortName}`, note: "Finalizare din centrarea laterală" },
          { minute: 82, type: "goal", team: homeT.name, player: `Atacant ${homeT.shortName}`, note: "Lovitură de cap la colțul scurt" },
        ])
      : null;

    await prisma.match.create({
      data: {
        championshipId: champ.id,
        homeTeamId: homeT.id,
        awayTeamId: awayT.id,
        scheduledAt: new Date(now + (i - 2) * 86400000),
        round: p.round,
        status: p.finished ? "finished" : "scheduled",
        homeScore: p.hScore,
        awayScore: p.aScore,
        venue: venuesList[i % venuesList.length],
        referee: refereesList[i % refereesList.length],
        stage: p.stage,
        bracketIndex: p.bIdx,
        homeOffsides: p.finished ? 2 : 0,
        awayOffsides: p.finished ? 1 : 0,
        homeFouls: p.finished ? 11 : 0,
        awayFouls: p.finished ? 14 : 0,
        homeCorners: p.finished ? 6 : 0,
        awayCorners: p.finished ? 4 : 0,
        events: matchEvents,
        refereeNotes: p.finished ? "Partidă disputată într-un spirit deplin de fair-play. Nu au existat incidente disciplinare grave." : null,
        signedBy: p.finished ? refereesList[i % refereesList.length] : null,
        signedAt: p.finished ? new Date() : null,
      },
    });
  }

  // Create Semi-Finals & Grand Final Brackets
  await prisma.match.create({
    data: {
      championshipId: champ.id,
      homeTeamId: createdTeams[0].id,
      awayTeamId: createdTeams[2].id,
      scheduledAt: new Date(now + 3 * 86400000),
      round: 2,
      status: "scheduled",
      venue: "Arena Națională",
      referee: "István Kovács - Arbitru UEFA",
      stage: "semi_final",
      bracketIndex: 0,
    },
  });

  await prisma.match.create({
    data: {
      championshipId: champ.id,
      homeTeamId: createdTeams[4].id,
      awayTeamId: createdTeams[6].id,
      scheduledAt: new Date(now + 4 * 86400000),
      round: 2,
      status: "scheduled",
      venue: "Cluj Arena",
      referee: "Cristian Balaj - Arbitru FIFA",
      stage: "semi_final",
      bracketIndex: 1,
    },
  });

  await prisma.match.create({
    data: {
      championshipId: champ.id,
      homeTeamId: createdTeams[0].id,
      awayTeamId: createdTeams[4].id,
      scheduledAt: new Date(now + 7 * 86400000),
      round: 3,
      status: "scheduled",
      venue: "Arena Națională",
      referee: "Cristian Balaj - Arbitru FIFA",
      stage: "final",
      bracketIndex: 0,
    },
  });

  console.log("[seed] created rich demo championship with 8 teams, matches, brackets, telemetry & PDF report data");
  return champ;
}

async function main() {
  let arenaOwner = null;
  for (const s of SEEDS) {
    const u = await ensureUser(s);
    if (s.role === "arena_owner") arenaOwner = u;
  }
  if (arenaOwner) {
    await ensureVenues(arenaOwner.id);
  }
  const adminEmail = SEEDS[0].email;
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) await ensureDemoChampionship(admin.id);

  console.log("[seed] multi-role login accounts available:");
  for (const s of SEEDS) {
    console.log(`  ${s.email.padEnd(30)} / ${s.password.padEnd(12)} [${s.role}]`);
  }
}

main()
  .catch((e) => {
    console.error("[seed] failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
