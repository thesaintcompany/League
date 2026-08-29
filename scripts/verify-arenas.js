const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EXPECTED_TIMIS_ARENAS = [
  "Arena Viola",
  "Stadion Galaxy Timișoara",
  "Premier Arena",
  "Davia Sport",
  "Tonomatul de Fotbal",
  "Baza Sportivă nr. 2 Politehnica",
  "Berlin Sport Club",
  "Friend's Arena S.R.L.",
  "Helios Sport Club",
];

async function main() {
  console.log("Checking arenas in SQLite database...\n");

  const alborzCheck = await prisma.venue.findMany({
    where: { name: { contains: "Alborz" } },
  });
  console.log(`Alborz presence in DB: ${alborzCheck.length} (Expected: 0)`);
  if (alborzCheck.length > 0) {
    console.error("ERROR: Alborz still exists in DB!");
  } else {
    console.log("CONFIRMED: Alborz is completely deleted.");
  }

  const totalVenues = await prisma.venue.count();
  console.log(`Total arenas in database: ${totalVenues}`);

  const timisVenues = await prisma.venue.findMany({
    where: { name: { in: EXPECTED_TIMIS_ARENAS } },
    orderBy: { name: "asc" },
  });

  console.log(`\nFound ${timisVenues.length}/${EXPECTED_TIMIS_ARENAS.length} requested Timiș arenas:`);
  for (const v of timisVenues) {
    console.log(`  - [${v.name}] | Tel: ${v.phone} | Web: ${v.website} | Rating: ★ ${v.rating} (${v.reviewCount}) | Active: ${v.isActive}`);
  }

  if (timisVenues.length === EXPECTED_TIMIS_ARENAS.length && alborzCheck.length === 0) {
    console.log("\nALL CHECKS PASSED!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
