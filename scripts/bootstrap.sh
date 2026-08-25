#!/bin/sh
# Bootstrap script for production / Coolify deployment.
# Idempotent: safe to run on every container start.
#
# Responsibilities:
#   1. Ensure DB schema is in sync (prisma db push).
#   2. Seed demo user + championship if no users exist yet.
#   3. Seed a real admin user if ADMIN_EMAIL + ADMIN_PASSWORD env vars are set
#      and the user does not already exist.
#
# Environment variables used:
#   DATABASE_URL                (required) - e.g. file:./dev.db
#   ADMIN_EMAIL                 (optional) - bootstrap admin email
#   ADMIN_PASSWORD              (optional) - bootstrap admin password (min 8 chars)
#   ADMIN_NAME                  (optional) - bootstrap admin display name, default "Admin"
#   SEED_DEMO                   (optional) - "1" to seed demo user/demo championship,
#                                           default "1" when no ADMIN_EMAIL is set

set -eu

cd /app

echo "[bootstrap] DATABASE_URL=${DATABASE_URL:-<not set>}"

# 1. Sync schema
echo "[bootstrap] Running prisma db push..."
npx prisma db push --skip-generate --accept-data-loss=false

# 2. Seed demo + admin users
cat > /tmp/seed-runner.mjs <<'NODE'
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_EMAIL = "demo@leaguehub.local";
const DEMO_PASSWORD = "demo12345";
const DEMO_NAME = "Demo User";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const SEED_DEMO = process.env.SEED_DEMO ?? (ADMIN_EMAIL ? "0" : "1");

async function ensureUser(email, name, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] user ${email} already exists, skipping`);
    return existing;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });
  console.log(`[seed] created user ${email} (id=${user.id})`);
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
  console.log(`[seed] created demo championship ${champ.id}`);
  return champ;
}

try {
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    if (ADMIN_PASSWORD.length < 8) {
      throw new Error("ADMIN_PASSWORD must be at least 8 characters");
    }
    await ensureUser(ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD);
  } else {
    console.log("[seed] ADMIN_EMAIL/ADMIN_PASSWORD not set, skipping admin bootstrap");
  }

  if (SEED_DEMO === "1") {
    const demo = await ensureUser(DEMO_EMAIL, DEMO_NAME, DEMO_PASSWORD);
    await ensureDemoChampionship(demo.id);
    console.log(`[seed] demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log("[seed] SEED_DEMO=0, skipping demo seed");
  }
} catch (e) {
  console.error("[seed] failed:", e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
NODE

echo "[bootstrap] Running seed runner..."
node /tmp/seed-runner.mjs

echo "[bootstrap] Done. Starting application..."
