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
    name: process.env.ADMIN_NAME || "Admin",
    password: process.env.ADMIN_PASSWORD || "Admin12345",
  },
  {
    email: "demo@leaguehub.local",
    name: "Demo User",
    password: "demo12345",
  },
];

async function ensureUser(email, name, password) {
  if (!email) return null;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] user ${email} already exists, skipping`);
    return existing;
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });
  console.log(`[seed] created user ${email}`);
  return user;
}

async function ensureDemoChampionship(ownerId) {
  const existing = await prisma.championship.findFirst({
    where: { ownerId, name: "Liga Demo 2026" },
  });
  if (existing) {
    console.log("[seed] demo championship already exists, skipping");
    return existing;
  }
  const champ = await prisma.championship.create({
    data: {
      ownerId,
      name: "Liga Demo 2026",
      sport: "Fotbal",
      format: "round_robin",
      season: "2025-2026",
      startDate: new Date(),
      description: "Campionat demonstrativ cu echipe și meciuri pre-populate.",
    },
  });
  const teams = await Promise.all([
    prisma.team.create({ data: { championshipId: champ.id, name: "FC Steaua", shortName: "STE", color: "#dc2626" } }),
    prisma.team.create({ data: { championshipId: champ.id, name: "Dinamo", shortName: "DIN", color: "#1e3a8a" } }),
    prisma.team.create({ data: { championshipId: champ.id, name: "Rapid", shortName: "RAP", color: "#fbbf24" } }),
    prisma.team.create({ data: { championshipId: champ.id, name: "CFR", shortName: "CFR", color: "#7c2d12" } }),
  ]);
  const pairings = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];
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
  console.log("[seed] created demo championship");
  return champ;
}

async function main() {
  for (const s of SEEDS) {
    await ensureUser(s.email, s.name, s.password);
  }
  const adminEmail = SEEDS[0].email;
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) await ensureDemoChampionship(admin.id);

  console.log("[seed] login credentials available:");
  for (const s of SEEDS) {
    console.log(`  ${s.email}  /  ${s.password}`);
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
