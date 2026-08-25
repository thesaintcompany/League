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

async function ensureReferees() {
  const REFEREES_30 = [
    // Top 10 Spotlight Elite Referees
    {
      email: "istvan.kovacs@leaguehub.local",
      name: "István Kovács",
      refereeBadge: "FIFA Pro Elite",
      experienceYears: 17,
      phone: "+40 722 101 001",
      bio: "Arbitru FIFA Elite, delegat la finale europene UEFA și turnee finale mondiale.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "ovidiu.hategan@leaguehub.local",
      name: "Ovidiu Hațegan",
      refereeBadge: "FIFA Pro Elite",
      experienceYears: 19,
      phone: "+40 722 101 002",
      bio: "Medic și arbitru internațional FIFA Elite de peste 15 ani în UEFA Champions League.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "radu.petrescu@leaguehub.local",
      name: "Radu Petrescu",
      refereeBadge: "FIFA International",
      experienceYears: 15,
      phone: "+40 722 101 003",
      bio: "Arbitru internațional FIFA cu zeci de derby-uri naționale conduse impecabil.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "horatiu.fesnic@leaguehub.local",
      name: "Horațiu Feșnic",
      refereeBadge: "FIFA International",
      experienceYears: 13,
      phone: "+40 722 101 004",
      bio: "Arbitru FIFA categorie First, stil atletic și decizii ferme în teren.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "marian.barbu@leaguehub.local",
      name: "Marian Barbu",
      refereeBadge: "FIFA International",
      experienceYears: 11,
      phone: "+40 722 101 005",
      bio: "Arbitru FIFA tânăr și dinamic, cu prezențe regulate în cupele europene.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "andrei.chivulete@leaguehub.local",
      name: "Andrei Chivulete",
      refereeBadge: "FIFA International",
      experienceYears: 12,
      phone: "+40 722 101 006",
      bio: "Arbitru central FIFA, specializat pe meciuri de mare intensitate și presiune.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "sebastian.coltescu@leaguehub.local",
      name: "Sebastian Colțescu",
      refereeBadge: "Liga 1 Senior Pro",
      experienceYears: 21,
      phone: "+40 722 101 007",
      bio: "Veteran al corpului de arbitri, peste 350 de meciuri conduse în primul eșalon.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "iuliana.demetrescu@leaguehub.local",
      name: "Iuliana Demetrescu",
      refereeBadge: "FIFA Women Elite",
      experienceYears: 12,
      phone: "+40 722 101 008",
      bio: "Arbitru FIFA Elite, finalistă la Campionatele Mondiale și Europene.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "alina.pesu@leaguehub.local",
      name: "Alina Peșu",
      refereeBadge: "FIFA Women Elite",
      experienceYears: 10,
      phone: "+40 722 101 009",
      bio: "Arbitru FIFA cu ecuson internațional, arbitraj precis și poziționare impecabilă.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "catalin.popa@leaguehub.local",
      name: "Cătălin Popa",
      refereeBadge: "FIFA VAR Pro",
      experienceYears: 14,
      phone: "+40 722 101 010",
      bio: "Specialist certificat FIFA în tehnologia VAR și analiza video a fazelor limită.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },

    // 20 Additional Official Referees
    {
      email: "adrian.cojocaru@leaguehub.local",
      name: "Adrian Cojocaru",
      refereeBadge: "Liga 1 Central Pro",
      experienceYears: 13,
      phone: "+40 722 101 011",
      bio: "Arbitru Liga 1 cu vastă experiență în partidele din play-off.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "iulian.calin@leaguehub.local",
      name: "Iulian Călin",
      refereeBadge: "Liga 1 Central Pro",
      experienceYears: 14,
      phone: "+40 722 101 012",
      bio: "Arbitru consacrat în campionatele naționale.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "iulian.dima@leaguehub.local",
      name: "Iulian Dima",
      refereeBadge: "Liga 1 Central Pro",
      experienceYears: 15,
      phone: "+40 722 101 013",
      bio: "Arbitru central și asistent VAR atestat.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "vasile.marinescu@leaguehub.local",
      name: "Vasile Marinescu",
      refereeBadge: "FIFA Asistent Elite",
      experienceYears: 16,
      phone: "+40 722 101 014",
      bio: "Arbitru asistent FIFA Elite prezent la semifinale de UEFA Champions League.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "mihai.artene@leaguehub.local",
      name: "Mihai Artene",
      refereeBadge: "FIFA Asistent Elite",
      experienceYears: 15,
      phone: "+40 722 101 015",
      bio: "Arbitru asistent FIFA Elite în brigada de top a României.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "mircea.grigoriu@leaguehub.local",
      name: "Mircea Grigoriu",
      refereeBadge: "FIFA Asistent",
      experienceYears: 12,
      phone: "+40 722 101 016",
      bio: "Arbitru asistent internațional cu mare acuratețe la semnalizările de ofsaid.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "sebastian.gheorghe@leaguehub.local",
      name: "Sebastian Gheorghe",
      refereeBadge: "FIFA Asistent",
      experienceYears: 13,
      phone: "+40 722 101 017",
      bio: "Arbitru asistent FIFA de înalt nivel în partide internaționale.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "rares.vidican@leaguehub.local",
      name: "Rareș Vidican",
      refereeBadge: "Liga 1 Central Pro",
      experienceYears: 9,
      phone: "+40 722 101 018",
      bio: "Arbitru tânăr promovat în lotul de elită.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "szabolcs.kovacs@leaguehub.local",
      name: "Szabolcs Kovács",
      refereeBadge: "Liga 1 Central Pro",
      experienceYears: 8,
      phone: "+40 722 101 019",
      bio: "Arbitru central proactiv cu fluier ferm.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "florin.andrei@leaguehub.local",
      name: "Florin Andrei",
      refereeBadge: "Liga 1 Central Pro",
      experienceYears: 10,
      phone: "+40 722 101 020",
      bio: "Arbitru central cu peste 100 de meciuri oficiale.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "bogdan.dumitrache@leaguehub.local",
      name: "Bogdan Dumitrache",
      refereeBadge: "Liga 1 Central",
      experienceYears: 9,
      phone: "+40 722 101 021",
      bio: "Arbitru central apreciat pentru disciplina pe teren.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "george.gaman@leaguehub.local",
      name: "George Găman",
      refereeBadge: "Liga 1 Central",
      experienceYears: 12,
      phone: "+40 722 101 022",
      bio: "Arbitru experimentat al primului eșalon.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "horia.mladinovici@leaguehub.local",
      name: "Horia Mladinovici",
      refereeBadge: "Liga Pro Central",
      experienceYears: 10,
      phone: "+40 722 101 023",
      bio: "Arbitru central la nivel național și regional.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "sorin.costreie@leaguehub.local",
      name: "Sorin Costreie",
      refereeBadge: "Liga Pro Central",
      experienceYears: 7,
      phone: "+40 722 101 024",
      bio: "Arbitru cu mare mobilitate și decizii rapide.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "valentin.porumbel@leaguehub.local",
      name: "Valentin Porumbel",
      refereeBadge: "Regional Banat & Timiș",
      experienceYears: 8,
      phone: "+40 722 101 025",
      bio: "Arbitru regional de top pentru arenele din județul Timiș.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "claudiu.marcu@leaguehub.local",
      name: "Claudiu Marcu",
      refereeBadge: "Liga 1 Asistent",
      experienceYears: 8,
      phone: "+40 722 101 026",
      bio: "Arbitru asistent omologat pe stadioane de elită.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "vlad.baban@leaguehub.local",
      name: "Vlad Baban",
      refereeBadge: "Liga Pro Asistent",
      experienceYears: 7,
      phone: "+40 722 101 027",
      bio: "Asistent de linie cu viteză excelentă de reacție.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "cosmin.bojan@leaguehub.local",
      name: "Cosmin Bojan",
      refereeBadge: "Regional & Tineret",
      experienceYears: 6,
      phone: "+40 722 101 028",
      bio: "Arbitru specializat pe turneele de juniori și minifotbal.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "alexandru.deaconu@leaguehub.local",
      name: "Alexandru Deaconu",
      refereeBadge: "Supervizor Corp Arbitri",
      experienceYears: 22,
      phone: "+40 722 101 029",
      bio: "Observator oficial și formator al noilor generații de arbitri.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      email: "cristian.balaj@leaguehub.local",
      name: "Cristian Balaj",
      refereeBadge: "Expert FIFA & Observator",
      experienceYears: 24,
      phone: "+40 722 101 030",
      bio: "Fost arbitru FIFA de legendă, consultant pe regulamente oficiale de joc.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      coverPhotoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const defaultHash = await hashPassword("demo12345");

  for (const ref of REFEREES_30) {
    const existing = await prisma.user.findUnique({ where: { email: ref.email } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: ref.name,
          role: "referee",
          refereeBadge: ref.refereeBadge,
          experienceYears: ref.experienceYears,
          phone: ref.phone,
          bio: ref.bio,
          image: ref.image,
          coverPhotoUrl: ref.coverPhotoUrl,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          email: ref.email,
          name: ref.name,
          passwordHash: defaultHash,
          role: "referee",
          refereeBadge: ref.refereeBadge,
          experienceYears: ref.experienceYears,
          phone: ref.phone,
          bio: ref.bio,
          image: ref.image,
          coverPhotoUrl: ref.coverPhotoUrl,
        },
      });
    }
  }

  console.log(`[seed] seeded/updated 30 official licensed referees with full-body photos and FIFA badges`);
}

async function ensureVenues(arenaOwnerId) {
  // Delete and recreate venues to ensure all Timis County arenas are present and up to date
  await prisma.venue.deleteMany({});

  const TIMIS_VENUES = [
    // --- FOTBAL (Timișoara & Județul Timiș) ---
    {
      name: "Stadionul Dan Păltinișanu",
      location: "Timișoara",
      address: "Str. Ștefan cel Mare, Timișoara",
      specs: "32.972 de locuri (al doilea stadion ca mărime din România), gazon natural, pistă atletism",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 32972,
      floodlights: true,
      pricePerHour: 450,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Stadionul CFR",
      location: "Timișoara",
      address: "Str. Nera nr. 4, Timișoara",
      specs: "7.000 de locuri, gazon natural, tribună acoperită",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 7000,
      floodlights: true,
      pricePerHour: 250,
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Baza Sportivă Vasport",
      location: "Timișoara",
      address: "Calea Şagului nr. 175, Timișoara",
      specs: "Minifotbal, iarbă sintetică profesională 55 mm, vestiare moderne",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 300,
      floodlights: true,
      pricePerHour: 180,
      imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Tonomatul de Fotbal",
      location: "Timișoara",
      address: "Splaiul Tudor Vladimirescu nr. 16A, Timișoara",
      specs: "Două terenuri: 30x17m sau 40x20m, manta de protecție, nocturnă LED",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 200,
      floodlights: true,
      pricePerHour: 160,
      imageUrl: "https://images.unsplash.com/photo-1518604666864-7423958f76d9?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Stadion Galaxy",
      location: "Timișoara",
      address: "Str. Costică Rădulescu, Timișoara",
      specs: "Gazon sintetic ultramodern, nocturnă puternică, teren volei nisip",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 500,
      floodlights: true,
      pricePerHour: 200,
      imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Complex Sportiv UMT",
      location: "Timișoara",
      address: "Aleea Avram Imbroane, Timișoara",
      specs: "3 terenuri sintetice de minifotbal, parcare privată, terasă",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 400,
      floodlights: true,
      pricePerHour: 170,
      imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Baza Sportivă Neferprod",
      location: "Timișoara",
      address: "Ioan Slavici nr. 113, Timișoara",
      specs: "Terenuri acoperite și în aer liber, încălzire iarna",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 250,
      floodlights: true,
      pricePerHour: 190,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Premier Arena",
      location: "Timișoara / Moșnița",
      address: "Zona Moșnița Nouă, Timiș",
      specs: "Fotbal, Tenis cu piciorul, vestiare premium",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 350,
      floodlights: true,
      pricePerHour: 180,
      imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sinapsa Sport",
      location: "Timișoara",
      address: "Str. Grigore Alexandrescu, Timișoara",
      specs: "Două terenuri (acoperite iarna cu baloane presostatice)",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 300,
      floodlights: true,
      pricePerHour: 175,
      imageUrl: "https://images.unsplash.com/photo-1489944445391-11dd35574549?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Baza Sportivă 2 – UPT",
      location: "Timișoara",
      address: "Str. Prof. Dr. Aurel Păunescu Podeanu nr. 2, Timișoara",
      specs: "Două terenuri de fotbal cu gazon + unul acoperit, sală baschet/volei, bazin",
      sport: "multifunctional",
      surface: "Mixt",
      capacity: 1500,
      floodlights: true,
      pricePerHour: 220,
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Baza Sportivă „Vasile Deheleanu”",
      location: "Timișoara",
      address: "Cartierul Mehala / Ronaț, Timișoara",
      specs: "Teren de fotbal + teren multifuncțional baschet/handbal",
      sport: "multifunctional",
      surface: "Sintetic",
      capacity: 500,
      floodlights: true,
      pricePerHour: 150,
      imageUrl: "https://images.unsplash.com/photo-1518604666864-7423958f76d9?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Baza Sportivă de pe strada Mircea cel Bătrân",
      location: "Timișoara",
      address: "Str. Mircea cel Bătrân, Timișoara",
      specs: "Construită de la zero de municipalitate, gazon sintetic de ultimă generație",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 400,
      floodlights: true,
      pricePerHour: 140,
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Complexul Sportiv Bega",
      location: "Timișoara",
      address: "Str. Intrarea Zânelor nr. 2, Timișoara",
      specs: "Închiriere terenuri fotbal și multisport",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 300,
      floodlights: true,
      pricePerHour: 160,
      imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Baza Sportivă Florin Constantinescu",
      location: "Sânnicolau Mare",
      address: "Str. Stadionului nr. 12.A, Sânnicolau Mare",
      specs: "500 locuri în tribună, vestiare, gazon natural de calitate",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 500,
      floodlights: true,
      pricePerHour: 150,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Lugoj Arena",
      location: "Lugoj",
      address: "Municipiul Lugoj, Timiș",
      specs: "500 locuri în tribună, gazon sintetic certificat",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 500,
      floodlights: true,
      pricePerHour: 150,
      imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Stadionul Tineretului (Vulturii)",
      location: "Lugoj",
      address: "Municipiul Lugoj, Timiș",
      specs: "6.000 de locuri (3.000 scaune), inaugurat 1920, arenă istorică",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 6000,
      floodlights: true,
      pricePerHour: 200,
      imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Arena Boldur",
      location: "Boldur",
      address: "Comuna Boldur, Județul Timiș",
      specs: "Teren de fotbal cu gazon natural și vestiare",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 400,
      floodlights: false,
      pricePerHour: 100,
      imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Arena Berini",
      location: "Berini",
      address: "Comuna Berini, Județul Timiș",
      specs: "Teren de fotbal în aer liber",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 300,
      floodlights: false,
      pricePerHour: 90,
      imageUrl: "https://images.unsplash.com/photo-1518604666864-7423958f76d9?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Arpad Thierjung",
      location: "Jimbolia",
      address: "Orașul Jimbolia, Județul Timiș",
      specs: "Teren de fotbal cu tribune și vestiare",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 1000,
      floodlights: true,
      pricePerHour: 120,
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Tibi Tunda Ghiroda",
      location: "Ghiroda",
      address: "Comuna Ghiroda, lângă Timișoara",
      specs: "Teren de fotbal omologat, gazon impecabil",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 800,
      floodlights: true,
      pricePerHour: 160,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Aeroport",
      location: "Giarmata Vii",
      address: "Giarmata Vii, Județul Timiș",
      specs: "Teren de fotbal cu nocturnă și vestiare",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 350,
      floodlights: true,
      pricePerHour: 110,
      imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Central Buziaș",
      location: "Buziaș",
      address: "Orașul Buziaș, Județul Timiș",
      specs: "Teren de fotbal central",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 600,
      floodlights: false,
      pricePerHour: 100,
      imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Teren sintetic Dumbrăvița",
      location: "Dumbrăvița",
      address: "Comuna Dumbrăvița, lângă Timișoara",
      specs: "Amenajare teren sintetic cu pistă de alergare, nocturnă",
      sport: "fotbal",
      surface: "Sintetic",
      capacity: 500,
      floodlights: true,
      pricePerHour: 160,
      imageUrl: "https://images.unsplash.com/photo-1518604666864-7423958f76d9?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Bază sportivă Tip 1 – Lugoj",
      location: "Lugoj",
      address: "Municipiul Lugoj, Județul Timiș",
      specs: "Teren sintetic de fotbal + teren multifuncțional mic, nocturnă, tribune, vestiare",
      sport: "multifunctional",
      surface: "Sintetic",
      capacity: 500,
      floodlights: true,
      pricePerHour: 160,
      imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },

    // --- BASCHET, VOLEI & MULTIFUNCȚIONAL ---
    {
      name: "Teren baschet pe malul Begăi",
      location: "Timișoara",
      address: "Malul Begăi (lângă Baza CSS Bega), Timișoara",
      specs: "3.600 mp, acces gratuit, iluminat public pe timp de noapte",
      sport: "baschet",
      surface: "Mixt",
      capacity: 200,
      floodlights: true,
      pricePerHour: 0,
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Sporturilor „Constantin Jude”",
      location: "Timișoara",
      address: "Aleea FC Ripensia nr. 7, Timișoara",
      specs: "Sală oficială cu parchet omologat, 1.400 de locuri, baschet, volei, futsal, handbal",
      sport: "multifunctional",
      surface: "Parchet",
      capacity: 1400,
      floodlights: true,
      pricePerHour: 300,
      imageUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Banu Sport",
      location: "Timișoara",
      address: "Aleea F.C. Ripensia nr. 33, Timișoara",
      specs: "Sală multifuncțională (baschet, volei, tenis, badminton, fitness)",
      sport: "multifunctional",
      surface: "Parchet",
      capacity: 600,
      floodlights: true,
      pricePerHour: 200,
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Complexul Multifuncțional „Timiș 4 All”",
      location: "Giroc (limită Timișoara)",
      address: "Limita dintre Timișoara și comuna Giroc",
      specs: "Cel mai mare complex din România (9-16 ha): Fotbal, baschet, volei, tenis, atletism, înot",
      sport: "multifunctional",
      surface: "Mixt",
      capacity: 5000,
      floodlights: true,
      pricePerHour: 250,
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Complex sportiv Sânandrei",
      location: "Sânandrei",
      address: "Comuna Sânandrei, Județul Timiș",
      specs: "Sală sport modernă, bazin acoperit, padel, tenis, fotbal, baschet, volei",
      sport: "multifunctional",
      surface: "Mixt",
      capacity: 800,
      floodlights: true,
      pricePerHour: 180,
      imageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sală de sport Boldur",
      location: "Boldur",
      address: "Comuna Boldur, Județul Timiș",
      specs: "Sală modernă pentru baschet, volei, handbal, tenis de câmp",
      sport: "multifunctional",
      surface: "Parchet",
      capacity: 350,
      floodlights: true,
      pricePerHour: 120,
      imageUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Arena Sportivă Dudeștii Noi",
      location: "Dudeștii Noi",
      address: "Strada Școlii Vechi, Dudeștii Noi",
      specs: "Teren de volei, fotbal acoperit, tenis",
      sport: "multifunctional",
      surface: "Sintetic",
      capacity: 300,
      floodlights: true,
      pricePerHour: 130,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Baza Sportivă Padel Center (Arena Constructim)",
      location: "Dumbrăvița",
      address: "Str. Praga 6, Dumbrăvița",
      specs: "Terenuri de padel panoramice, nocturnă, bar sportiv",
      sport: "multifunctional",
      surface: "Sintetic",
      capacity: 250,
      floodlights: true,
      pricePerHour: 140,
      imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Baza Sportivă din Parcul Rozelor",
      location: "Timișoara",
      county: "Timiș",
      status: "activ",
      address: "Parcul Rozelor, Timișoara",
      specs: "Teren de volei pe nisip fin, amenajare pe timp de vară",
      sport: "volei",
      surface: "Nisip",
      capacity: 200,
      floodlights: true,
      pricePerHour: 100,
      imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
  ];

  // --- STADIOANE DE FOTBAL DE TOP (> 10.000 locuri) ---
  const TOP_NATIONAL_STADIUMS = [
    {
      name: "Arena Națională",
      location: "București",
      county: "București",
      status: "activ",
      address: "Bulevardul Basarabia 37-39, București",
      specs: "55.634 locuri (cel mai mare stadion din România), acoperiș retractabil, nocturnă 2000 lucși, beneficiar: Echipa Națională, FCSB, Dinamo",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 55634,
      floodlights: true,
      pricePerHour: 1200,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Stadionul Steaua",
      location: "București",
      county: "București",
      status: "activ",
      address: "Bulevardul Ghencea 45, București",
      specs: "31.254 locuri, gazon hibrid cu încălzire și drenaj modern, inaugurat 2021, beneficiar: CSA Steaua",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 31254,
      floodlights: true,
      pricePerHour: 800,
      imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Stadionul Ion Oblemenco",
      location: "Craiova",
      county: "Dolj",
      status: "activ",
      address: "Bulevardul Ilie Balaci 8, Craiova",
      specs: "30.983 locuri, arenă modernă UEFA Categoria 4, beneficiar principal: Universitatea Craiova",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 30983,
      floodlights: true,
      pricePerHour: 750,
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Noul Stadion Timișoara",
      location: "Timișoara",
      county: "Timiș",
      status: "constructie",
      address: "Str. Ștefan cel Mare (locație noul Dan Păltinișanu), Timișoara",
      specs: "32.000 locuri estimat, arenă ultramodernă fără pistă de atletism, CNI",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 32000,
      floodlights: true,
      pricePerHour: 900,
      imageUrl: "https://images.unsplash.com/photo-1518604666864-7423958f76d9?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Stadionul Rapid (Rapid Arena)",
      location: "București",
      county: "București",
      status: "activ",
      address: "Calea Giulești 18, București",
      specs: "14.050 locuri, gazon hibrid de ultimă generație, tribune acoperite complet, beneficiar: Rapid București",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 14050,
      floodlights: true,
      pricePerHour: 600,
      imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Stadionul Oțelul",
      location: "Galați",
      county: "Galați",
      status: "activ",
      address: "Str. Anghel Saligny 2, Galați",
      specs: "13.932 locuri, nocturnă modernă, beneficiar: Oțelul Galați",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 13932,
      floodlights: true,
      pricePerHour: 450,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Stadion Nicolae Dobrin",
      location: "Pitești",
      county: "Argeș",
      status: "constructie",
      address: "Str. Nicolae Dobrin 10, Pitești",
      specs: "15.000 locuri, modernizare completă la standarde UEFA Categoria 4",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 15000,
      floodlights: true,
      pricePerHour: 400,
      imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Stadion Municipal Botoșani",
      location: "Botoșani",
      county: "Botoșani",
      status: "activ",
      address: "Calea Națională 64, Botoșani",
      specs: "11.000 locuri, gazon natural, nocturnă și tribune acoperite",
      sport: "fotbal",
      surface: "Gazon Natural",
      capacity: 11000,
      floodlights: true,
      pricePerHour: 350,
      imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
  ];

  // --- SĂLI POLIVALENTE INAUGURATE & ACTIVE ---
  const POLYVALENT_HALLS = [
    {
      name: "BTarena (Sala Polivalentă Cluj-Napoca)",
      location: "Cluj-Napoca",
      county: "Cluj",
      status: "activ",
      address: "Aleea Stadionului 4, Cluj-Napoca",
      specs: "10.000 locuri, parchet omologat FIBA & EHF, sală de nivel mondial, gazdă meciuri internaționale",
      sport: "multifunctional",
      surface: "Parchet",
      capacity: 10000,
      floodlights: true,
      pricePerHour: 600,
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă București",
      location: "București",
      county: "București",
      status: "activ",
      address: "Calea Piscului 10 (Parcul Tineretului), București",
      specs: "5.300 locuri, handbal, volei, baschet, tenis, sală istorică inaugurată 1974",
      sport: "multifunctional",
      surface: "Parchet",
      capacity: 5300,
      floodlights: true,
      pricePerHour: 500,
      imageUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Oradea",
      location: "Oradea",
      county: "Bihor",
      status: "activ",
      address: "Str. Traian Blajovici 24, Oradea",
      specs: "5.300 locuri, inaugurată 2022, baschet, handbal, volei, parchet olimpic",
      sport: "baschet",
      surface: "Parchet",
      capacity: 5300,
      floodlights: true,
      pricePerHour: 450,
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Pitești Arena",
      location: "Pitești",
      county: "Argeș",
      status: "activ",
      address: "Str. Basarabiei 35, Pitești",
      specs: "4.900 locuri, inaugurată 2022, baschet, volei, handbal, cub video central",
      sport: "baschet",
      surface: "Parchet",
      capacity: 4900,
      floodlights: true,
      pricePerHour: 400,
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Tulcea",
      location: "Tulcea",
      county: "Tulcea",
      status: "activ",
      address: "Str. Isaccei, Tulcea",
      specs: "4.670 locuri, inaugurată 2026, sporturi de sală, volei, baschet, handbal",
      sport: "volei",
      surface: "Parchet",
      capacity: 4670,
      floodlights: true,
      pricePerHour: 350,
      imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Craiova",
      location: "Craiova",
      county: "Dolj",
      status: "activ",
      address: "Bulevardul Știrbei Vodă 32, Craiova",
      specs: "4.215 locuri, inaugurată 2012, baschet, handbal, volei, meciuri naționale",
      sport: "handbal",
      surface: "Parchet",
      capacity: 4215,
      floodlights: true,
      pricePerHour: 380,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Sfântu Gheorghe",
      location: "Sfântu Gheorghe",
      county: "Covasna",
      status: "activ",
      address: "Str. Lunca Oltului, Sfântu Gheorghe",
      specs: "3.000 locuri, inaugurată 2019, handbal, baschet, Sepsi Arena",
      sport: "baschet",
      surface: "Parchet",
      capacity: 3000,
      floodlights: true,
      pricePerHour: 300,
      imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Bistrița (TeraPlast Arena)",
      location: "Bistrița",
      county: "Bistrița-Năsăud",
      status: "activ",
      address: "Str. Aerodromului 1, Bistrița",
      specs: "3.000 locuri, inaugurată 2021, handbal, baschet, Gloriei Bistrița",
      sport: "handbal",
      surface: "Parchet",
      capacity: 3000,
      floodlights: true,
      pricePerHour: 300,
      imageUrl: "https://images.unsplash.com/photo-1518604666864-7423958f76d9?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Mioveni",
      location: "Mioveni",
      county: "Argeș",
      status: "activ",
      address: "Bulevardul Dacia 1, Mioveni",
      specs: "2.000 locuri, inaugurată 2019, baschet, handbal, volei",
      sport: "handbal",
      surface: "Parchet",
      capacity: 2000,
      floodlights: true,
      pricePerHour: 250,
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Dinamo",
      location: "București",
      county: "București",
      status: "activ",
      address: "Șoseaua Ștefan cel Mare 7-9, București",
      specs: "2.500 locuri, handbal EHF Champions League, volei, baschet",
      sport: "handbal",
      surface: "Parchet",
      capacity: 2500,
      floodlights: true,
      pricePerHour: 350,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
  ];

  // --- SĂLI POLIVALENTE ÎN CONSTRUCȚIE SAU PROIECT ---
  const FUTURE_PROJECTS = [
    {
      name: "Sala Polivalentă Brașov",
      location: "Brașov",
      county: "Brașov",
      status: "constructie",
      address: "Str. Hărmanului, Brașov",
      specs: "10.059 locuri, în construcție CNI, arenă ultramodernă cu parchet olimpic și cub video",
      sport: "multifunctional",
      surface: "Parchet",
      capacity: 10059,
      floodlights: true,
      pricePerHour: 600,
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Constanța",
      location: "Constanța",
      county: "Constanța",
      status: "constructie",
      address: "Bulevardul Aurel Vlaicu, Constanța",
      specs: "5.000 locuri, în construcție, sporturi de sală, handbal, baschet",
      sport: "handbal",
      surface: "Parchet",
      capacity: 5000,
      floodlights: true,
      pricePerHour: 400,
      imageUrl: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Suceava",
      location: "Suceava",
      county: "Suceava",
      status: "constructie",
      address: "Bulevardul 1 Decembrie 1918, Suceava",
      specs: "5.000 locuri, în construcție, arenă multifuncțională",
      sport: "handbal",
      surface: "Parchet",
      capacity: 5000,
      floodlights: true,
      pricePerHour: 350,
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Turda (Turda Arena)",
      location: "Turda",
      county: "Cluj",
      status: "constructie",
      address: "Str. Stadionului, Turda",
      specs: "3.320 locuri, în construcție avansată, handbal Potaissa Turda",
      sport: "handbal",
      surface: "Parchet",
      capacity: 3320,
      floodlights: true,
      pricePerHour: 300,
      imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Blaj (Alba Blaj Arena)",
      location: "Blaj",
      county: "Alba",
      status: "constructie",
      address: "Bulevardul Republicii, Blaj",
      specs: "2.500 locuri, volei feminin Champions League Volei Alba Blaj",
      sport: "volei",
      surface: "Parchet",
      capacity: 2500,
      floodlights: true,
      pricePerHour: 280,
      imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Noua Sală Polivalentă București",
      location: "București",
      county: "București",
      status: "proiect",
      address: "Complexul Național Lia Manoliu, București",
      specs: "20.000 locuri estimat, proiect arenă olimpică multifuncțională",
      sport: "multifunctional",
      surface: "Parchet",
      capacity: 20000,
      floodlights: true,
      pricePerHour: 1000,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Noua Sală Polivalentă Timișoara",
      location: "Timișoara",
      county: "Timiș",
      status: "proiect",
      address: "Zona Calea Torontalului / Aeroport, Timișoara",
      specs: "16.000 locuri, proiect CNI arenă polivalentă modernă pentru Banat",
      sport: "multifunctional",
      surface: "Parchet",
      capacity: 16000,
      floodlights: true,
      pricePerHour: 800,
      imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
    {
      name: "Sala Polivalentă Iași (Regina Maria)",
      location: "Iași",
      county: "Iași",
      status: "proiect",
      address: "Zona Moara de Vânt, Iași",
      specs: "10.000 locuri, în fază de proiectare arenă multifuncțională a Moldovei",
      sport: "multifunctional",
      surface: "Parchet",
      capacity: 10000,
      floodlights: true,
      pricePerHour: 600,
      imageUrl: "https://images.unsplash.com/photo-1518604666864-7423958f76d9?w=800&auto=format&fit=crop&q=80",
      ownerId: arenaOwnerId,
    },
  ];

  const ALL_VENUES = [
    ...TOP_NATIONAL_STADIUMS,
    ...POLYVALENT_HALLS,
    ...FUTURE_PROJECTS,
    ...TIMIS_VENUES.map((v) => ({ ...v, county: "Timiș", status: "activ" })),
  ];

  await prisma.venue.createMany({
    data: ALL_VENUES,
  });
  console.log(`[seed] seeded ${ALL_VENUES.length} national stadiums, polyvalent halls, and county arenas across Romania`);
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

    createdTeams.push(team);
  }

  // Delete existing players and seed 10 Best Top Scorers of past season
  await prisma.player.deleteMany({});

  const TOP_SCORERS = [
    {
      name: "Florin Tănase",
      teamShort: "FCS",
      number: 10,
      position: "Mijlocaș Ofensiv / Atacant",
      goals: 18,
      matchesCount: 28,
      assists: 6,
      rating: 9.2,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Louis Munteanu",
      teamShort: "CFR",
      number: 9,
      position: "Atacant Central",
      goals: 16,
      matchesCount: 26,
      assists: 4,
      rating: 9.0,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Alexandru Mitriță",
      teamShort: "UCV",
      number: 28,
      position: "Extremă Stânga",
      goals: 15,
      matchesCount: 27,
      assists: 9,
      rating: 9.1,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Albion Rrahmani",
      teamShort: "RAP",
      number: 9,
      position: "Atacant Central",
      goals: 14,
      matchesCount: 24,
      assists: 3,
      rating: 8.9,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Denis Alibec",
      teamShort: "FAR",
      number: 7,
      position: "Atacant Central",
      goals: 13,
      matchesCount: 25,
      assists: 7,
      rating: 8.8,
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Astrit Selmani",
      teamShort: "DIN",
      number: 9,
      position: "Atacant Central",
      goals: 12,
      matchesCount: 26,
      assists: 4,
      rating: 8.7,
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Alexandru Pop",
      teamShort: "OTE",
      number: 11,
      position: "Extremă Dreapta",
      goals: 11,
      matchesCount: 28,
      assists: 2,
      rating: 8.6,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Gabriel Debeljuh",
      teamShort: "SEP",
      number: 96,
      position: "Atacant Central",
      goals: 10,
      matchesCount: 22,
      assists: 3,
      rating: 8.5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Darius Olaru",
      teamShort: "FCS",
      number: 27,
      position: "Mijlocaș Central",
      goals: 10,
      matchesCount: 27,
      assists: 8,
      rating: 8.9,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
    {
      name: "Daniel Bîrligea",
      teamShort: "FCS",
      number: 9,
      position: "Atacant Central",
      goals: 9,
      matchesCount: 23,
      assists: 4,
      rating: 8.6,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    },
  ];

  for (const p of TOP_SCORERS) {
    const team = createdTeams.find((t) => t.shortName === p.teamShort) || createdTeams[0];
    await prisma.player.create({
      data: {
        teamId: team.id,
        name: p.name,
        number: p.number,
        position: p.position,
        goals: p.goals,
        matchesCount: p.matchesCount,
        assists: p.assists,
        rating: p.rating,
        image: p.image,
      },
    });
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

async function ensureCountyAndCityChampionships(ownerId) {
  // Update main national championship scope
  await prisma.championship.updateMany({
    where: { name: "Liga Pro România 2026" },
    data: { scope: "national", county: null, city: null },
  });

  const COUNTY_CHAMPIONSHIPS = [
    {
      name: "Cupa Națională a României 2026",
      sport: "Fotbal",
      format: "knockout",
      season: "2025-2026",
      scope: "national",
      county: null,
      city: null,
      description: "Competiție cu eliminare directă deschisă tuturor cluburilor din România.",
      teams: ["FCSB", "CFR Cluj", "Universitatea Craiova", "Rapid"],
    },
    {
      name: "Superliga Națională de Baschet Pro",
      sport: "Baschet",
      format: "round_robin",
      season: "2025-2026",
      scope: "national",
      county: null,
      city: null,
      description: "Campionat Național de Baschet cu participarea echipelor din toate regiunile.",
      teams: ["U-BT Cluj-Napoca", "CSM CSU Oradea", "CS Dinamo București", "SCM Timișoara"],
    },
    {
      name: "Campionatul Județean Timiș - Liga 4",
      sport: "Fotbal",
      format: "round_robin",
      season: "2025-2026",
      scope: "judetean",
      county: "Timiș",
      city: "Timișoara",
      description: "Campionatul județean de elită al Județului Timiș cu meciuri pe arenele locale.",
      teams: ["CS Timișul Șag", "CS Sânandrei Timiș", "Unirea Sânnicolau Mare", "CSM Lugoj"],
    },
    {
      name: "Campionatul Municipal Timișoara",
      sport: "Fotbal",
      format: "groups_knockout",
      season: "2025-2026",
      scope: "oras",
      county: "Timiș",
      city: "Timișoara",
      description: "Turneu municipal de minifotbal și fotbal amator din municipiul Timișoara.",
      teams: ["Galaxy Timișoara", "Vasport United", "Bega Ripensia", "Poli Studențesc"],
    },
    {
      name: "Liga Județeană Cluj - Elite",
      sport: "Fotbal",
      format: "round_robin",
      season: "2025-2026",
      scope: "judetean",
      county: "Cluj",
      city: "Cluj-Napoca",
      description: "Competiție județeană de minifotbal și fotbal din Județul Cluj.",
      teams: ["Viitorul Cluj", "Someșul Dej", "Sticla Arieșul Turda", "Unirea Florești"],
    },
    {
      name: "Cupa Municipiului București",
      sport: "Fotbal",
      format: "knockout",
      season: "2025-2026",
      scope: "oras",
      county: "București",
      city: "București",
      description: "Cupa municipală a Capitalei disputată pe arenele sportive din București.",
      teams: ["Progresul Spartac", "Daco-Getica", "Sportul Studențesc", "Metaloglobus"],
    },
    {
      name: "Campionatul Județean Iași",
      sport: "Fotbal",
      format: "round_robin",
      season: "2025-2026",
      scope: "judetean",
      county: "Iași",
      city: "Iași",
      description: "Liga județeană a Moldovei organizată în Județul Iași.",
      teams: ["Știința Miroslava", "Unirea Pașcani", "CSM Pașcani", "Juniorul Iași"],
    },
    {
      name: "Liga Județeană Brașov",
      sport: "Fotbal",
      format: "round_robin",
      season: "2025-2026",
      scope: "judetean",
      county: "Brașov",
      city: "Brașov",
      description: "Competiție sportivă a Județului Brașov cu meciuri la poalele Tâmpei.",
      teams: ["Olimpic Cetate Râșnov", "Kids Tâmpa Brașov", "Precizia Săcele", "Colțea Brașov"],
    },
    {
      name: "Cupa Litoralului Constanța",
      sport: "Volei",
      format: "groups_knockout",
      season: "2025-2026",
      scope: "judetean",
      county: "Constanța",
      city: "Constanța",
      description: "Turneu de volei pe plajă și sală din Județul Constanța.",
      teams: ["Tomis Constanța", "Marina Mangalia", "Axiopolis Cernavodă", "CS Năvodari"],
    },
    {
      name: "Campionatul Municipal Oradea",
      sport: "Baschet",
      format: "round_robin",
      season: "2025-2026",
      scope: "oras",
      county: "Bihor",
      city: "Oradea",
      description: "Liga urbană de baschet din municipiul Oradea, Județul Bihor.",
      teams: ["Crișul Oradea", "Bihoreana Lions", "Lotus Oradea", "Vulturii Bihor"],
    },
    {
      name: "Liga Banatului Arad",
      sport: "Fotbal",
      format: "round_robin",
      season: "2025-2026",
      scope: "judetean",
      county: "Arad",
      city: "Arad",
      description: "Campionat județean în Județul Arad.",
      teams: ["Șoimii Lipova", "Progresul Pecica", "Gloria Lunca-Teuz Cermei", "Frontiera Curtici"],
    },
    {
      name: "Cupa Olteniei Craiova",
      sport: "Fotbal",
      format: "knockout",
      season: "2025-2026",
      scope: "judetean",
      county: "Dolj",
      city: "Craiova",
      description: "Turneu de fotbal județean din Județul Dolj.",
      teams: ["Metaloglobus Craiova", "Tractorul Cetate", "Viitorul Cârcea", "Dunărea Calafat"],
    },
    {
      name: "Liga Municipală Sibiu",
      sport: "Fotbal",
      format: "round_robin",
      season: "2025-2026",
      scope: "oras",
      county: "Sibiu",
      city: "Sibiu",
      description: "Campionat de fotbal municipal din Sibiu.",
      teams: ["Voința Sibiu", "Inter Sibiu", "FC Avrig", "Sparta Mediaș"],
    },
  ];

  for (const c of COUNTY_CHAMPIONSHIPS) {
    const existing = await prisma.championship.findFirst({
      where: { name: c.name },
    });

    if (!existing) {
      const created = await prisma.championship.create({
        data: {
          ownerId,
          name: c.name,
          sport: c.sport,
          format: c.format,
          season: c.season,
          scope: c.scope,
          county: c.county,
          city: c.city,
          startDate: new Date(),
          isBracketPublished: true,
          description: c.description,
        },
      });

      for (const tName of c.teams) {
        await prisma.team.create({
          data: {
            championshipId: created.id,
            name: tName,
            shortName: tName.substring(0, 3).toUpperCase(),
            color: "#1e293b",
          },
        });
      }
    } else {
      await prisma.championship.update({
        where: { id: existing.id },
        data: {
          scope: c.scope,
          county: c.county,
          city: c.city,
        },
      });
    }
  }

  console.log(`[seed] seeded/updated county, city, and national championships across Romania`);
}

async function main() {
  let arenaOwner = null;
  for (const s of SEEDS) {
    const u = await ensureUser(s);
    if (s.role === "arena_owner") arenaOwner = u;
  }
  await ensureReferees();
  if (arenaOwner) {
    await ensureVenues(arenaOwner.id);
  }
  const adminEmail = SEEDS[0].email;
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) {
    await ensureDemoChampionship(admin.id);
    await ensureCountyAndCityChampionships(admin.id);
  }

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
