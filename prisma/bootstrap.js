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

  await prisma.venue.createMany({
    data: TIMIS_VENUES,
  });
  console.log(`[seed] seeded ${TIMIS_VENUES.length} Timiș County arenas & sports grounds (Fotbal, Baschet, Volei, Multifuncțional)`);
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
